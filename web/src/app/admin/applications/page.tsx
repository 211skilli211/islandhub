'use client';

/**
 * Marketplace applications queue (SKN Bridge Trade / CTC).
 *
 * These are seller and member applications submitted on the public marketplace
 * site. Until this page existed they were write-only: the form inserted them and
 * nothing could read them back.
 *
 * Uses semantic theme tokens only: `background-*`, `text-*`, `border-*`,
 * `accent-*`, `success-*`, `danger-*`. Those are the ones actually declared in
 * the `@theme` block in `globals.css` and the ones the theme switcher drives.
 *
 * Deliberately avoided, after checking `globals.css`:
 *   - `ink-tertiary`, `surface-tertiary`, `ink-primary` - not declared anywhere,
 *     so Tailwind emits nothing and the class silently has no effect. Several
 *     existing admin pages use these.
 *   - hardcoded palette colours (`lime-100`, `papaya-700`, `teal-500`) - not part
 *     of the theme, so they would not follow a theme change.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';

type ApplicationStatus = 'received' | 'contacted' | 'verified' | 'approved' | 'rejected';

interface Application {
    id: string;
    reference: string;
    name: string;
    phone: string;
    island: string;
    role: string;
    products: string[];
    fulfilment: string[];
    addons: string[];
    volume: string | null;
    notes: string | null;
    status: ApplicationStatus;
    createdAt: string;
}

interface QueueResponse {
    applications: Application[];
    total: number;
    limit: number;
    offset: number;
    counts: Record<string, number>;
}

/** Forward-only, matching the server's transition guard. */
const NEXT_STEP: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
    received: 'contacted',
    contacted: 'verified',
    verified: 'approved',
};

/** Statuses are semantic states, so they use the semantic tokens. */
const STATUS_TONE: Record<ApplicationStatus, string> = {
    received: 'bg-background-tertiary text-text-secondary',
    contacted: 'bg-background-tertiary text-text-secondary',
    verified: 'bg-accent-muted text-accent-secondary',
    approved: 'bg-success-secondary/15 text-success-secondary',
    rejected: 'bg-danger-primary/15 text-danger-primary',
};

const FILTERS: { label: string; value: string }[] = [
    { label: 'Needs attention', value: 'pending' },
    { label: 'Received', value: 'received' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Verified', value: 'verified' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: '' },
];

export default function AdminApplicationsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const [data, setData] = useState<QueueResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [rejecting, setRejecting] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    const load = useCallback(async (status: string) => {
        setLoading(true);
        try {
            const query = status === '' ? '' : `?status=${encodeURIComponent(status)}`;
            const res = await api.get(`/admin/member-applications${query}`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to load applications', err);
            toast.error('Could not load applications');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        void load(filter);
    }, [filter, isAuthenticated, load]);

    const move = async (application: Application, status: ApplicationStatus) => {
        setBusyId(application.id);
        try {
            const res = await api.patch(`/admin/member-applications/${application.id}/status`, { status });
            // Approving creates the seller record, and the server reports what it
            // did. Surfaced rather than swallowed: the operator is the only person
            // who can tell a new seller they still need to sign up with an email,
            // because an application never carries one.
            if (status === 'approved' && res.data?.sellerNote) {
                toast.success(`${application.name} approved. ${res.data.sellerNote}`, { duration: 8000 });
            } else {
                toast.success(`${application.name} moved to ${status}`);
            }
            setRejecting(null);
            await load(filter);
        } catch (err: unknown) {
            // The server refuses illegal transitions with 409 and a reason. Show
            // that rather than a generic failure, because "this application is
            // already approved" is actionable and "something went wrong" is not.
            const message =
                typeof err === 'object' && err !== null && 'response' in err
                    ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                      'Could not update the application')
                    : 'Could not update the application';
            toast.error(message);
        } finally {
            setBusyId(null);
        }
    };

    const counts = data?.counts ?? {};
    const undecided = (counts.received ?? 0) + (counts.contacted ?? 0) + (counts.verified ?? 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-text-primary">Marketplace applications</h2>
                <p className="text-text-tertiary">
                    Seller and member applications from the SKN Bridge Trade marketplace
                    {undecided > 0 ? ` \u00b7 ${undecided} still need attention` : ''}
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((option) => {
                    const active = filter === option.value;
                    const badge =
                        option.value === 'pending'
                            ? undecided
                            : option.value === ''
                              ? Object.values(counts).reduce((sum, n) => sum + n, 0)
                              : (counts[option.value] ?? 0);
                    return (
                        <button
                            key={option.value || 'all'}
                            type="button"
                            onClick={() => setFilter(option.value)}
                            aria-pressed={active}
                            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                                active
                                    ? 'bg-background-inverse text-text-inverse'
                                    : 'bg-background-secondary text-text-secondary border border-border-primary hover:bg-background-secondary'
                            }`}
                        >
                            {option.label}
                            <span className={`ml-2 tabular-nums ${active ? 'text-text-inverse/70' : 'text-text-tertiary'}`}>{badge}</span>
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12" role="status">
                    <span className="sr-only">Loading applications</span>
                    <div className="w-8 h-8 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
                </div>
            ) : !data || data.applications.length === 0 ? (
                <div className="text-center p-12 bg-background-secondary rounded-2xl border border-border-primary">
                    <p className="text-text-tertiary">
                        {filter === 'pending'
                            ? 'Nothing needs attention. Every application has been decided.'
                            : 'No applications match this filter.'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {data.applications.map((application) => {
                        const next = NEXT_STEP[application.status];
                        const open = expanded === application.id;
                        return (
                            <li
                                key={application.id}
                                className="bg-background-secondary rounded-2xl border border-border-primary overflow-hidden"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                                    <button
                                        type="button"
                                        onClick={() => setExpanded(open ? null : application.id)}
                                        aria-expanded={open}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-text-primary">{application.name}</span>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_TONE[application.status]}`}
                                            >
                                                {application.status}
                                            </span>
                                            <span className="font-mono text-[11px] text-text-tertiary">{application.reference}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-text-tertiary">
                                            {application.role} on {application.island} &middot; {application.phone}
                                        </p>
                                        {!open && application.products.length > 0 ? (
                                            <p className="mt-1 truncate text-sm text-text-secondary">
                                                {application.products.slice(0, 4).join(', ')}
                                                {application.products.length > 4 ? ` +${application.products.length - 4} more` : ''}
                                            </p>
                                        ) : null}
                                    </button>

                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        {next ? (
                                            <button
                                                type="button"
                                                disabled={busyId === application.id}
                                                onClick={() => void move(application, next)}
                                                className="rounded-full bg-background-inverse px-4 py-2 text-sm font-bold text-text-inverse disabled:opacity-50"
                                            >
                                                {busyId === application.id ? 'Saving\u2026' : `Mark ${next}`}
                                            </button>
                                        ) : null}
                                        {application.status !== 'rejected' ? (
                                            <button
                                                type="button"
                                                disabled={busyId === application.id}
                                                onClick={() => setRejecting(open ? null : application.id)}
                                                className="rounded-full border border-border-primary px-4 py-2 text-sm font-bold text-text-secondary hover:bg-background-secondary disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {open ? (
                                    <dl className="grid gap-x-8 gap-y-3 border-t border-border-primary bg-background-secondary p-5 text-sm sm:grid-cols-2">
                                        <Row label="Applied" value={new Date(application.createdAt).toLocaleString()} />
                                        <Row label="Volume" value={application.volume ?? '\u2014'} />
                                        <Row
                                            label="Supplies"
                                            value={application.products.length ? application.products.join(', ') : '\u2014'}
                                        />
                                        <Row
                                            label="Fulfilment"
                                            value={application.fulfilment.length ? application.fulfilment.join(', ') : '\u2014'}
                                        />
                                        <Row
                                            label="Add-ons requested"
                                            value={application.addons.length ? application.addons.join(', ') : 'None'}
                                        />
                                        <Row label="Phone" value={application.phone} />
                                        {application.notes ? (
                                            <div className="sm:col-span-2">
                                                <dt className="font-bold text-text-secondary">Notes</dt>
                                                <dd className="mt-1 whitespace-pre-wrap text-text-secondary">{application.notes}</dd>
                                            </div>
                                        ) : null}
                                    </dl>
                                ) : null}

                                {rejecting === application.id ? (
                                    <div className="border-t border-border-primary bg-background-secondary p-5">
                                        <p className="text-sm font-bold text-text-primary">
                                            Reject this application?
                                        </p>
                                        <p className="mt-1 text-sm text-text-tertiary">
                                            This is final &mdash; a rejected application cannot be moved back. The applicant is not
                                            emailed automatically, so call them on {application.phone}.
                                        </p>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                type="button"
                                                disabled={busyId === application.id}
                                                onClick={() => void move(application, 'rejected')}
                                                className="rounded-full bg-danger-primary px-4 py-2 text-sm font-bold text-text-inverse disabled:opacity-50"
                                            >
                                                {busyId === application.id ? 'Saving\u2026' : 'Yes, reject'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRejecting(null)}
                                                className="rounded-full border border-border-primary px-4 py-2 text-sm font-bold text-text-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}

            {data && data.total > data.applications.length ? (
                <p className="text-sm text-text-tertiary">
                    Showing {data.applications.length} of {data.total}. Narrow the filter to see the rest.
                </p>
            ) : null}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-bold text-text-secondary">{label}</dt>
            <dd className="mt-0.5 text-text-secondary">{value}</dd>
        </div>
    );
}
