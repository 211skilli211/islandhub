import { Request, Response } from 'express';
import { pool } from '../config/db';

// @desc    Get current authenticated user
// @access  Private
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const result = await pool.query(
            'SELECT user_id as id, name, email, role, bio, profile_photo_url, profile_photo_url as avatar_url, banner_image_url, banner_color, created_at, is_verified_driver, vehicle_type, vehicle_plate, license_number, vehicle_color, vehicle_seating, is_online FROM users WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Failed to fetch current user' });
    }
};

// @desc    Update user profile customization (bio, banner color, driver info)
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const {
            bio, banner_color, name, license_number, vehicle_type,
            vehicle_plate, vehicle_color, vehicle_seating,
            avatar_url, cover_photo_url
        } = req.body;

        // Validation for driver-specific fields
        if (license_number && !/^[A-Z0-9-]{5,25}$/i.test(license_number)) {
            return res.status(400).json({ message: 'Invalid license number format' });
        }
        const validVehicleTypes = ['scooter', 'car', 'suv', 'truck'];
        if (vehicle_type && !validVehicleTypes.includes(vehicle_type)) {
            return res.status(400).json({ message: 'Invalid vehicle type. Must be one of: ' + validVehicleTypes.join(', ') });
        }
        if (vehicle_plate && !/^[A-Z0-9-\s]{2,15}$/i.test(vehicle_plate)) {
            return res.status(400).json({ message: 'Invalid vehicle plate format' });
        }
        if (vehicle_color && (typeof vehicle_color !== 'string' || vehicle_color.length > 30)) {
            return res.status(400).json({ message: 'Invalid vehicle color (max 30 characters)' });
        }
        if (vehicle_seating && (isNaN(parseInt(vehicle_seating)) || parseInt(vehicle_seating) <= 0)) {
            return res.status(400).json({ message: 'Invalid vehicle seating (must be a positive number)' });
        }

        const result = await pool.query(
            `UPDATE users SET 
                bio = COALESCE($1, bio),
                banner_color = COALESCE($2, banner_color),
                name = COALESCE($3, name),
                license_number = COALESCE($4, license_number),
                vehicle_type = COALESCE($5, vehicle_type),
                vehicle_plate = COALESCE($6, vehicle_plate),
                vehicle_color = COALESCE($7, vehicle_color),
                vehicle_seating = COALESCE($8, vehicle_seating),
                profile_photo_url = COALESCE($9, profile_photo_url),
                banner_image_url = COALESCE($10, banner_image_url),
                updated_at = NOW()
            WHERE user_id = $11 RETURNING user_id, name, email, role, bio, profile_photo_url, profile_photo_url as avatar_url, banner_image_url, banner_color, is_verified_driver, vehicle_type, vehicle_plate, license_number, vehicle_color, vehicle_seating`,
            [
                bio, banner_color, name, license_number, vehicle_type,
                vehicle_plate, vehicle_color, vehicle_seating ? parseInt(vehicle_seating) : null,
                avatar_url, cover_photo_url, userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// @desc    Get user profile by ID
// @access  Public
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT user_id, name, email, role, bio, profile_photo_url, profile_photo_url as avatar_url, banner_image_url, banner_color, created_at, is_verified_driver, vehicle_type, vehicle_plate, license_number, vehicle_color, vehicle_seating, is_online FROM users WHERE user_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};
