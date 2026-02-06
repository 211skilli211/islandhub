
import { Request, Response } from 'express';
import { pool } from '../config/db';

// @desc    Create a new post
// @access  Private
export const createPost = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { title, content, media_url, media_type, category } = req.body;

        const result = await pool.query(
            `INSERT INTO user_posts (user_id, title, content, media_url, media_type, category)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [userId, title, content, media_url, media_type, category]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// @desc    Get all posts with filtering
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category, userId } = req.query;
        let query = `
            SELECT p.*, u.name as user_name, u.profile_photo_url 
            FROM user_posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (category) {
            query += ` AND p.category = $${params.length + 1}`;
            params.push(category);
        }

        if (userId) {
            query += ` AND p.user_id = $${params.length + 1}`;
            params.push(userId);
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

// @desc    Delete a post
// @access  Private
export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            'DELETE FROM user_posts WHERE post_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};
