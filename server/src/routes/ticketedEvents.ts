import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

const router = Router({ mergeParams: true });

function getPool(req: Request): Pool {
  return (req.app as any).locals.pool;
}

function generateQRToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function requireAuth(req: Request, res: Response, next: Function) {
  // Support both passport JWT and session auth
  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  (req as any).userId = userId;
  next();
}

// GET / — List published events (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const { category, search, status = 'published', limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT e.*, u.name as organizer_name,
        COALESCE(json_agg(
          json_build_object(
            'id', tt.id, 'name', tt.name, 'price', tt.price,
            'quantity', tt.quantity, 'sold', tt.sold,
            'description', tt.description, 'perks', tt.perks
          )
        ) FILTER (WHERE tt.id IS NOT NULL), '[]') as ticket_tiers
      FROM events e
      LEFT JOIN users u ON u.id = e.organizer_id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.status = $1
    `;
    const params: any[] = [status];
    let pIdx = 2;

    if (category) { sql += ` AND e.category = $${pIdx++}`; params.push(category); }
    if (search) { sql += ` AND (e.title ILIKE $${pIdx} OR e.description ILIKE $${pIdx})`; params.push(`%${search}%`); pIdx++; }

    sql += ` GROUP BY e.id, u.name ORDER BY e.start_date ASC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(sql, params);
    res.json({ events: result.rows });
  } catch (err: any) {
    console.error('Events list error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /:id — Single event
router.get('/:eventId', async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const result = await pool.query(`
      SELECT e.*, u.name as organizer_name,
        COALESCE(json_agg(
          json_build_object(
            'id', tt.id, 'name', tt.name, 'price', tt.price,
            'quantity', tt.quantity, 'sold', tt.sold,
            'description', tt.description, 'perks', tt.perks
          )
        ) FILTER (WHERE tt.id IS NOT NULL), '[]') as ticket_tiers
      FROM events e
      LEFT JOIN users u ON u.id = e.organizer_id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, u.name
    `, [req.params.eventId]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST / — Create event
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const userId = (req as any).userId;
    const { title, description, venue, address, start_date, end_date, category, image_url, banner_url, total_capacity, ticket_tiers } = req.body;

    const ev = await pool.query(`
      INSERT INTO events (title, description, venue, address, start_date, end_date, category, image_url, banner_url, organizer_id, status, total_capacity, tickets_sold)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published',$11,0) RETURNING *
    `, [title, description, venue, address, start_date, end_date, category, image_url, banner_url, userId, total_capacity || 100]);

    const event = ev.rows[0];
    if (ticket_tiers?.length) {
      for (const t of ticket_tiers) {
        await pool.query(`INSERT INTO ticket_tiers (event_id, name, price, quantity, sold, description, perks) VALUES ($1,$2,$3,$4,0,$5,$6)`,
          [event.event_id, t.name, t.price, t.quantity, t.description || '', t.perks || []]);
      }
    }
    res.status(201).json(event);
  } catch (err: any) {
    console.error('Event create error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// POST /tickets/purchase — Buy a ticket
router.post('/tickets/purchase', requireAuth, async (req: Request, res: Response) => {
  const client = await getPool(req).connect();
  try {
    const userId = (req as any).userId;
    const { event_id, tier_id, quantity = 1, holder_name, holder_email } = req.body;

    await client.query('BEGIN');

    const tierRes = await client.query('SELECT * FROM ticket_tiers WHERE id = $1 AND event_id = $2 FOR UPDATE', [tier_id, event_id]);
    if (!tierRes.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Tier not found' }); }
    if (tierRes.rows[0].sold + quantity > tierRes.rows[0].quantity) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Sold out' }); }

    const qrToken = generateQRToken();
    const ticketRes = await client.query(`
      INSERT INTO tickets (event_id, tier_id, user_id, qr_code, qr_token, status, holder_name, holder_email, purchased_at)
      VALUES ($1,$2,$3,$4,$5,'valid',$6,$7,NOW()) RETURNING *
    `, [event_id, tier_id, userId, qrToken, qrToken, holder_name || '', holder_email || '']);

    await client.query('UPDATE ticket_tiers SET sold = sold + $1 WHERE id = $2', [quantity, tier_id]);
    await client.query('UPDATE events SET tickets_sold = tickets_sold + $1 WHERE id = $2', [quantity, event_id]);
    await client.query('COMMIT');

    res.status(201).json({ ticket: ticketRes.rows[0], qr_token: qrToken });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Purchase error:', err);
    res.status(500).json({ error: 'Purchase failed' });
  } finally { client.release(); }
});

// GET /tickets/my — My tickets
router.get('/tickets/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const result = await pool.query(`
      SELECT t.*,
        json_build_object('id',e.id,'title',e.title,'venue',e.venue,'start_date',e.start_date,'image_url',e.image_url,'category',e.category) as event,
        json_build_object('id',tt.id,'name',tt.name,'price',tt.price) as tier
      FROM tickets t
      LEFT JOIN events e ON e.id = t.event_id
      LEFT JOIN ticket_tiers tt ON tt.id = t.tier_id
      WHERE t.user_id = $1 ORDER BY t.purchased_at DESC
    `, [(req as any).userId]);
    res.json({ tickets: result.rows });
  } catch (err: any) { res.status(500).json({ error: 'Failed' }); }
});

// POST /tickets/verify — Verify QR (staff only)
router.post('/tickets/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const { qr_token } = req.body;
    const tRes = await pool.query(`SELECT t.*, e.title as event_title, tt.name as tier_name FROM tickets t LEFT JOIN events e ON e.id = t.event_id LEFT JOIN ticket_tiers tt ON tt.id = t.tier_id WHERE t.qr_token = $1`, [qr_token]);
    if (!tRes.rows[0]) return res.json({ valid: false, error: 'Not found' });
    const t = tRes.rows[0];
    if (t.status !== 'valid') return res.json({ valid: false, error: `Ticket ${t.status}`, ticket: t });
    await pool.query("UPDATE tickets SET status='used', used_at=NOW() WHERE id=$1", [t.id]);
    res.json({ valid: true, ticket: { ...t, status: 'used' } });
  } catch (err: any) { res.status(500).json({ error: 'Verify failed' }); }
});

// POST /tickets/:id/refund
router.post('/tickets/:id/refund', requireAuth, async (req: Request, res: Response) => {
  const client = await getPool(req).connect();
  try {
    await client.query('BEGIN');
    const tRes = await client.query('SELECT * FROM tickets WHERE id=$1 AND user_id=$2 FOR UPDATE', [req.params.id, (req as any).userId]);
    if (!tRes.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }
    await client.query("UPDATE tickets SET status='refunded' WHERE id=$1", [req.params.id]);
    await client.query('UPDATE ticket_tiers SET sold=GREATEST(0,sold-1) WHERE id=$1', [tRes.rows[0].tier_id]);
    await client.query('UPDATE events SET tickets_sold=GREATEST(0,tickets_sold-1) WHERE id=$1', [tRes.rows[0].event_id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err: any) { await client.query('ROLLBACK'); res.status(500).json({ error: 'Refund failed' }); }
  finally { client.release(); }
});

export default router;
