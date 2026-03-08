import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';

// @desc    Bookmark a post
// @access  Private
export const bookmarkPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = (req.user as any)?.id;
        const { folder = 'default' } = req.body;

        // Check if post exists
        const postCheck = await pool.query(
            'SELECT post_id FROM user_posts WHERE post_id = $1',
            [postId]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already bookmarked
        const existingBookmark = await pool.query(
            'SELECT * FROM bookmarks WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );

        if (existingBookmark.rows.length > 0) {
            // Update folder if different
            await pool.query(
                'UPDATE bookmarks SET folder = $1 WHERE user_id = $2 AND post_id = $3',
                [folder, userId, postId]
            );
            return res.json({ success: true, bookmarked: true, folder });
        }

        // Create bookmark
        await pool.query(
            'INSERT INTO bookmarks (user_id, post_id, folder) VALUES ($1, $2, $3)',
            [userId, postId, folder]
        );

        res.json({ success: true, bookmarked: true, folder });
    } catch (error) {
        console.error('Bookmark post error:', error);
        res.status(500).json({ message: 'Failed to bookmark post' });
    }
};

// @desc    Remove bookmark
// @access  Private
export const removeBookmark = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );

        res.json({ success: true, bookmarked: false });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({ message: 'Failed to remove bookmark' });
    }
};

// @desc    Get user's bookmarks
// @access  Private
export const getBookmarks = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { folder = 'default', limit = 20, offset = 0 } = req.query;

        let query = `
            SELECT b.*, p.title, p.content, p.media_url, p.media_type, p.category, p.created_at as post_created_at
            FROM bookmarks b
            JOIN user_posts p ON b.post_id = p.post_id
            WHERE b.user_id = $1
        `;

        const params: any[] = [userId];

        if (folder && folder !== 'all') {
            query += ' AND b.folder = $2';
            params.push(folder);
        }

        query += ' ORDER BY b.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }
};

// @desc    Get bookmark folders
// @access  Private
export const getBookmarkFolders = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT folder, COUNT(*) as count 
             FROM bookmarks 
             WHERE user_id = $1 
             GROUP BY folder 
             ORDER BY folder`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get bookmark folders error:', error);
        res.status(500).json({ message: 'Failed to fetch folders' });
    }
};

