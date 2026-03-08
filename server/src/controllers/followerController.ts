import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';
import { createNotification } from './notificationController';

// @desc    Follow a user
// @access  Private
export const followUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params; // The user to follow
        const followerId = (req.user as any)?.id; // Current user

        if (parseInt(userId) === followerId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        // Check if user exists
        const userCheck = await pool.query(
            'SELECT user_id, name FROM users WHERE user_id = $1',
            [userId]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        const existingFollow = await pool.query(
            'SELECT * FROM user_followers WHERE follower_id = $1 AND following_id = $2',
            [followerId, userId]
        );

        if (existingFollow.rows.length > 0) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Check if user has blocked the follower
        const blockCheck = await pool.query(
            'SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
            [userId, followerId]
        );

        if (blockCheck.rows.length > 0) {
            return res.status(403).json({ message: 'You are blocked by this user' });
        }

        // Create follow
        await pool.query(
            'INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2)',
            [followerId, userId]
        );

        // Update counts
        await pool.query(
            'UPDATE users SET followers_count = followers_count + 1 WHERE user_id = $1',
            [userId]
        );
        await pool.query(
            'UPDATE users SET following_count = following_count + 1 WHERE user_id = $1',
            [followerId]
        );

        // Create notification
        await createNotification({
            userId: parseInt(userId),
            type: 'new_follower',
            title: 'New Follower',
            body: `${userCheck.rows[0].name} started following you`,
            data: { follower_id: followerId }
        });

        res.json({
            success: true,
            message: 'Successfully followed user',
            following: true
        });
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ message: 'Failed to follow user' });
    }
};

// @desc    Unfollow a user
// @access  Private
export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const followerId = (req.user as any)?.id;

        const result = await pool.query(
            'DELETE FROM user_followers WHERE follower_id = $1 AND following_id = $2 RETURNING *',
            [followerId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Not following this user' });
        }

        // Update counts
        await pool.query(
            'UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = $1',
            [userId]
        );
        await pool.query(
            'UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = $1',
            [followerId]
        );

        res.json({
            success: true,
            message: 'Successfully unfollowed user',
            following: false
        });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ message: 'Failed to unfollow user' });
    }
};

// @desc    Get followers of a user
// @access  Public
export const getFollowers = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = (req.user as any)?.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT u.user_id, u.name, u.email, u.profile_photo_url, u.bio, u.followers_count, u.following_count,
                    uf.created_at as followed_at
             FROM user_followers uf
             JOIN users u ON uf.follower_id = u.user_id
             WHERE uf.following_id = $1
             ORDER BY uf.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Check if current user follows any of these users
        let followingIds: number[] = [];
        if (currentUserId) {
            const followingResult = await pool.query(
                'SELECT following_id FROM user_followers WHERE follower_id = $1 AND following_id = ANY($2)',
                [currentUserId, result.rows.map((r: any) => r.user_id)]
            );
            followingIds = followingResult.rows.map((r: any) => r.following_id);
        }

        const followers = result.rows.map((r: any) => ({
            ...r,
            is_following: followingIds.includes(r.user_id)
        }));

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM user_followers WHERE following_id = $1',
            [userId]
        );

        res.json({
            followers,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: 'Failed to fetch followers' });
    }
};

// @desc    Get users that a user follows
// @access  Public
export const getFollowing = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = (req.user as any)?.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT u.user_id, u.name, u.email, u.profile_photo_url, u.bio, u.followers_count, u.following_count,
                    uf.created_at as followed_at
             FROM user_followers uf
             JOIN users u ON uf.following_id = u.user_id
             WHERE uf.follower_id = $1
             ORDER BY uf.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Check if current user follows any of these users
        let followingIds: number[] = [];
        if (currentUserId) {
            const followingResult = await pool.query(
                'SELECT following_id FROM user_followers WHERE follower_id = $1 AND following_id = ANY($2)',
                [currentUserId, result.rows.map((r: any) => r.user_id)]
            );
            followingIds = followingResult.rows.map((r: any) => r.following_id);
        }

        const following = result.rows.map((r: any) => ({
            ...r,
            is_following: followingIds.includes(r.user_id)
        }));

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM user_followers WHERE follower_id = $1',
            [userId]
        );

        res.json({
            following,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ message: 'Failed to fetch following' });
    }
};

// @desc    Get follow status between current user and target user
// @access  Private
export const getFollowStatus = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = (req.user as any)?.id;

        // Check if current user follows target
        const followingCheck = await pool.query(
            'SELECT * FROM user_followers WHERE follower_id = $1 AND following_id = $2',
            [currentUserId, userId]
        );

        // Check if target follows current user
        const followersCheck = await pool.query(
            'SELECT * FROM user_followers WHERE follower_id = $1 AND following_id = $2',
            [userId, currentUserId]
        );

        res.json({
            is_following: followingCheck.rows.length > 0,
            is_followed_by: followersCheck.rows.length > 0
        });
    } catch (error) {
        console.error('Get follow status error:', error);
        res.status(500).json({ message: 'Failed to get follow status' });
    }
};

