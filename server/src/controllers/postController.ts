
import { Request, Response } from 'express';
import { pool } from '../config/db';

// @desc    Create a new post
// @access  Private
export const createPost = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { title, content, media_url, media_type, category, visibility, media } = req.body;

        // Handle single media_url or array of media
        const mediaUrls = media ? JSON.stringify(media) : (media_url ? JSON.stringify([media_url]) : null);

        const result = await pool.query(
            `INSERT INTO user_posts (user_id, title, content, media_url, media_type, category, visibility)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [userId, title, content, mediaUrls, media_type, category, visibility || 'public']
        );

        // Get the user info for the response
        const userResult = await pool.query(
            'SELECT user_id, name, profile_photo_url FROM users WHERE user_id = $1',
            [userId]
        );

        const post = {
            ...result.rows[0],
            user: userResult.rows[0],
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
            is_bookmarked: false
        };

        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// @desc    Get all posts with filtering
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category, userId, limit = 20, offset = 0 } = req.query;
        const currentUserId = (req.user as any)?.id;

        const params: any[] = [];
        let paramIndex = 1;

        let query = `
            SELECT 
                p.*, 
                u.name as user_name, 
                u.profile_photo_url,
                COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id), 0) as likes_count,
                COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.post_id), 0) as comments_count
        `;

        // Add current user interactions if logged in
        if (currentUserId) {
            query += `,
                EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.post_id AND user_id = $${paramIndex}) as is_liked,
                EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.post_id AND user_id = $${paramIndex}) as is_bookmarked
            `;
            params.push(currentUserId);
            paramIndex++;
        } else {
            query += `,
                false as is_liked,
                false as is_bookmarked
            `;
        }

        query += `
            FROM user_posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE (p.is_hidden = false OR p.is_hidden IS NULL)
        `;

        if (category) {
            query += ` AND p.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (userId) {
            query += ` AND p.user_id = $${paramIndex}`;
            params.push(userId);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(Number(limit), Number(offset));

        const result = await pool.query(query, params);

        // Parse media if it's JSON string
        const posts = result.rows.map(row => {
            let media = [];
            if (row.media_url) {
                try {
                    media = typeof row.media_url === 'string' ? JSON.parse(row.media_url) : row.media_url;
                } catch (e) {
                    console.warn('Failed to parse media_url:', row.media_url);
                    media = [row.media_url];
                }
            }
            return {
                ...row,
                media,
                is_liked: !!row.is_liked,
                is_bookmarked: !!row.is_bookmarked
            };
        });

        res.json(posts);
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
