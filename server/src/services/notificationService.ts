/**
 * Real-time notification service.
 *
 * ## Why this file was empty
 *
 * It sat at 0 bytes while seven modules imported from it. The server runs through
 * `ts-node --transpile-only`, which strips types without checking them, so the
 * missing module never surfaced at runtime — every call would have thrown
 * `notifyUser is not a function`, inside a `try/catch` or a fire-and-forget call.
 * The effect was that compliance, KYC, dispatch, logistics and messaging
 * notifications were **silently not being sent at all**.
 *
 * A type check would have caught it immediately; the `tsc` step in CI never
 * reached this file because the install failed first.
 *
 * ## What it does
 *
 * Two delivery paths, and the distinction matters:
 *
 *   1. **Persistence** into `notifications` — so a user who was offline, or who
 *      closed the tab, still sees what happened. Without this, a notification is
 *      seen only by someone connected at that instant.
 *   2. **SSE push** to any open `/api/notifications/stream` connection — so a
 *      connected client updates immediately rather than on its next poll.
 *
 * Persistence is attempted first and is **never fatal**. If the database write
 * fails, the live push still goes out: real-time delivery is the more urgent half,
 * and losing it because a write failed would be the wrong trade.
 *
 * ## Fire and forget, deliberately
 *
 * Controllers call `notifyUser` without `await`, on the request path. It therefore
 * returns a promise but never throws synchronously, and every internal step is
 * caught. A failed notification must never fail the action that triggered it — a
 * KYC approval should not return 500 because a notification row could not be
 * written.
 *
 * ## Relationship to `pushNotificationService`
 *
 * That service owns device tokens and push-provider delivery. It calls `notifyUser`
 * lazily as its own SSE broadcast, so this file must not import it at module scope
 * or the two form a cycle. Mobile push is deliberately not duplicated here.
 *
 * ## Known limitation
 *
 * The client registry is in-memory, so this is correct for a single instance. Run
 * more than one process without sticky sessions and a client connected to instance
 * A will not receive a notification dispatched on instance B. Fixing that needs a
 * shared bus (Redis pub/sub or similar), which is a deployment decision rather
 * than a code one — recorded here rather than left to be discovered.
 */

import type { Response } from 'express';
import { pool } from '../config/db';

/** A connected SSE client. */
interface SseClient {
    userId: number;
    res: Response;
    isDriver: boolean;
    connectedAt: number;
}

/**
 * Every open connection.
 *
 * Keyed by a monotonic id rather than by user, because one account can legitimately
 * have several tabs open and each needs its own stream. Keying by user id would
 * silently drop all but the most recent.
 */
const clients = new Map<number, SseClient>();
let nextClientId = 1;

/** Titles by notification type. The body comes from the caller's `data`. */
const TITLES: Record<string, string> = {
    kyc_approved: 'Identity verified',
    kyc_rejected: 'Identity check failed',
    compliance_reviewed: 'Compliance review complete',
    dispatch_offer: 'New job offer',
    driver_assigned: 'Driver on the way',
    new_job: 'New job available',
    new_order_delivery: 'New delivery available',
    job_accepted: 'Job accepted',
    job_assigned: 'Job assigned to you',
    job_status_updated: 'Job status updated',
    job_cancelled: 'Job cancelled',
    delivery_completed: 'Delivery completed',
    driver_earned: 'You earned',
    new_message: 'New message',
    push_notification: 'Notification',
};

/** Human-readable body: the caller's own message if it sent one. */
function bodyFor(type: string, data: Record<string, unknown>): string {
    if (typeof data.message === 'string' && data.message.trim() !== '') return data.message;
    if (typeof data.title === 'string' && data.title.trim() !== '') return data.title;
    return TITLES[type] ?? 'You have a new notification';
}

/** Write one frame to one client, evicting it if the socket has gone. */
function writeToClient(id: number, client: SseClient, payload: string): void {
    try {
        client.res.write(payload);
    } catch (error) {
        // A dead socket throws rather than reporting. Drop it, or the map grows
        // without bound and every later broadcast pays for the failures.
        clients.delete(id);
        console.warn(`[notifications] dropped client ${id} (user ${client.userId}): ${(error as Error).message}`);
    }
}

/** Push a frame to every connection a user has open. Returns how many it reached. */
function broadcastToUser(userId: number, event: string, data: Record<string, unknown>): number {
    const frame = `event: ${event}\ndata: ${JSON.stringify({ type: event, data, at: new Date().toISOString() })}\n\n`;
    let delivered = 0;

    for (const [id, client] of clients) {
        if (client.userId !== userId) continue;
        writeToClient(id, client, frame);
        delivered++;
    }

    return delivered;
}

/**
 * Persist and deliver one notification.
 *
 * Returns the number of live connections reached. Reaching nobody is normal — the
 * user is away — and is precisely why the row is written.
 */
async function dispatch(
    userId: number,
    type: string,
    data: Record<string, unknown>,
    title?: string,
): Promise<number> {
    const resolvedTitle = title ?? TITLES[type] ?? 'Notification';
    const message = bodyFor(type, data);

    // Persist first, so the durable record exists even if the push below is lost.
    //
    // Column names are taken from the **live** table, which does not match the
    // migration in this repo: the deployed `public.notifications` has
    // `notification_id` as its key and stores the text in `body`, whereas
    // `src/migrations/042_notifications_table.sql` declares `id` and `message`.
    // Writing the migration's names would have failed on every insert — caught,
    // logged, and therefore silent, which is precisely the failure this service
    // exists to end. Verified against the database rather than the file.
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, body, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, type.slice(0, 50), resolvedTitle.slice(0, 255), message, JSON.stringify(data)],
        );
    } catch (error) {
        // Logged, not thrown. A notification that cannot be stored must not break
        // the operation that raised it.
        console.error(`[notifications] could not persist "${type}" for user ${userId}:`, (error as Error).message);
    }

    return broadcastToUser(userId, type, { ...data, title: resolvedTitle, message });
}

/**
 * Notify one user.
 *
 * Warm on purpose: callers use this both fire-and-forget (`notifyUser(...)`, no
 * `await`) and awaited (`await notifyAllDrivers(...)`). Returning a promise means
 * the first never throws synchronously and the second still works.
 *
 * Every internal path catches, so a caller that ignores the returned promise
 * cannot produce an unhandled rejection.
 */
export function notifyUser(
    userId: number,
    type: string,
    data: Record<string, unknown> = {},
    title?: string,
): Promise<number> {
    if (!Number.isInteger(userId) || userId <= 0) {
        console.warn(`[notifications] refusing to notify invalid user id: ${String(userId)}`);
        return Promise.resolve(0);
    }
    return dispatch(userId, type, data, title).catch((error) => {
        console.error(`[notifications] dispatch failed for user ${userId}:`, error);
        return 0;
    });
}

/** Connection counts for the admin stats endpoint. */
export function getConnectionStats(): {
    total: number;
    drivers: number;
    users: number;
    userCount: number;
} {
    let drivers = 0;
    const uniqueUsers = new Set<number>();

    for (const client of clients.values()) {
        if (client.isDriver) drivers++;
        uniqueUsers.add(client.userId);
    }

    return {
        /** Open connections — more than one per account if several tabs are open. */
        total: clients.size,
        drivers,
        /** Connections not flagged as drivers. */
        users: clients.size - drivers,
        /**
         * Distinct accounts connected. `total` counts sockets, which is not the
         * number an admin means by "how many users are online", so both are given
         * rather than one being guessed at.
         */
        userCount: uniqueUsers.size,
    };
}

/**
 * Register an SSE client.
 *
 * The response headers are set here so every caller gets them. A stream without
 * `no-cache` and `keep-alive` is buffered by proxies and arrives in bursts, or not
 * at all.
 *
 * A `connected` event is sent immediately: it flushes the headers so the browser
 * fires `onopen` now rather than waiting for the first real notification, which
 * could be hours away.
 */
export function registerClient(userId: number, res: Response, isDriver = false): void {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        // Stops nginx buffering the stream, which otherwise holds frames until the
        // buffer fills and makes real-time delivery look broken.
        'X-Accel-Buffering': 'no',
    });

    const id = nextClientId++;
    clients.set(id, { userId, res, isDriver, connectedAt: Date.now() });

    console.log(
        `[notifications] client ${id} connected (user ${userId}${isDriver ? ', driver' : ''}); ${clients.size} open`,
    );

    writeToClient(id, clients.get(id)!, `event: connected\ndata: ${JSON.stringify({ clientId: id })}\n\n`);

    // Express emits 'close' on the response when the client goes away. Registering
    // here rather than in the route means a caller cannot leak a client by
    // forgetting to clean up.
    res.on('close', () => {
        if (clients.delete(id)) {
            console.log(`[notifications] client ${id} disconnected (user ${userId}); ${clients.size} open`);
        }
    });
}

/**
 * Notify every driver.
 *
 * The recipient list comes from `driver_profiles`, not from who happens to be
 * connected, because those are different things: a driver who is offline should
 * still get the notification when they next open the app, and only the persisted
 * row makes that possible. Pushing solely to connected sockets would offer work
 * only to whoever is looking at the screen at that moment.
 *
 * Awaited by its callers, so this resolves once every recipient has been handled.
 * One driver failing does not stop the rest.
 */
export async function notifyAllDrivers(
    type: string,
    data: Record<string, unknown> = {},
    title?: string,
): Promise<number> {
    let driverIds: number[] = [];

    try {
        const result = await pool.query(`SELECT user_id FROM driver_profiles WHERE user_id IS NOT NULL`);
        driverIds = result.rows.map((row: { user_id: number }) => row.user_id);
    } catch (error) {
        console.error(`[notifications] could not list drivers for "${type}":`, (error as Error).message);
        // Fall back to connected drivers so an in-flight offer is not lost entirely
        // because the table could not be read.
        for (const client of clients.values()) {
            if (client.isDriver) driverIds.push(client.userId);
        }
        driverIds = [...new Set(driverIds)];
    }

    // Sequential rather than Promise.all: a long driver list would otherwise open
    // one connection per driver simultaneously and can exhaust the pool.
    let notified = 0;
    for (const driverId of driverIds) {
        try {
            await dispatch(driverId, type, data, title);
            notified++;
        } catch (error) {
            console.error(`[notifications] driver ${driverId} failed for "${type}":`, (error as Error).message);
        }
    }

    return notified;
}

/**
 * Mark a driver as online for the in-memory connection view.
 *
 * Deliberately does **not** write to the database. The authoritative `is_online`
 * value is already updated by the controller that calls this, and writing it here
 * as well would mean two writers for one column with no transaction between them —
 * the kind of duplication that produces a state nobody can explain later.
 *
 * What it does do is push a marker to that driver's open streams, so a second tab
 * reflects the change immediately.
 */
export function setDriverOnline(userId: number, isOnline: boolean): void {
    for (const [id, client] of clients) {
        if (client.userId !== userId) continue;
        client.isDriver = true;
        writeToClient(id, client, `event: driver_status\ndata: ${JSON.stringify({ is_online: isOnline })}\n\n`);
    }
}

export default {
    notifyUser,
    notifyAllDrivers,
    setDriverOnline,
    registerClient,
    getConnectionStats,
};
