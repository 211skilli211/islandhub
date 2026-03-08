import { Request, Response } from 'express';
// refresh
import { pool } from '../config/db';
import { createNotification } from './notificationController';

// @desc    Create a new comment
// @access  Private
export const createComment = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { post_id, parent_id, content } = req.body;

        if (!content || !post_id) {
            return res.status(400).json({ message: 'Content and post_id are required' });
        }

        // Check if post exists
        const postCheck = await pool.query(
            'SELECT user_id FROM user_posts WHERE post_id = $1',
            [post_id]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check nesting level for replies
        if (parent_id) {
            const parentCheck = await pool.query(
                'SELECT parent_id, user_id FROM post_comments WHERE comment_id = $1',
                [parent_id]
            );

            if (parentCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }

            // Check if this is already a 3rd level comment
            if (parentCheck.rows[0].parent_id) {
                const grandparentCheck = await pool.query(
                    'SELECT parent_id FROM post_comments WHERE comment_id = $1',
                    [parentCheck.rows[0].parent_id]
                );

                if (grandparentCheck.rows[0]?.parent_id) {
                    return res.status(400).json({ message: 'Maximum reply depth (3 levels) reached' });
                }
            }

            // Create notification for parent comment author (if different from commenter)
            if (parentCheck.rows[0].user_id !== userId) {
                await createNotification({
                    userId: parentCheck.rows[0].user_id,
                    type: 'comment_reply',
                    title: 'New Reply',
                    body: 'Someone replied to your comment',
                    data: { post_id, comment_id: parent_id, reply_id: null }
                });
            }
        } else {
            // Create notification for post author
            if (postCheck.rows[0].user_id !== userId) {
                await createNotification({
                    userId: postCheck.rows[0].user_id,
                    type: 'new_comment',
                    title: 'New Comment',
                    body: 'Someone commented on your post',
                    data: { post_id }
                });
            }
        }

        const result = await pool.query(
            'INSERT INTO post_comments (post_id, user_id, parent_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [post_id, userId, parent_id || null, content]
        );

        // Update comments count on post
        await pool.query(
            'UPDATE user_posts SET comments_count = comments_count + 1 WHERE post_id = $1',
            [post_id]
        );

        // Get user info for response
        const userResult = await pool.query(
            'SELECT name, profile_photo_url FROM users WHERE user_id = $1',
            [userId]
        );

        const comment = {
            ...result.rows[0],
            user_name: userResult.rows[0]?.name,
            user_photo: userResult.rows[0]?.profile_photo_url,
            likes_count: 0,
            replies: []
        };

        res.status(201).json(comment);
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Failed to create comment' });
    }
};

// @desc    Get comments for a post
// @access  Public
export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = (req.user as any)?.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        // Get top-level comments (no parent_id)
        const commentsResult = await pool.query(
            `SELECT 
                c.comment_id, c.post_id, c.user_id, c.parent_id, c.content, 
                c.created_at, c.updated_at, c.is_hidden, c.is_edited,
                u.name as user_name, u.profile_photo_url as user_photo,
                (SELECT COUNT(*) FROM post_comments WHERE parent_id = c.comment_id) as replies_count,
                (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.comment_id) as likes_count
            FROM post_comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.post_id = $1 AND c.parent_id IS NULL AND c.is_hidden = FALSE
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3`,
            [postId, limit, offset]
        );

        // Get replies for each comment
        const comments = await Promise.all(commentsResult.rows.map(async (comment: any) => {
            const repliesResult = await pool.query(
                `SELECT 
                    c.comment_id, c.post_id, c.user_id, c.parent_id, c.content,
                    c.created_at, c.updated_at, c.is_hidden, c.is_edited,
                    u.name as user_name, u.profile_photo_url as user_photo,
                    (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.comment_id) as likes_count
                FROM post_comments c
                JOIN users u ON c.user_id = u.user_id
                WHERE c.parent_id = $1 AND c.is_hidden = FALSE
                ORDER BY c.created_at ASC`,
                [comment.comment_id]
            );

            // Check if current user liked each comment
            let userLikedTop = false;
            if (userId) {
                const likeCheck = await pool.query(
                    'SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
                    [userId, comment.comment_id]
                );
                userLikedTop = likeCheck.rows.length > 0;
            }

            return {
                ...comment,
                user_liked: userLikedTop,
                replies: repliesResult.rows.map((r: any) => ({
                    ...r,
                    user_liked: false
                }))
            };
        }));

        res.json({
            comments,
            total: comments.length
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
};

// @desc    Update a comment
// @access  Private (owner only)
export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Check if comment exists and user owns it
        const commentCheck = await pool.query(
            'SELECT user_id FROM post_comments WHERE comment_id = $1',
            [id]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (commentCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        // Check if within 15-minute edit window
        const timeCheck = await pool.query(
            'SELECT created_at FROM post_comments WHERE comment_id = $1',
            [id]
        );

        const createdAt = new Date(timeCheck.rows[0].created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (diffMinutes > 15) {
            return res.status(400).json({ message: 'Edit window expired (15 minutes)' });
        }

        const result = await pool.query(
            'UPDATE post_comments SET content = $1, is_edited = TRUE, updated_at = CURRENT_TIMESTAMP WHERE comment_id = $2 RETURNING *',
            [content, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Failed to update comment' });
    }
};

// @desc    Delete a comment
// @access  Private (owner only)
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role;

        // Check if comment exists
        const commentCheck = await pool.query(
            'SELECT user_id, post_id, parent_id FROM post_comments WHERE comment_id = $1',
            [id]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Allow delete if owner or admin
        if (commentCheck.rows[0].user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Soft delete (hide) instead of hard delete to preserve thread structure
        await pool.query(
            'UPDATE post_comments SET is_hidden = TRUE WHERE comment_id = $1',
            [id]
        );

        // Update comments count on post
        await pool.query(
            'UPDATE user_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE post_id = $1',
            [commentCheck.rows[0].post_id]
        );

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};

// @desc    Like a comment
// @access  Private
export const likeComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const reaction_type = req.body.reaction_type || 'like';

        // Check if comment exists
        const commentCheck = await pool.query(
            'SELECT user_id FROM post_comments WHERE comment_id = $1',
            [id]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if already liked
        const existingLike = await pool.query(
            'SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingLike.rows.length > 0) {
            // Update reaction type
            await pool.query(
                'UPDATE comment_likes SET reaction_type = $1 WHERE comment_id = $2 AND user_id = $3',
                [reaction_type, id, userId]
            );
        } else {
            // Create new like
            await pool.query(
                'INSERT INTO comment_likes (comment_id, user_id, reaction_type) VALUES ($1, $2, $3)',
                [id, userId, reaction_type]
            );

            // Create notification for comment author (if not self)
            if (commentCheck.rows[0].user_id !== userId) {
                await createNotification({
                    userId: commentCheck.rows[0].user_id,
                    type: 'like_comment',
                    title: 'New Like',
                    body: 'Someone liked your comment',
                    data: { comment_id: id }
                });
            }
        }

        // Get updated likes count
        const likesCount = await pool.query(
            'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1',
            [id]
        );

        res.json({
            success: true,
            likes_count: parseInt(likesCount.rows[0].count),
            user_liked: true,
            reaction_type
        });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({ message: 'Failed to like comment' });
    }
};

// @desc    Unlike a comment
// @access  Private
export const unlikeComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
            [id, userId]
        );

        // Get updated likes count
        const likesCount = await pool.query(
            'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1',
            [id]
        );

        res.json({
            success: true,
            likes_count: parseInt(likesCount.rows[0].count),
            user_liked: false
        });
    } catch (error) {
        console.error('Unlike comment error:', error);
        res.status(500).json({ message: 'Failed to unlike comment' });
    }
};

// @desc    Get comment likes
// @access  Public
export const getCommentLikes = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT cl.like_id, cl.comment_id, cl.user_id, cl.reaction_type, cl.created_at,
                    u.name as user_name, u.profile_photo_url as user_photo
             FROM comment_likes cl
             JOIN users u ON cl.user_id = u.user_id
             WHERE cl.comment_id = $1
             ORDER BY cl.created_at DESC`,
            [id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get comment likes error:', error);
        res.status(500).json({ message: 'Failed to fetch likes' });
    }
};


