import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const checkIsActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = await pool.query('SELECT is_active FROM users WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!result.rows[0].is_active) {
            return res.status(403).json({ message: 'Account is suspended' });
        }

        next();
    } catch (error) {
        console.error('Error checking user status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
