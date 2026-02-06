import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { pool } from '../config/db';
import { EmailService } from '../services/emailService';

export const generateToken = (id: number, role: string = 'donor') => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );
};

export const register = async (req: Request, res: Response) => {
    try {
        console.log('Registration request body:', JSON.stringify(req.body));
        const { name, email, password, role, country } = req.body;

        if (!name || !email || !password) {
            console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
            return res.status(400).json({ message: 'Missing required fields: name, email, password' });
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await UserModel.create({
            name,
            email,
            password_hash,
            role: role || 'buyer',
            country,
            email_verified: false
        });

        const token = generateToken(newUser.user_id!, newUser.role);

        // Send welcome and verification emails
        await EmailService.sendWelcomeEmail(newUser.email, newUser.name);
        await EmailService.sendVerificationEmail(newUser.email, token);

        res.status(201).json({
            token,
            user: {
                id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                email_verified: false
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId = decoded.id;

        await pool.query('UPDATE users SET email_verified = TRUE WHERE user_id = $1', [userId]);

        res.json({ message: 'Email verified successfully', success: true });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.user_id!, user.role);

        console.log('[Login] User data:', {
            id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            email_verified: user.email_verified,
            has_avatar: !!(user as any).profile_photo_url
        });

        res.json({
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                email_verified: user.email_verified,
                avatar_url: (user as any).profile_photo_url || null
            }
        });
    } catch (error) {
        console.error('[Login] Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { role } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!['buyer', 'vendor', 'sponsor'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // --- Role Protection: Prevent Admin demotion ---
        const userRes = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
        const currentRole = userRes.rows[0]?.role;

        if (currentRole === 'admin') {
            console.log(`[Admin Protection] Preserving admin role for user ${userId} despite request for ${role}`);
            return res.json({ message: 'Admin role preserved', role: 'admin' });
        }
        // ----------------------------------------------

        await pool.query('UPDATE users SET role = $1 WHERE user_id = $2', [role, userId]);

        res.json({ message: 'Role updated successfully', role });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Failed to update user role' });
    }
};
