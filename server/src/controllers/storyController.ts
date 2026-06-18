import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';

// @desc    Get stories feed
// @access  Public
export const getStoriesFeed = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { limit = 20 } = req.query;

        // Get stories from followed users and public stories (last 24 hours)
        let query = `
            SELECT s.*, u.name as user_name, u.profile_photo_url as user_photo,
                   (SELECT COUNT(*) FROM story_views WHERE story_id = s.story_id) as view_count
            FROM stories s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.expires_at > CURRENT_TIMESTAMP AND s.is_active = TRUE
        `;

        if (userId) {
            query += `
                AND (s.user_id = $1 OR s.user_id IN 
                    (SELECT following_id FROM user_followers WHERE follower_id = $1))
            `;
        }

        query += `
            ORDER BY s.created_at DESC
            LIMIT $${userId ? 2 : 1}
        `;

        const params = userId ? [userId, limit] : [limit];
        const result = await pool.query(query, params);

        // Group stories by user
        const storiesByUser: Record<number, any[]> = {};
        for (const story of result.rows) {
            if (!storiesByUser[story.user_id]) {
                storiesByUser[story.user_id] = [];
            }
            storiesByUser[story.user_id].push(story);
        }

        // Format response
        const feed = Object.entries(storiesByUser).map(([userId, stories]) => ({
            user_id: parseInt(userId),
            user_name: stories[0].user_name,
            user_photo: stories[0].user_photo,
            stories
        }));

        // Check view status if logged in
        if (userId) {
            for (const group of feed) {
                const viewedStories = await pool.query(
                    'SELECT story_id FROM story_views WHERE user_id = $1 AND story_id = ANY($2)',
                    [userId, group.stories.map((s: any) => s.story_id)]
                );
                const viewedIds = viewedStories.rows.map((r: any) => r.story_id);
                group.stories.forEach((s: any) => {
                    s.user_viewed = viewedIds.includes(s.story_id);
                });
            }
        }

        res.json(feed);
    } catch (error) {
        console.error('Get stories feed error:', error);
        res.status(500).json({ message: 'Failed to fetch stories' });
    }
};

// @desc    Get user's stories
// @access  Public
export const getUserStories = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT s.*, u.name as user_name, u.profile_photo_url as user_photo,
                    (SELECT COUNT(*) FROM story_views WHERE story_id = s.story_id) as view_count
             FROM stories s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.user_id = $1 AND s.expires_at > CURRENT_TIMESTAMP AND s.is_active = TRUE
             ORDER BY s.created_at DESC`,
            [userId]
        );

        // Get highlights
        const highlightsResult = await pool.query(
            `SELECT sh.*, s.media_url, s.media_type
             FROM story_highlights sh
             LEFT JOIN stories s ON sh.cover_story_id = s.story_id
             WHERE sh.user_id = $1`,
            [userId]
        );

        // Check view status
        if (currentUserId) {
            for (const story of result.rows) {
                const viewCheck = await pool.query(
                    'SELECT * FROM story_views WHERE story_id = $1 AND user_id = $2',
                    [story.story_id, currentUserId]
                );
                story.user_viewed = viewCheck.rows.length > 0;
            }
        }

        res.json({
            stories: result.rows,
            highlights: highlightsResult.rows
        });
    } catch (error) {
        console.error('Get user stories error:', error);
        res.status(500).json({ message: 'Failed to fetch stories' });
    }
};

// @desc    Get user's highlights
// @access  Private
export const getHighlights = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT sh.*, 
                    s.media_url, s.media_type,
                    (SELECT COUNT(*) FROM highlight_stories WHERE highlight_id = sh.highlight_id) as story_count
             FROM story_highlights sh
             LEFT JOIN stories s ON sh.cover_story_id = s.story_id
             WHERE sh.user_id = $1
             ORDER BY sh.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get highlights error:', error);
        res.status(500).json({ message: 'Failed to fetch highlights' });
    }
};

// @desc    Create a story
// @access  Private
export const createStory = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { media_url, media_type, caption } = req.body;

        if (!media_url) {
            return res.status(400).json({ message: 'Media URL is required' });
        }

        // Stories expire in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const result = await pool.query(
            `INSERT INTO stories (user_id, media_url, media_type, caption, expires_at)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, media_url, media_type || 'image', caption, expiresAt]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create story error:', error);
        res.status(500).json({ message: 'Failed to create story' });
    }
};

// @desc    Delete a story
// @access  Private (owner only)
export const deleteStory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            'DELETE FROM stories WHERE story_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found or not authorized' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete story error:', error);
        res.status(500).json({ message: 'Failed to delete story' });
    }
};

// @desc    Record story view
// @access  Private
export const viewStory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        // Check if story exists
        const storyCheck = await pool.query('SELECT * FROM stories WHERE story_id = $1', [id]);
        if (storyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Don't record self-views
        if (storyCheck.rows[0].user_id === userId) {
            return res.json({ success: true });
        }

        // Record view
        await pool.query(
            'INSERT INTO story_views (story_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('View story error:', error);
        res.status(500).json({ message: 'Failed to record view' });
    }
};

// @desc    Create a highlight
// @access  Private
export const createHighlight = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { title, story_ids } = req.body;

        if (!title || !story_ids || story_ids.length === 0) {
            return res.status(400).json({ message: 'Title and at least one story required' });
        }

        // Verify all stories belong to user
        const storiesCheck = await pool.query(
            'SELECT story_id FROM stories WHERE story_id = ANY($1) AND user_id = $2',
            [story_ids, userId]
        );

        if (storiesCheck.rows.length !== story_ids.length) {
            return res.status(400).json({ message: 'Some stories do not belong to you' });
        }

        // Create highlight
        const highlightResult = await pool.query(
            'INSERT INTO story_highlights (user_id, title, cover_story_id) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, story_ids[0]]
        );

        const highlightId = highlightResult.rows[0].highlight_id;

        // Add stories to highlight
        for (const storyId of story_ids) {
            await pool.query(
                'INSERT INTO highlight_stories (highlight_id, story_id) VALUES ($1, $2)',
                [highlightId, storyId]
            );
        }

        res.status(201).json(highlightResult.rows[0]);
    } catch (error) {
        console.error('Create highlight error:', error);
        res.status(500).json({ message: 'Failed to create highlight' });
    }
};

