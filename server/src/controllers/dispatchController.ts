/**
 * Driver Dispatch Controller
 * Handles driver location, dispatch matching, trip lifecycle, and earnings
 */

import { Request, Response } from 'express';
import { pool } from '../config/db';
import { notifyUser } from '../services/notificationService';

const DISPATCH_TIMEOUT_SECONDS = 30;
const MAX_OFFERS_PER_REQUEST = 5;
const PLATFORM_FEE_PERCENT = 0.15;

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface DispatchRequest {
    rider_id: number;
    driver_type: string;
    pickup: Location;
    dropoff: Location;
    estimated_fare?: number;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Generate unique ID
function generateRequestId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate fare based on distance and duration
function calculateFare(distanceKm: number, durationMinutes: number, baseRate: number = 2.50, perKm: number = 1.50, perMin: number = 0.30): number {
    const baseFare = baseRate;
    const distanceFare = distanceKm * perKm;
    const timeFare = durationMinutes * perMin;
    return Math.max(baseFare, baseFare + distanceFare + timeFare);
}

// Get AI-suggested fare from analytics
async function getAIFare(pickupAddress: string, dropoffAddress: string, distanceKm: number): Promise<number> {
    try {
        const result = await pool.query(
            `SELECT base_fare, peak_multiplier FROM fare_analytics 
             WHERE location_start ILIKE $1 AND location_end ILIKE $2
             LIMIT 1`,
            [`%${pickupAddress.split(',')[0]}%`, `%${dropoffAddress.split(',')[0]}%`]
        );
        
        if (result.rows.length > 0) {
            const baseFare = parseFloat(result.rows[0].base_fare);
            const multiplier = parseFloat(result.rows[0].peak_multiplier || 1);
            return baseFare * multiplier;
        }
    } catch (e) { }
    return calculateFare(distanceKm, 15);
}

// Update driver location
export const updateDriverLocation = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { latitude, longitude, address, city } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        await pool.query(
            `INSERT INTO driver_locations (driver_id, latitude, longitude, current_address, city, is_online, is_available)
             VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
             ON CONFLICT (driver_id) DO UPDATE SET 
                latitude = $2, longitude = $3, current_address = COALESCE($4, driver_locations.current_address),
                city = COALESCE($5, driver_locations.city), last_location_update = NOW(),
                is_online = TRUE, is_available = TRUE`,
            [user.id, latitude, longitude, address || null, city || null]
        );

        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
};

// Toggle driver online/offline
export const toggleDriverOnline = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { is_online } = req.body;

        await pool.query(
            `INSERT INTO driver_locations (driver_id, is_online, is_available)
             VALUES ($1, $2, $2)
             ON CONFLICT (driver_id) DO UPDATE SET is_online = $2, is_available = $2`,
            [user.id, is_online]
        );

        const status = is_online ? 'online' : 'offline';
        res.json({ success: true, status, message: `Driver is now ${status}` });
    } catch (error) {
        console.error('Toggle online error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// Get driver status
export const getDriverStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const result = await pool.query(
            `SELECT is_online, is_available, latitude, longitude, current_address, city,
                    vehicle_type, vehicle_model, vehicle_plate, last_location_update
             FROM driver_locations WHERE driver_id = $1`,
            [user.id]
        );

        if (result.rows.length === 0) {
            return res.json({ is_online: false, is_available: false });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get driver status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
};

// Find nearest available drivers
export const findNearestDrivers = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, driver_type, limit = 10, radius_km = 10 } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const result = await pool.query(
            `SELECT 
                dl.driver_id,
                dl.latitude,
                dl.longitude,
                dl.vehicle_type,
                dl.vehicle_model,
                dl.current_address,
                u.name as driver_name,
                u.avatar_url,
                COALESCE(AVG(dr.rating), 5) as avg_rating,
                COUNT(t.id) as total_trips,
                (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(dl.latitude)) * 
                        cos(radians(dl.longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(dl.latitude))
                    )
                ) as distance_km
             FROM driver_locations dl
             JOIN users u ON u.user_id = dl.driver_id
             LEFT JOIN driver_ratings dr ON dr.driver_id = dl.driver_id
             LEFT JOIN trips t ON t.driver_id = dl.driver_id AND t.status = 'completed'
             WHERE dl.is_online = TRUE AND dl.is_available = TRUE
               AND (dl.vehicle_type = $3 OR $3 IS NULL)
               AND (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(dl.latitude)) * 
                        cos(radians(dl.longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(dl.latitude))
                    )
                ) <= $4
             GROUP BY dl.driver_id, dl.latitude, dl.longitude, dl.vehicle_type, dl.vehicle_model, dl.current_address, u.name, u.avatar_url
             ORDER BY distance_km ASC
             LIMIT $5`,
            [latitude, longitude, driver_type || null, radius_km, limit]
        );

        res.json({ drivers: result.rows });
    } catch (error) {
        console.error('Find nearest drivers error:', error);
        res.status(500).json({ error: 'Failed to find drivers' });
    }
};

// Create dispatch request
export const createDispatchRequest = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { driver_type, pickup, dropoff } = req.body as DispatchRequest;

        if (!pickup || !dropoff) {
            return res.status(400).json({ error: 'Pickup and dropoff locations required' });
        }

        const distanceKm = calculateDistance(
            pickup.lat, pickup.lng,
            dropoff.lat, dropoff.lng
        );

        const estimatedFare = await getAIFare(
            pickup.address || 'Unknown',
            dropoff.address || 'Unknown',
            distanceKm
        );

        const expiresAt = new Date(Date.now() + DISPATCH_TIMEOUT_SECONDS * 1000);
        const requestId = generateRequestId('DISP');

        const result = await pool.query(
            `INSERT INTO dispatch_requests (
                request_id, rider_id, driver_type, status,
                pickup_location, dropoff_location,
                pickup_address, dropoff_address,
                estimated_fare, distance_km, expires_at
            ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                requestId, user.id, driver_type || 'taxi',
                JSON.stringify(pickup), JSON.stringify(dropoff),
                pickup.address || null, dropoff.address || null,
                estimatedFare, distanceKm.toFixed(2), expiresAt
            ]
        );

        // Find and offer to nearest drivers
        const nearbyDrivers = await pool.query(
            `SELECT driver_id FROM driver_locations 
             WHERE is_online = TRUE AND is_available = TRUE
               AND (vehicle_type = $1 OR $1 IS NULL)
             ORDER BY last_location_update DESC
             LIMIT $2`,
            [driver_type || null, MAX_OFFERS_PER_REQUEST]
        );

        const driverIds = nearbyDrivers.rows.map((r: any) => r.driver_id);
        
        if (driverIds.length > 0) {
            await pool.query(
                `UPDATE dispatch_requests SET offered_driver_ids = $1 WHERE id = $2`,
                [driverIds, result.rows[0].id]
            );

            // Notify drivers via SSE
            for (const driverId of driverIds) {
                notifyUser(driverId, 'dispatch_offer', {
                    request_id: requestId,
                    pickup: pickup.address,
                    dropoff: dropoff.address,
                    fare: estimatedFare,
                    distance: distanceKm.toFixed(1),
                    expires_in: DISPATCH_TIMEOUT_SECONDS
                });
            }
        }

        res.status(201).json({
            request: result.rows[0],
            nearby_drivers: driverIds.length,
            estimated_fare: estimatedFare,
            distance_km: distanceKm.toFixed(1)
        });
    } catch (error) {
        console.error('Create dispatch error:', error);
        res.status(500).json({ error: 'Failed to create dispatch request' });
    }
};

// Accept dispatch offer (driver)
export const acceptDispatch = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { request_id } = req.body;

        const dispatch = await pool.query(
            `SELECT * FROM dispatch_requests 
             WHERE request_id = $1 AND status = 'pending' 
             AND NOW() < expires_at
             AND $2 = ANY(offered_driver_ids)`,
            [request_id, user.id]
        );

        if (dispatch.rows.length === 0) {
            return res.status(400).json({ error: 'Request not found or already processed' });
        }

        const d = dispatch.rows[0];

        // Update dispatch status
        await pool.query(
            `UPDATE dispatch_requests SET 
                status = 'accepted', assigned_driver_id = $1, accepted_at = NOW()
             WHERE request_id = $2`,
            [user.id, request_id]
        );

        // Mark other offers as expired
        await pool.query(
            `UPDATE dispatch_requests SET status = 'expired'
             WHERE request_id = $1 AND status = 'pending'`,
            [request_id]
        );

        // Create trip
        const tripId = generateRequestId('TRIP');
        const tripResult = await pool.query(
            `INSERT INTO trips (
                trip_id, dispatch_request_id, driver_id, rider_id,
                pickup_address, dropoff_address, pickup_lat, pickup_lng,
                dropoff_lat, dropoff_lng, status, fare_amount, distance_km
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'assigned', $11, $12)
            RETURNING *`,
            [
                tripId, d.id, user.id, d.rider_id,
                d.pickup_address, d.dropoff_address,
                d.pickup_location->>'lat', d.pickup_location->>'lng',
                d.dropoff_location->>'lat', d.dropoff_location->>'lng',
                d.estimated_fare, d.distance_km
            ]
        );

        // Notify rider
        notifyUser(d.rider_id, 'driver_assigned', {
            trip_id: tripId,
            driver_id: user.id,
            eta_minutes: 5
        });

        // Update driver availability
        await pool.query(
            `UPDATE driver_locations SET is_available = FALSE WHERE driver_id = $1`,
            [user.id]
        );

        res.json({ 
            success: true, 
            trip: tripResult.rows[0],
            message: 'Dispatch accepted' 
        });
    } catch (error) {
        console.error('Accept dispatch error:', error);
        res.status(500).json({ error: 'Failed to accept dispatch' });
    }
};

// Reject dispatch offer (driver)
export const rejectDispatch = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { request_id } = req.body;

        await pool.query(
            `UPDATE dispatch_requests SET status = 'rejected'
             WHERE request_id = $1 AND assigned_driver_id = $2`,
            [request_id, user.id]
        );

        // Notify next driver in queue (simplified - could be enhanced)
        res.json({ success: true, message: 'Dispatch rejected' });
    } catch (error) {
        console.error('Reject dispatch error:', error);
        res.status(500).json({ error: 'Failed to reject dispatch' });
    }
};

// Update trip status
export const updateTripStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { trip_id, status } = req.body;

        const validStatuses = ['assigned', 'arrived', 'picked_up', 'in_transit', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const timestamp = { 
            assigned: 'accepted_at', 
            arrived: 'arrived_at',
            picked_up: 'picked_up_at',
            in_transit: 'in_transit_at',
            completed: 'completed_at',
            cancelled: 'cancelled_at'
        }[status];

        await pool.query(
            `UPDATE trips SET status = $1, ${timestamp} = NOW() 
             WHERE trip_id = $2 AND driver_id = $3`,
            [status, trip_id, user.id]
        );

        // If completed, calculate earnings
        if (status === 'completed') {
            await calculateTripEarnings(trip_id);
            
            // Re-enable driver availability
            await pool.query(
                `UPDATE driver_locations SET is_available = TRUE WHERE driver_id = $1`,
                [user.id]
            );
        }

        // Notify rider
        const tripResult = await pool.query(
            `SELECT rider_id FROM trips WHERE trip_id = $1`, [trip_id]
        );
        if (tripResult.rows.length > 0) {
            notifyUser(tripResult.rows[0].rider_id, `trip_${status}`, { trip_id, status });
        }

        res.json({ success: true, status });
    } catch (error) {
        console.error('Update trip status error:', error);
        res.status(500).json({ error: 'Failed to update trip status' });
    }
};

// Calculate trip earnings
async function calculateTripEarnings(tripId: string): Promise<void> {
    const trip = await pool.query(
        `SELECT * FROM trips WHERE trip_id = $1`, [tripId]
    );

    if (trip.rows.length === 0) return;
    const t = trip.rows[0];

    const platformFee = (t.fare_amount || 0) * PLATFORM_FEE_PERCENT;
    const netEarnings = (t.fare_amount || 0) - platformFee;

    await pool.query(
        `INSERT INTO driver_earnings (driver_id, trip_id, amount, platform_fee, net_earnings, fare_base, distance_km, status)
         VALUES ($1, (SELECT id FROM trips WHERE trip_id = $2), $3, $4, $5, $6, $7, 'pending')`,
        [t.driver_id, tripId, t.fare_amount, platformFee, netEarnings, t.fare_amount, t.distance_km]
    );
}

// Get driver earnings
export const getDriverEarnings = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { period = 'week' } = req.query;

        let dateFilter = "NOW() - INTERVAL '7 days'";
        if (period === 'day') dateFilter = "NOW() - INTERVAL '24 hours'";
        if (period === 'month') dateFilter = "NOW() - INTERVAL '30 days'";

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_trips,
                SUM(amount) as total_gross,
                SUM(platform_fee) as total_fees,
                SUM(net_earnings) as total_net,
                AVG(net_earnings) as avg_per_trip
             FROM driver_earnings
             WHERE driver_id = $1 AND created_at > ${dateFilter}`,
            [user.id]
        );

        const tripsResult = await pool.query(
            `SELECT trip_id, pickup_address, dropoff_address, fare_amount, driver_earnings, status, created_at
             FROM trips WHERE driver_id = $1 ORDER BY created_at DESC LIMIT 20`,
            [user.id]
        );

        res.json({
            summary: result.rows[0],
            trips: tripsResult.rows
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ error: 'Failed to get earnings' });
    }
};

// Get driver's current/active trip
export const getCurrentTrip = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const result = await pool.query(
            `SELECT t.*, u.name as rider_name, u.phone as rider_phone
             FROM trips t
             JOIN users u ON u.user_id = t.rider_id
             WHERE t.driver_id = $1 AND t.status IN ('assigned', 'arrived', 'picked_up', 'in_transit')
             ORDER BY t.created_at DESC
             LIMIT 1`,
            [user.id]
        );

        res.json({ trip: result.rows[0] || null });
    } catch (error) {
        console.error('Get current trip error:', error);
        res.status(500).json({ error: 'Failed to get current trip' });
    }
};

// Rate a trip (rider rates driver)
export const rateTrip = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { trip_id, rating, comment } = req.body;

        const trip = await pool.query(
            `SELECT id, driver_id, rider_id FROM trips WHERE trip_id = $1`, [trip_id]
        );

        if (trip.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Verify the user is the rider
        if (trip.rows[0].rider_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized to rate this trip' });
        }

        const result = await pool.query(
            `INSERT INTO driver_ratings (trip_id, driver_id, rider_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [trip.rows[0].id, trip.rows[0].driver_id, user.id, rating, comment || null]
        );

        await pool.query(
            `UPDATE trips SET rating_id = $1 WHERE trip_id = $2`,
            [result.rows[0].id, trip_id]
        );

        res.json({ success: true, message: 'Rating submitted' });
    } catch (error) {
        console.error('Rate trip error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
};

// Update fare manually (admin or driver)
export const updateFare = async (req: Request, res: Response) => {
    try {
        const { trip_id, fare_amount, reason } = req.body;
        const user = (req as any).user;

        const trip = await pool.query(
            `SELECT * FROM trips WHERE trip_id = $1`, [trip_id]
        );

        if (trip.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Calculate new earnings
        const platformFee = (fare_amount || 0) * PLATFORM_FEE_PERCENT;
        const netEarnings = (fare_amount || 0) - platformFee;

        await pool.query(
            `UPDATE trips SET 
                fare_amount = $1,
                platform_fee = $2,
                driver_earnings = $3
             WHERE trip_id = $4`,
            [fare_amount, platformFee, netEarnings, trip_id]
        );

        // Update earnings record
        await pool.query(
            `UPDATE driver_earnings SET 
                amount = $1, platform_fee = $2, net_earnings = $3
             WHERE trip_id = (SELECT id FROM trips WHERE trip_id = $4)`,
            [fare_amount, platformFee, netEarnings, trip_id]
        );

        res.json({ success: true, fare_amount, platform_fee: platformFee, net_earnings: netEarnings });
    } catch (error) {
        console.error('Update fare error:', error);
        res.status(500).json({ error: 'Failed to update fare' });
    }
};

// Get dispatch requests for a rider
export const getMyDispatchRequests = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const result = await pool.query(
            `SELECT * FROM dispatch_requests 
             WHERE rider_id = $1 ORDER BY created_at DESC LIMIT 20`,
            [user.id]
        );

        res.json({ requests: result.rows });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to get requests' });
    }
};

export default {
    updateDriverLocation,
    toggleDriverOnline,
    getDriverStatus,
    findNearestDrivers,
    createDispatchRequest,
    acceptDispatch,
    rejectDispatch,
    updateTripStatus,
    getDriverEarnings,
    getCurrentTrip,
    rateTrip,
    updateFare,
    getMyDispatchRequests
};