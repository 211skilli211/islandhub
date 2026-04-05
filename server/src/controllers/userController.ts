import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

// @desc    Change user password
// @access  Private
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ message: 'Current and new password required' });
        }

        if (new_password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Get current password hash
        const userResult = await pool.query('SELECT password FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(current_password, userResult.rows[0].password);
        if (!isValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password and update
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2', [hashedPassword, userId]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};

// @desc    Request email change
// @access  Private
export const requestEmailChange = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { new_email } = req.body;

        if (!new_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) {
            return res.status(400).json({ message: 'Valid email required' });
        }

        // Check if email already exists
        const existing = await pool.query('SELECT user_id FROM users WHERE email = $1 AND user_id != $2', [new_email, userId]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Generate verification token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store pending email change
        await pool.query(
            `INSERT INTO email_change_requests (user_id, new_email, token, expires_at) 
             VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET new_email = $2, token = $3, expires_at = $4`,
            [userId, new_email, token, expires]
        );

        // In production, send email with verification link
        const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email-change?token=${token}`;
        console.log(`Email change verification link: ${verifyLink}`);

        res.json({ success: true, message: 'Verification email sent', token }); // Remove token in production
    } catch (error) {
        console.error('Request email change error:', error);
        res.status(500).json({ message: 'Failed to request email change' });
    }
};

// @desc    Delete user account
// @access  Private
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password required to delete account' });
        }

        // Verify password
        const userResult = await pool.query('SELECT password FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, userResult.rows[0].password);
        if (!isValid) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Soft delete - set status to deleted
        await pool.query(
            `UPDATE users SET status = 'deleted', email = CONCAT(email, '_deleted_', user_id), updated_at = NOW() WHERE user_id = $1`,
            [userId]
        );

        // Clear sessions (in production, invalidate all JWTs)
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
};

// @desc    Enable 2FA (TOTP)
// @access  Private
export const enable2FA = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        
        // Generate TOTP secret
        const secret = crypto.randomBytes(20).toString('hex');
        const otpauthUrl = `otpauth://totp(IslandHub:${userId})?secret=${secret}&issuer=IslandHub`;

        // Store pending 2FA setup
        await pool.query(
            `INSERT INTO user_2fa (user_id, secret, enabled) 
             VALUES ($1, $2, FALSE) ON CONFLICT (user_id) DO UPDATE SET secret = $2, enabled = FALSE`,
            [userId, secret]
        );

        res.json({ 
            success: true, 
            secret,
            otpauthUrl,
            message: 'Scan the QR code with your authenticator app, then verify with a code'
        });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ message: 'Failed to enable 2FA' });
    }
};

// @desc    Verify and activate 2FA
// @access  Private
export const verify2FA = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { code } = req.body;

        if (!code || code.length !== 6) {
            return res.status(400).json({ message: '6-digit code required' });
        }

        // Get stored secret
        const result = await pool.query('SELECT secret FROM user_2fa WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'No 2FA setup in progress' });
        }

        const secret = result.rows[0].secret;

        // Simple TOTP verification (in production, use proper TOTP library)
        // For now, accept any 6-digit code (placeholder - implement proper TOTP)
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ message: 'Invalid code format' });
        }

        // Enable 2FA
        await pool.query('UPDATE user_2fa SET enabled = TRUE WHERE user_id = $1', [userId]);

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
        await pool.query('UPDATE user_2fa SET backup_codes = $1 WHERE user_id = $2', [JSON.stringify(backupCodes), userId]);

        res.json({ 
            success: true, 
            message: '2FA enabled successfully',
            backupCodes // In production, show only once
        });
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({ message: 'Failed to verify 2FA' });
    }
};

// @desc    Disable 2FA
// @access  Private
export const disable2FA = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { password, code } = req.body;

        // Verify password
        const userResult = await pool.query('SELECT password FROM users WHERE user_id = $1', [userId]);
        const isValid = await bcrypt.compare(password, userResult.rows[0].password);
        if (!isValid) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Verify 2FA code (or backup code)
        const totpResult = await pool.query('SELECT secret, backup_codes FROM user_2fa WHERE user_id = $1', [userId]);
        if (totpResult.rows.length === 0 || !totpResult.rows[0].secret) {
            return res.status(400).json({ message: '2FA not enabled' });
        }

        // Accept any 6-digit code for now (placeholder)
        if (!code || code.length !== 6) {
            return res.status(400).json({ message: 'Verification code required' });
        }

        // Disable 2FA
        await pool.query('UPDATE user_2fa SET enabled = FALSE, secret = NULL WHERE user_id = $1', [userId]);

        res.json({ success: true, message: '2FA disabled' });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
};
