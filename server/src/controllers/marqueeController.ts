
import { Request, Response } from 'express';
import { pool } from '../config/db';

let globalSettings = {
    isPlaying: true,
    direction: 'normal',
    speed: 1,
    preset: 'island_orange' // Defaulting to the new style
};

// @desc    Create a marquee message
// @access  Private
export const createMarquee = async (req: Request, res: Response) => {
    try {
        const { message, priority, template_type, icon } = req.body;
        console.log(`[DEBUG] Create Marquee: Message: "${message}"`);

        const result = await pool.query(
            `INSERT INTO text_marquee (message, priority, is_active, template_type, icon)
             VALUES ($1, $2, true, $3, $4)
             RETURNING *`,
            [message, priority || 1, template_type || 'standard', icon || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create marquee error:', error);
        res.status(500).json({ message: 'Failed to create marquee message' });
    }
};

// @desc    Get active marquee messages + settings
// @access  Public
export const getActiveMarquees = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * 
            FROM text_marquee 
            WHERE is_active = TRUE 
            ORDER BY created_at DESC
        `);
        // Return structured response
        res.json({
            items: result.rows,
            settings: globalSettings
        });
    } catch (error) {
        const err = error as Error;
        console.error('Get marquees error:', err);
        // Handle missing table gracefully
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
            return res.json({
                items: [],
                settings: globalSettings,
                message: 'Marquee table not initialized'
            });
        }
        res.status(500).json({ message: 'Failed to fetch marquee messages' });
    }
};

// @desc    Update marquee global settings
// @access  Private (Admin)
export const updateMarqueeSettings = async (req: Request, res: Response) => {
    try {
        const { isPlaying, direction, speed, preset } = req.body;
        if (isPlaying !== undefined) globalSettings.isPlaying = isPlaying;
        if (direction !== undefined) globalSettings.direction = direction;
        if (speed !== undefined) globalSettings.speed = speed;
        if (preset !== undefined) globalSettings.preset = preset;

        res.json(globalSettings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};

// @desc    Toggle marquee status (Admin or Owner)
// @access  Private
export const toggleMarquee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role;

        let query = 'UPDATE text_marquee SET is_active = $1 WHERE marquee_id = $2';
        const params = [is_active, id];

        if (userRole !== 'admin') {
            query += ' AND user_id = $3';
            params.push(userId);
        }

        const result = await pool.query(query + ' RETURNING *', params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Marquee not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Toggle marquee error:', error);
        res.status(500).json({ message: 'Failed to update marquee status' });
    }
};

// @desc    Clear all active marquees
// @access  Private (Admin/Owner)
export const clearAllMarquees = async (req: Request, res: Response) => {
    try {
        await pool.query('UPDATE text_marquee SET is_active = false WHERE is_active = true');
        res.json({ message: 'All marquees cleared' });
    } catch (error) {
        console.error('Clear marquees error:', error);
        res.status(500).json({ message: 'Failed to clear marquees' });
    }
};
