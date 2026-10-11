import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Seller / member applications from the SKN Bridge Trade marketplace.
 *
 * Those applications are submitted on the public marketplace site and land in
 * the shared database's `islandhub` schema — a different schema from everything
 * else this server touches, which is why every table reference below is
 * schema-qualified. The pool has no `search_path`, so an unqualified name would
 * resolve against `public` and either fail with "relation does not exist" or,
 * worse, find an unrelated table.
 *
 * Until this controller existed the applications were **write-only**: the public
 * form inserted them and nothing in either application could read them back, so
 * a grower could apply and no one would ever see it. These endpoints are the read
 * side.
 *
 * ## Status transitions
 *
 * The column is an enum: received → contacted → verified → approved/rejected.
 * `assertTransition` allows forward movement, a jump to rejected from anywhere,
 * and a correction back to `received` — and refuses to move a decided
 * application, because silently un-approving someone who has already been told
 * they are a member is worse than an error message.
 *
 * ## What this deliberately does not do
 *
 * Approving does **not** create a seller record. That is the next step and it
 * needs a decision first: the platform's canonical vendor is `public.vendors`
 * (linked to `public.users` by `user_id`), while the marketplace's own orders and
 * listings reference `islandhub.sellers`. Approving should probably create one
 * and link the other, and picking that without confirming the vendor model would
 * bake in a guess. See the pull request description.
 */

const SCHEMA = process.env.ISLANDHUB_SCHEMA?.trim() || 'islandhub';

/** Table reference for the marketplace schema. Only ever passed literals. */
const t = (name: string): string => {
    if (!/^[a-z_][a-z0-9_]*$/.test(SCHEMA)) throw new Error(`Unsafe schema name: ${SCHEMA}`);
    if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error(`Unsafe table name: ${name}`);
    return `${SCHEMA}.${name}`;
};

const APPLICATIONS = t('member_applications');

type ApplicationStatus = 'received' | 'contacted' | 'verified' | 'approved' | 'rejected';

const STATUSES: ApplicationStatus[] = ['received', 'contacted', 'verified', 'approved', 'rejected'];

const isStatus = (value: unknown): value is ApplicationStatus =>
    typeof value === 'string' && (STATUSES as string[]).includes(value);

/** Statuses that represent a decision, which may not be quietly reversed. */
const DECIDED: ApplicationStatus[] = ['approved', 'rejected'];

/**
 * May an application move between these two states?
 *
 * Forward through the pipeline, straight to rejected from anywhere, or a
 * correction back to received. Nothing may leave a decided state.
 */
function assertTransition(from: ApplicationStatus, to: ApplicationStatus): string | null {
    if (from === to) return null;
    if (DECIDED.includes(from)) {
        return `This application is already ${from} and cannot be moved to ${to}.`;
    }
    if (to === 'rejected' || to === 'received') return null;

    const order = STATUSES.indexOf(to);
    const current = STATUSES.indexOf(from);
    if (order <= current) {
        return `Cannot move backwards from ${from} to ${to}.`;
    }
    return null;
}

/** Shape one row for the admin UI, mapping snake_case and coercing what pg returns. */
function shapeApplication(row: Record<string, unknown>) {
    return {
        id: row.id,
        reference: row.reference,
        name: row.name,
        phone: row.phone,
        island: row.island,
        role: row.role,
        products: Array.isArray(row.products) ? row.products : [],
        fulfilment: Array.isArray(row.fulfilment) ? row.fulfilment : [],
        addons: Array.isArray(row.addons) ? row.addons : [],
        volume: row.volume ?? null,
        notes: row.notes ?? null,
        status: row.status,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ''),
    };
}

/**
 * `GET /api/admin/member-applications`
 *
 * Query: `status` (one of the five, or `pending` for everything undecided),
 * `island`, `limit` (default 100, max 500), `offset`.
 *
 * Defaults to **undecided** rather than everything: this screen exists to show
 * work that needs doing, and an operator opening it should not have to scroll
 * past a year of approved applications to find today's.
 */
export const getMemberApplications = async (req: Request, res: Response) => {
    try {
        const { status, island } = req.query as { status?: string; island?: string };

        const limitRaw = Number(req.query.limit ?? 100);
        const limit = Number.isFinite(limitRaw) ? Math.min(500, Math.max(1, Math.floor(limitRaw))) : 100;
        const offsetRaw = Number(req.query.offset ?? 0);
        const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;

        const where: string[] = [];
        const params: unknown[] = [];

        if (status === 'pending') {
            where.push(`status not in ('approved', 'rejected')`);
        } else if (status !== undefined && status !== '') {
            if (!isStatus(status)) {
                return res.status(400).json({ message: `status must be one of: ${STATUSES.join(', ')}, pending` });
            }
            params.push(status);
            where.push(`status = $${params.length}`);
        }

        if (island !== undefined && island !== '') {
            params.push(island);
            where.push(`island = $${params.length}`);
        }

        const clause = where.length ? `where ${where.join(' and ')}` : '';

        const countResult = await pool.query(`select count(*)::int as total from ${APPLICATIONS} ${clause}`, params);

        params.push(limit, offset);
        const result = await pool.query(
            `select id, reference, name, phone, island, role, products, fulfilment, addons,
                    volume, notes, status, created_at
               from ${APPLICATIONS}
               ${clause}
              order by
                -- Undecided first, then oldest first within that: the longest wait
                -- is the most urgent, and a newest-first list buries it.
                case when status in ('approved', 'rejected') then 1 else 0 end,
                created_at asc
              limit $${params.length - 1} offset $${params.length}`,
            params,
        );

        // Counts per status, so the UI can show badges without a second call.
        const counts = await pool.query(
            `select status, count(*)::int as n from ${APPLICATIONS} group by status`,
        );
        const byStatus: Record<string, number> = {};
        for (const row of counts.rows) byStatus[row.status] = row.n;

        return res.json({
            applications: result.rows.map(shapeApplication),
            total: countResult.rows[0]?.total ?? 0,
            limit,
            offset,
            counts: byStatus,
        });
    } catch (error) {
        console.error('Get member applications error:', error);
        return res.status(500).json({ message: 'Could not load applications' });
    }
};

/** `GET /api/admin/member-applications/:id` */
export const getMemberApplication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ message: 'Invalid id' });

        const result = await pool.query(
            `select id, reference, name, phone, island, role, products, fulfilment, addons,
                    volume, notes, status, created_at
               from ${APPLICATIONS} where id = $1`,
            [id],
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Application not found' });
        return res.json(shapeApplication(result.rows[0]));
    } catch (error) {
        console.error('Get member application error:', error);
        return res.status(500).json({ message: 'Could not load the application' });
    }
};

/**
 * `PATCH /api/admin/member-applications/:id/status`
 *
 * Body: `{ status }`. Read-modify-write inside a transaction with `for update`,
 * so two operators working the same queue cannot both move an application and
 * have the second silently overwrite the first.
 */
export const updateMemberApplicationStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ message: 'Invalid id' });

    const next = (req.body ?? {}).status;
    if (!isStatus(next)) {
        return res.status(400).json({ message: `status must be one of: ${STATUSES.join(', ')}` });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const current = await client.query(`select status from ${APPLICATIONS} where id = $1 for update`, [id]);
        if (current.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Application not found' });
        }

        const from = current.rows[0].status as ApplicationStatus;
        const problem = assertTransition(from, next);
        if (problem) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: problem });
        }

        const updated = await client.query(
            `update ${APPLICATIONS} set status = $1 where id = $2
              returning id, reference, name, phone, island, role, products, fulfilment, addons,
                        volume, notes, status, created_at`,
            [next, id],
        );

        await client.query('COMMIT');
        return res.json(shapeApplication(updated.rows[0]));
    } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        console.error('Update member application status error:', error);
        return res.status(500).json({ message: 'Could not update the application' });
    } finally {
        client.release();
    }
};
