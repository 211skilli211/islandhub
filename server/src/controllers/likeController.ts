import { Request, Response } from 'express';
import { pool } from '../config/db';
import { createNotification } from './notificationController';

// @desc    Like a post
// @access  Private
export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = (req.user as any)?.id;
        const reaction_type = req.body.reaction_type || 'like';

        // Check if post exists
        const postCheck = await pool.query(
            'SELECT user_id FROM user_posts WHERE post_id = $1',
            [postId]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        const existingLike = await pool.query(
            'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (existingLike.rows.length > 0) {
            // Update reaction type
            await pool.query(
                'UPDATE post_likes SET reaction_type = $1 WHERE post_id = $2 AND user_id = $3',
                [reaction_type, postId, userId]
            );
        } else {
            // Create new like
            await pool.query(
                'INSERT INTO post_likes (post_id, user_id, reaction_type) VALUES ($1, $2, $3)',
                [postId, userId, reaction_type]
            );

            // Create notification for post author (if not self)
            if (postCheck.rows[0].user_id !== userId) {
                await createNotification({
                    userId: postCheck.rows[0].user_id,
                    type: 'like_post',
                    title: 'New Like',
                    body: 'Someone liked your post',
                    data: { post_id: postId }
                });
            }
        }

        // Get updated likes count and top reactions
        const likesCount = await pool.query(
            'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1',
            [postId]
        );

        const topReactions = await pool.query(
            `SELECT reaction_type, COUNT(*) as count 
             FROM post_likes 
             WHERE post_id = $1 
             GROUP BY reaction_type 
             ORDER BY count DESC 
             LIMIT 3`,
            [postId]
        );

        // Update likes count on post
        await pool.query(
            'UPDATE user_posts SET likes_count = $1 WHERE post_id = $2',
            [likesCount.rows[0].count, postId]
        );

        res.json({
            success: true,
            likes_count: parseInt(likesCount.rows[0].count),
            user_liked: true,
            reaction_type,
            top_reactions: topReactions.rows
        });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Failed to like post' });
    }
};

// @desc    Unlike a post
// @access  Private
export const unlikePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        // Get updated likes count
        const likesCount = await pool.query(
            'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1',
            [postId]
        );

        // Update likes count on post
        await pool.query(
            'UPDATE user_posts SET likes_count = $1 WHERE post_id = $2',
            [likesCount.rows[0].count, postId]
        );

        res.json({
            success: true,
            likes_count: parseInt(likesCount.rows[0].count),
            user_liked: false
        });
    } catch (error) {
        console.error('Unlike post error:', error);
        res.status(500).json({ message: 'Failed to unlike post' });
    }
};

// @desc    Get all likes for a post
// @access  Public
export const getPostLikes = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT pl.*, u.name as user_name, u.profile_photo_url as user_photo
             FROM post_likes pl
             JOIN users u ON pl.user_id = u.user_id
             WHERE pl.post_id = $1
             ORDER BY pl.created_at DESC`,
            [postId]
        );

        // Check if current user liked the post
        let userLiked = false;
        let userReaction = null;
        if (userId) {
            const userLike = result.rows.find((r: any) => r.user_id === userId);
            if (userLike) {
                userLiked = true;
                userReaction = userLike.reaction_type;
            }
        }

        // Get top reactions
        const topReactions = await pool.query(
            `SELECT reaction_type, COUNT(*) as count 
             FROM post_likes 
             WHERE post_id = $1 
             GROUP BY reaction_type 
             ORDER BY count DESC 
             LIMIT 3`,
            [postId]
        );

        res.json({
            likes: result.rows,
            likes_count: result.rows.length,
            user_liked: userLiked,
            user_reaction: userReaction,
            top_reactions: topReactions.rows
        });
    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ message: 'Failed to fetch likes' });
    }
};

// @desc    Get posts liked by current user
// @access  Private
export const getUserLikedPosts = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT p.*, pl.reaction_type, pl.created_at as liked_at
             FROM post_likes pl
             JOIN user_posts p ON pl.post_id = p.post_id
             WHERE pl.user_id = $1 AND p.is_hidden = FALSE
             ORDER BY pl.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get user liked posts error:', error);
        res.status(500).json({ message: 'Failed to fetch liked posts' });
    }
};
