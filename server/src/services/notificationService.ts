import { Response } from 'express';

// Store active SSE connections: userId -> Response object
const clients: Map<number, Response[]> = new Map();

// Store driver connections separately for broadcast to all drivers
const driverClients: Map<number, Response> = new Map();

// Store online status for drivers to filter broadcasts
const driverOnlineStatus: Map<number, boolean> = new Map();

/**
 * Register a client for SSE notifications
 */
export const registerClient = (userId: number, res: Response, isDriver: boolean = false) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

    // Add to clients map
    const existing = clients.get(userId) || [];
    existing.push(res);
    clients.set(userId, existing);

    // If driver, also add to driver clients
    if (isDriver) {
        driverClients.set(userId, res);
        // By default, we might not know their status yet, 
        // but toggleDriverStatus will update it when they switch.
    }

    console.log(`[SSE] Client connected: userId=${userId}, isDriver=${isDriver}, total clients=${clients.size}`);

    // Handle disconnect
    res.on('close', () => {
        const userClients = clients.get(userId) || [];
        const index = userClients.indexOf(res);
        if (index > -1) {
            userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
            clients.delete(userId);
        } else {
            clients.set(userId, userClients);
        }

        if (isDriver) {
            driverClients.delete(userId);
            // We keep driverOnlineStatus because they might reconnect
        }

        console.log(`[SSE] Client disconnected: userId=${userId}`);
    });
};

/**
 * Update a driver's online visibility status
 */
export const setDriverOnline = (userId: number, isOnline: boolean) => {
    driverOnlineStatus.set(userId, isOnline);
    console.log(`[SSE] Driver online status updated: userId=${userId}, isOnline=${isOnline}`);
};

/**
 * Send notification to a specific user
 */
export const notifyUser = (userId: number, event: string, data: any) => {
    const userClients = clients.get(userId);
    if (userClients && userClients.length > 0) {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        userClients.forEach(client => {
            try {
                client.write(message);
            } catch (error) {
                console.error(`[SSE] Error sending to user ${userId}:`, error);
            }
        });
        console.log(`[SSE] Sent ${event} to user ${userId}`);
        return true;
    }
    return false;
};

/**
 * Broadcast notification to all connected drivers (who are ONLINE)
 */
export const notifyAllDrivers = (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    let sentCount = 0;

    driverClients.forEach((client, userId) => {
        // Only notify drivers who have explicitly toggled "Online"
        if (driverOnlineStatus.get(userId) !== true) return;

        try {
            client.write(message);
            sentCount++;
        } catch (error) {
            console.error(`[SSE] Error broadcasting to driver ${userId}:`, error);
        }
    });

    console.log(`[SSE] Broadcast ${event} to ${sentCount} online drivers`);
    return sentCount;
};

/**
 * Get connection stats
 */
export const getConnectionStats = () => ({
    totalUsers: clients.size,
    totalDrivers: driverClients.size,
    totalOnlineDrivers: Array.from(driverOnlineStatus.values()).filter(v => v === true).length,
    totalConnections: Array.from(clients.values()).reduce((sum, arr) => sum + arr.length, 0)
});
