import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAdminAction } from './adminController';
import { notifyAllDrivers, notifyUser, setDriverOnline } from '../services/notificationService';
import { OrderModel } from '../models/Order';
import { RevenueService } from '../services/revenueService';

// Helper to calculate fare based on rules
export const calculateFare = async (
    serviceType: string,
    vehicleCategory: string,
    distanceKm: number = 5,
    durationMin: number = 10,
    options: { passengerCount?: number, itemSize?: string } = {}
) => {
    try {
        const result = await pool.query(
            'SELECT * FROM logistics_pricing WHERE service_type = $1 AND is_active = TRUE',
            [serviceType]
        );

        if (result.rows.length === 0) return 25.00; // Fallback flat fee

        const rule = result.rows[0];
        let total = parseFloat(rule.base_fare) +
            (distanceKm * parseFloat(rule.per_km_rate)) +
            (durationMin * parseFloat(rule.per_min_rate));

        // Add extra passenger fee
        if (options.passengerCount && options.passengerCount > 1) {
            total += (options.passengerCount - 1) * parseFloat(rule.extra_passenger_fee || 0);
        }

        // Apply item size multiplier
        if (options.itemSize && rule.item_size_multipliers) {
            const multipliers = rule.item_size_multipliers;
            const multiplier = multipliers[options.itemSize.toLowerCase().replace(/\s+/g, '_')] || 1.0;
            total *= multiplier;
        }

        total = total * parseFloat(rule.surge_multiplier || 1.0);

        return Math.max(total, parseFloat(rule.minimum_fare || 10.00));
    } catch (error) {
        console.error('Calculate Fare Error:', error);
        return 20.00; // System fallback
    }
};

// Create a Ride/Delivery Request
export const createJob = async (req: Request, res: Response) => {
    try {
        console.log('--- Incoming Create Job Request ---');
        console.log('Payload:', JSON.stringify(req.body, null, 2));

        const {
            title, description, price,
            service_type, pickup_location, dropoff_location,
            vehicle_category, scheduled_time,
            waypoints = [], extra_details = {}, pricing_details = {}
        } = req.body;

        const userId = (req.user as any)?.id;

        if (!userId) {
            console.error('Create Job Error: User ID missing from request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Validation
        if (!['pickup', 'delivery', 'taxi'].includes(service_type)) {
            console.error('Create Job Error: Invalid service type', service_type);
            return res.status(400).json({ message: 'Invalid service type' });
        }

        // Parse passenger count and item size from extra_details if it's a string (though it should be object)
        const details = typeof extra_details === 'string' ? JSON.parse(extra_details) : extra_details;

        // Calculate Dynamic Price
        const estimatedPrice = await calculateFare(
            service_type,
            vehicle_category,
            pricing_details.distance || 0,
            pricing_details.duration || 0,
            {
                passengerCount: details.passenger_count,
                itemSize: details.item_size || details.luggage_size
            }
        );

        const finalPrice = price || estimatedPrice;

        console.log('Calculated Final Price:', finalPrice);

        const result = await pool.query(
            `INSERT INTO listings (
                creator_id, title, description, price, category, type,
                service_type, pickup_location, dropoff_location, 
                vehicle_category, scheduled_time, transport_status,
                waypoints, extra_details, pricing_details
            ) VALUES ($1, $2, $3, $4, 'service', 'service', $5, $6, $7, $8, $9, 'pending', $10, $11, $12)
            RETURNING *`,
            [
                userId, title, description, finalPrice, service_type,
                JSON.stringify(pickup_location), JSON.stringify(dropoff_location),
                vehicle_category, scheduled_time,
                JSON.stringify(waypoints), JSON.stringify(details), JSON.stringify(pricing_details)
            ]
        );

        console.log('Job Created Successfully:', result.rows[0].id);

        // Notify all drivers about the new job
        notifyAllDrivers('new_job', {
            jobId: result.rows[0].id,
            title: result.rows[0].title,
            service_type: result.rows[0].service_type,
            price: result.rows[0].price,
            vehicle_category: result.rows[0].vehicle_category
        });

        res.status(201).json({
            success: true,
            job: result.rows[0],
            message: 'Request created successfully'
        });
    } catch (error) {
        console.error('Full Create Job Error Stack:', error);
        res.status(500).json({
            message: 'Failed to create request',
            error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
        });
    }
};

// Get Available Jobs (Driver View)
export const getAvailableJobs = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        // Fetch Driver's Vehicle Type
        const driverRes = await pool.query('SELECT vehicle_type FROM users WHERE user_id = $1', [userId]);
        const driverVehicle = driverRes.rows[0]?.vehicle_type;

        if (!driverVehicle) {
            return res.status(403).json({ message: 'Driver vehicle type not set' });
        }

        // Logic: Driver sees jobs compatible with their vehicle
        let vehicleFilter = '';
        if (driverVehicle === 'scooter') {
            vehicleFilter = "AND (vehicle_category = 'scooter' OR vehicle_category = 'bike' OR vehicle_category IS NULL)";
        } else if (driverVehicle === 'car' || driverVehicle === 'suv') {
            vehicleFilter = "AND (vehicle_category != 'truck')";
        } else if (driverVehicle === 'truck') {
            vehicleFilter = "AND vehicle_category = 'truck'";
        }

        const result = await pool.query(
            `SELECT l.*, u.name as requester_name, u.profile_photo_url as requester_avatar 
             FROM listings l
             JOIN users u ON l.creator_id = u.user_id
             WHERE l.category = 'service' 
             AND l.service_type IN ('pickup', 'delivery', 'taxi')
             AND l.transport_status = 'pending'
             ${vehicleFilter}
             ORDER BY l.created_at DESC`
        );

        res.json({ success: true, jobs: result.rows });
    } catch (error) {
        console.error('Get Jobs Error:', error);
        res.status(500).json({ message: 'Failed to fetch jobs' });
    }
};

// Accept Job
export const acceptJob = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const driverId = (req.user as any)?.id;

        // Check availability
        const check = await pool.query(
            "SELECT transport_status, vehicle_category FROM listings WHERE id = $1 FOR UPDATE",
            [jobId]
        );

        if (check.rows.length === 0) return res.status(404).json({ message: 'Job not found' });
        const job = check.rows[0];

        if (job.transport_status !== 'pending') {
            return res.status(409).json({ message: 'Job already accepted' });
        }

        // Fetch Driver's Vehicle Type
        const driverRes = await pool.query('SELECT vehicle_type FROM users WHERE user_id = $1', [driverId]);
        const driverVehicle = driverRes.rows[0]?.vehicle_type;

        // Vehicle Compatibility Validation
        if (job.vehicle_category === 'truck' && driverVehicle !== 'truck') {
            return res.status(403).json({ message: 'This job requires a truck' });
        }
        if (job.vehicle_category === 'suv' && !['suv', 'truck'].includes(driverVehicle)) {
            return res.status(403).json({ message: 'This job requires an SUV or larger' });
        }

        const result = await pool.query(
            `UPDATE listings 
             SET transport_status = 'accepted', driver_id = $1 
             WHERE id = $2 
             RETURNING *`,
            [driverId, jobId]
        );

        const updatedJob = result.rows[0];

        // Notify customer that their job was accepted
        if (updatedJob.creator_id) {
            notifyUser(updatedJob.creator_id, 'job_accepted', {
                jobId: updatedJob.id,
                title: updatedJob.title,
                status: 'accepted',
                message: 'A driver has accepted your request!'
            });
        }

        res.json({ success: true, job: updatedJob, message: 'Job accepted!' });
    } catch (error) {
        console.error('Accept Job Error:', error);
        res.status(500).json({ message: 'Failed to accept job' });
    }
};

// Update Job Status
export const updateJobStatus = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body;
        const driverId = (req.user as any)?.id;

        if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE listings 
             SET transport_status = $1 
             WHERE id = $2 AND driver_id = $3
             RETURNING *`,
            [status, jobId, driverId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized or Job not found' });
        }

        const job = result.rows[0];

        // Status-specific notification messages
        const statusMessages: Record<string, string> = {
            in_progress: 'Your driver is on the way!',
            completed: 'Your delivery has been completed!',
            cancelled: 'Your request has been cancelled.'
        };

        // Notify customer of status change
        if (job.creator_id) {
            notifyUser(job.creator_id, 'job_status_updated', {
                jobId: job.id,
                title: job.title,
                status: status,
                message: statusMessages[status] || `Status updated to ${status}`
            });
        }

        // Create order and revenue record when delivery is completed
        if (status === 'completed') {
            try {
                console.log(`Processing revenue for completed delivery: ${job.id}`);

                // Process comprehensive revenue creation
                const revenueResult = await RevenueService.processDeliveryRevenue(
                    job.id,
                    job,
                    driverId // Pass the driver who completed the delivery
                );

                console.log(`Revenue processing completed for delivery ${job.id}:`, revenueResult);

                // Notify customer about order completion with revenue details
                if (job.creator_id) {
                    notifyUser(job.creator_id, 'delivery_completed', {
                        jobId: job.id,
                        orderId: revenueResult.orderId,
                        title: job.title,
                        amount: revenueResult.totalAmount,
                        message: `Your delivery has been completed! Order #${revenueResult.orderId}`
                    });
                }

                // Notify driver about earnings if they earned commission
                if (driverId && revenueResult.commission > 0) {
                    const driverEarnings = revenueResult.commission * 0.2; // 20% of commission
                    if (driverEarnings > 0) {
                        notifyUser(driverId, 'driver_earned', {
                            jobId: job.id,
                            earnings: driverEarnings,
                            title: job.title,
                            message: `You earned $${driverEarnings.toFixed(2)} from this delivery!`
                        });
                    }
                }
            } catch (revenueError) {
                console.error('Failed to process revenue for completed delivery:', revenueError);
                // Revenue processing failed - log for manual review (future: add to retry queue)
            }
        }

        res.json({ success: true, job });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
};

// Admin: Get Pricing Rules
export const getPricingRules = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM logistics_pricing ORDER BY service_type ASC');
        res.json({ success: true, rules: result.rows });
    } catch (error) {
        console.error('Get Pricing Rules Error:', error);
        res.status(500).json({ message: 'Failed to fetch pricing rules' });
    }
};

// Admin: Update Pricing Rule
export const updatePricingRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            base_fare, per_km_rate, per_min_rate,
            minimum_fare, surge_multiplier, is_active,
            extra_passenger_fee, item_size_multipliers
        } = req.body;

        const result = await pool.query(
            `UPDATE logistics_pricing 
             SET base_fare = $1, per_km_rate = $2, per_min_rate = $3, 
                 minimum_fare = $4, surge_multiplier = $5, is_active = $6,
                 extra_passenger_fee = $7, item_size_multipliers = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING *`,
            [
                base_fare, per_km_rate, per_min_rate,
                minimum_fare, surge_multiplier, is_active,
                extra_passenger_fee, JSON.stringify(item_size_multipliers),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pricing rule not found' });
        }

        const updatedRule = result.rows[0];

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'update_pricing', parseInt(id), {
                service_type: updatedRule.service_type,
                surge: surge_multiplier,
                is_active
            });
        }

        res.json({ success: true, rule: updatedRule });
    } catch (error) {
        console.error('Update Pricing Rule Error:', error);
        res.status(500).json({ message: 'Failed to update pricing rule' });
    }
};

// Admin: Cancel Job
export const adminCancelJob = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { reason } = req.body;

        const result = await pool.query(
            `UPDATE listings 
             SET transport_status = 'cancelled', 
                 extra_details = extra_details || jsonb_build_object('cancellation_reason', $1, 'cancelled_by', 'admin')
             WHERE id = $2 
             RETURNING *`,
            [reason || 'Cancelled by Administrator', jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = result.rows[0];

        // Notify creator and driver if assigned
        if (job.creator_id) {
            notifyUser(job.creator_id, 'job_cancelled', {
                jobId: job.id,
                title: job.title,
                message: `Your request was cancelled by an administrator: ${reason}`
            });
        }
        if (job.driver_id) {
            notifyUser(job.driver_id, 'job_cancelled', {
                jobId: job.id,
                title: job.title,
                message: `A job you accepted was cancelled by an administrator.`
            });
        }

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'admin_cancel_job', parseInt(jobId), {
                reason: req.body.reason || 'No reason provided',
                title: job.title
            });
        }

        res.json({ success: true, message: 'Job cancelled by administrator' });
    } catch (error) {
        console.error('Admin Cancel Job Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin: Manually Assign Driver
export const adminAssignDriver = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { driverId } = req.body;

        if (!driverId) return res.status(400).json({ message: 'Driver ID is required' });

        const result = await pool.query(
            `UPDATE listings 
             SET transport_status = 'accepted', 
                 driver_id = $1 
             WHERE id = $2 
             RETURNING *`,
            [driverId, jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = result.rows[0];

        // Notify driver
        notifyUser(driverId, 'job_assigned', {
            jobId: job.id,
            title: job.title,
            message: 'An administrator has manually assigned you a job!'
        });

        // Notify creator
        if (job.creator_id) {
            notifyUser(job.creator_id, 'job_accepted', {
                jobId: job.id,
                title: job.title,
                status: 'accepted',
                message: 'Your request has been assigned to a driver by an administrator.'
            });
        }

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'admin_assign_driver', job.id, {
                driver_id: driverId,
                title: job.title
            });
        }

        res.json({ success: true, message: 'Driver manually assigned', job });
    } catch (error) {
        console.error('Admin Assign Driver Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Toggle Online/Offline Status
export const toggleDriverStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { isOnline } = req.body;

        const result = await pool.query(
            'UPDATE users SET is_online = $1 WHERE user_id = $2 RETURNING is_online',
            [isOnline, userId]
        );

        // Update notification service memory map
        const nextStatus = result.rows[0].is_online;
        setDriverOnline(userId, nextStatus);

        res.json({ success: true, is_online: nextStatus });
    } catch (error) {
        console.error('Toggle Driver Status Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Driver Live Location
export const updateLiveLocation = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { lat, lng, jobId } = req.body;

        // Update the user's general location
        await pool.query(
            'UPDATE users SET live_lat = $1, live_lng = $2, last_online = CURRENT_TIMESTAMP WHERE user_id = $3',
            [lat, lng, userId]
        );

        // If on a job, update the job listing for customer tracking
        if (jobId) {
            await pool.query(
                'UPDATE listings SET live_lat = $1, live_lng = $2 WHERE id = $3 AND driver_id = $4',
                [lat, lng, jobId, userId]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update Live Location Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Driver Earnings Analytics
export const getDriverStats = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        // 1. Get daily earnings for the last 7 days (for chart)
        const dailyResult = await pool.query(`
            SELECT 
                DATE(updated_at) as date,
                SUM(price) as earnings,
                COUNT(*) as count
            FROM listings
            WHERE driver_id = $1 AND transport_status = 'completed'
            AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(updated_at)
            ORDER BY DATE(updated_at) ASC
        `, [userId]);

        // 2. Get period-specific earnings
        const periodEarnings = await pool.query(`
            SELECT 
                SUM(CASE WHEN updated_at >= CURRENT_DATE THEN price ELSE 0 END) as today,
                SUM(CASE WHEN updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN price ELSE 0 END) as week,
                SUM(CASE WHEN updated_at >= CURRENT_DATE - INTERVAL '30 days' THEN price ELSE 0 END) as month,
                SUM(price) as lifetime
            FROM listings
            WHERE driver_id = $1 AND transport_status = 'completed'
        `, [userId]);

        // 3. Get Success Rate & Total Missions
        const missionStats = await pool.query(`
            SELECT 
                COUNT(*) as total_accepted,
                COUNT(*) FILTER (WHERE transport_status = 'completed') as completed,
                COUNT(*) FILTER (WHERE transport_status = 'cancelled' AND extra_details->>'cancelled_by' = 'driver') as driver_cancelled,
                AVG(CASE WHEN extra_details->>'rating' IS NOT NULL THEN (extra_details->>'rating')::numeric END) as avg_rating
            FROM listings
            WHERE driver_id = $1 AND transport_status IN ('completed', 'cancelled', 'in_progress', 'accepted')
        `, [userId]);

        const stats = missionStats.rows[0];
        const total = parseInt(stats.total_accepted || 0);
        const completed = parseInt(stats.completed || 0);
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

        res.json({
            success: true,
            daily: dailyResult.rows,
            summary: {
                ...periodEarnings.rows[0],
                total_jobs: completed,
                avg_rating: parseFloat(stats.avg_rating || 5.0),
                success_rate: successRate,
                total_missions: total
            }
        });
    } catch (error) {
        console.error('Get Driver Stats Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Submit Driver Verification (KYC)
export const submitDriverKYC = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { licenseNumber, licenseExpiry, documents, vehicle } = req.body;

        // Use a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Upsert Driver Profile
            await client.query(`
                INSERT INTO driver_profiles (user_id, license_number, license_expiry, verification_status, documents)
                VALUES ($1, $2, $3, 'pending', $4)
                ON CONFLICT (user_id) DO UPDATE 
                SET license_number = $2, license_expiry = $3, verification_status = 'pending', documents = $4, updated_at = CURRENT_TIMESTAMP
            `, [userId, licenseNumber, licenseExpiry, JSON.stringify(documents)]);

            // 2. Upsert Vehicle
            if (vehicle) {
                await client.query(`
                    INSERT INTO vehicles (driver_id, make, model, year, plate_number, color, category)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (driver_id) DO UPDATE 
                    SET make = $2, model = $3, year = $4, plate_number = $5, color = $6, category = $7
                `, [userId, vehicle.make, vehicle.model, vehicle.year, vehicle.plateNumber, vehicle.color, vehicle.category]);
            }

            // 3. Mark user as needing verification check
            await client.query('UPDATE users SET is_verified_driver = FALSE WHERE user_id = $1', [userId]);

            await client.query('COMMIT');
            res.json({ success: true, message: 'Application submitted for review' });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Submit KYC Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Driver Profile & Vehicle
export const getDriverProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        const profile = await pool.query('SELECT * FROM driver_profiles WHERE user_id = $1', [userId]);
        const vehicle = await pool.query('SELECT * FROM vehicles WHERE driver_id = $1 AND is_active = TRUE', [userId]);

        res.json({
            success: true,
            profile: profile.rows[0],
            vehicle: vehicle.rows[0]
        });
    } catch (error) {
        console.error('Get Driver Profile Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Admin: Get All Online Drivers (for Dispatch Map)
export const getOnlineDrivers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_id, u.name, u.profile_photo_url,
                u.live_lat, u.live_lng, u.last_online,
                v.category as vehicle_category, v.make, v.model
            FROM users u
            LEFT JOIN vehicles v ON u.user_id = v.driver_id AND v.is_active = TRUE
            WHERE u.is_online = TRUE 
            AND u.live_lat IS NOT NULL 
            AND u.last_online >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
        `);

        res.json({ success: true, drivers: result.rows });
    } catch (error) {
        console.error('Get Online Drivers Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
