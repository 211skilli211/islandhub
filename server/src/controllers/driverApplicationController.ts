import { Request, Response } from 'express';
import { pool } from '../config/db';

// Submit Driver Application
export const submitApplication = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const {
            vehicle_type,
            vehicle_make,
            vehicle_model,
            vehicle_year,
            vehicle_plate,
            vehicle_color,
            license_number,
            license_expiry,
            license_photo_url,
            vehicle_photo_url,
            insurance_photo_url
        } = req.body;

        if (!vehicle_type) {
            return res.status(400).json({ message: 'Vehicle type is required' });
        }

        // Check if application already exists
        const existing = await pool.query(
            'SELECT * FROM driver_applications WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            // Update existing application
            const result = await pool.query(
                `UPDATE driver_applications SET
                    vehicle_type = $2,
                    vehicle_make = $3,
                    vehicle_model = $4,
                    vehicle_year = $5,
                    vehicle_plate = $6,
                    vehicle_color = $7,
                    license_number = $8,
                    license_expiry = $9,
                    license_photo_url = $10,
                    vehicle_photo_url = $11,
                    insurance_photo_url = $12,
                    status = 'pending',
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING *`,
                [userId, vehicle_type, vehicle_make, vehicle_model, vehicle_year,
                    vehicle_plate, vehicle_color, license_number, license_expiry,
                    license_photo_url, vehicle_photo_url, insurance_photo_url]
            );
            return res.json({ message: 'Application updated', application: result.rows[0] });
        }

        // Create new application
        const result = await pool.query(
            `INSERT INTO driver_applications 
             (user_id, vehicle_type, vehicle_make, vehicle_model, vehicle_year,
              vehicle_plate, vehicle_color, license_number, license_expiry,
              license_photo_url, vehicle_photo_url, insurance_photo_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [userId, vehicle_type, vehicle_make, vehicle_model, vehicle_year,
                vehicle_plate, vehicle_color, license_number, license_expiry,
                license_photo_url, vehicle_photo_url, insurance_photo_url]
        );

        res.status(201).json({ message: 'Application submitted', application: result.rows[0] });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ message: 'Failed to submit application' });
    }
};

// Get My Application Status
export const getMyApplication = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await pool.query(
            'SELECT * FROM driver_applications WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No application found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: 'Failed to get application' });
    }
};

// Admin: Get All Applications
export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT da.*, u.name as applicant_name, u.email as applicant_email
            FROM driver_applications da
            JOIN users u ON da.user_id = u.user_id
        `;
        const params: any[] = [];

        if (status) {
            query += ' WHERE da.status = $1';
            params.push(status);
        }

        query += ' ORDER BY da.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ message: 'Failed to get applications' });
    }
};

// Admin: Review Application
export const reviewApplication = async (req: Request, res: Response) => {
    try {
        const adminId = (req.user as any)?.id;
        const { applicationId } = req.params;
        const { status, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE driver_applications SET
                status = $1,
                notes = $2,
                reviewed_by = $3,
                reviewed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
             WHERE application_id = $4
             RETURNING *`,
            [status, notes, adminId, applicationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // If approved, update user role to driver and set vehicle type
        if (status === 'approved') {
            const app = result.rows[0];
            await pool.query(
                `UPDATE users SET 
                    role = 'driver',
                    vehicle_type = $1
                 WHERE user_id = $2`,
                [app.vehicle_type, app.user_id]
            );
        }

        res.json({ message: `Application ${status}`, application: result.rows[0] });
    } catch (error) {
        console.error('Review application error:', error);
        res.status(500).json({ message: 'Failed to review application' });
    }
};
