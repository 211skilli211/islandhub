import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';
import { createNotification } from './notificationController';

// Helper to generate slug
const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// @desc    Get all groups
// @access  Public
export const getGroups = async (req: Request, res: Response) => {
    try {
        const { category, privacy, limit = 20, offset = 0 } = req.query;
        const userId = (req.user as any)?.id;

        let query = `
            SELECT g.*, 
                   u.name as owner_name,
                   (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) as member_count
            FROM groups g
            JOIN users u ON g.owner_id = u.user_id
            WHERE g.visibility = 'public'
        `;
        const params: any[] = [];

        if (category) {
            query += ' AND g.category = $' + (params.length + 1);
            params.push(category);
        }

        if (privacy) {
            query += ' AND g.privacy = $' + (params.length + 1);
            params.push(privacy);
        }

        query += ' ORDER BY g.member_count DESC, g.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Check membership for each group if logged in
        if (userId) {
            const groups = result.rows;
            for (const group of groups) {
                const memberCheck = await pool.query(
                    'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
                    [group.group_id, userId]
                );
                group.is_member = memberCheck.rows.length > 0;
                group.user_role = memberCheck.rows[0]?.role;
            }
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
};

// @desc    Get group details
// @access  Public
export const getGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT g.*, u.name as owner_name, u.profile_photo_url as owner_photo
             FROM groups g
             JOIN users u ON g.owner_id = u.user_id
             WHERE g.group_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const group = result.rows[0];

        // Check membership
        if (userId) {
            const memberCheck = await pool.query(
                'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
                [id, userId]
            );
            group.is_member = memberCheck.rows.length > 0;
            group.user_role = memberCheck.rows[0]?.role;
        }

        res.json(group);
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ message: 'Failed to fetch group' });
    }
};

// @desc    Create a group
// @access  Private
export const createGroup = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { name, description, privacy, category, cover_image_url, avatar_url, tags } = req.body;

        const slug = generateSlug(name);

        // Check if slug exists
        const slugCheck = await pool.query('SELECT group_id FROM groups WHERE slug = $1', [slug]);
        const finalSlug = slugCheck.rows.length > 0 ? `${slug}-${Date.now()}` : slug;

        const result = await pool.query(
            `INSERT INTO groups (name, slug, description, privacy, category, owner_id, cover_image_url, avatar_url, tags)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, finalSlug, description, privacy || 'public', category, userId, cover_image_url, avatar_url, tags]
        );

        const groupId = result.rows[0].group_id;

        // Add owner as admin member
        await pool.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
            [groupId, userId, 'owner']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ message: 'Failed to create group' });
    }
};

// @desc    Update group
// @access  Private (owner/admin)
export const updateGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { name, description, privacy, category, cover_image_url, avatar_url, tags } = req.body;

        // Check ownership
        const ownerCheck = await pool.query('SELECT owner_id FROM groups WHERE group_id = $1', [id]);
        if (ownerCheck.rows[0]?.owner_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        const result = await pool.query(
            `UPDATE groups SET name = COALESCE($1, name), description = COALESCE($2, description),
             privacy = COALESCE($3, privacy), category = COALESCE($4, category),
             cover_image_url = COALESCE($5, cover_image_url), avatar_url = COALESCE($6, avatar_url),
             tags = COALESCE($7, tags), updated_at = CURRENT_TIMESTAMP
             WHERE group_id = $8 RETURNING *`,
            [name, description, privacy, category, cover_image_url, avatar_url, tags, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ message: 'Failed to update group' });
    }
};

// @desc    Delete group
// @access  Private (owner)
export const deleteGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const ownerCheck = await pool.query('SELECT owner_id FROM groups WHERE group_id = $1', [id]);
        if (ownerCheck.rows[0]?.owner_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }

        await pool.query('DELETE FROM groups WHERE group_id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ message: 'Failed to delete group' });
    }
};

// @desc    Join group
// @access  Private
export const joinGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        // Check if group exists and is public
        const groupCheck = await pool.query('SELECT * FROM groups WHERE group_id = $1', [id]);
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const group = groupCheck.rows[0];

        // Check if already member
        const memberCheck = await pool.query(
            'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
            [id, userId]
        );
        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Already a member' });
        }

        // Check if blocked
        const blockCheck = await pool.query(
            'SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
            [group.owner_id, userId]
        );
        if (blockCheck.rows.length > 0) {
            return res.status(403).json({ message: 'You are blocked from this group' });
        }

        if (group.privacy === 'private' || group.privacy === 'invite_only') {
            return res.status(400).json({ message: 'This group requires approval to join' });
        }

        // Add member
        await pool.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
            [id, userId, 'member']
        );

        // Update count
        await pool.query(
            'UPDATE groups SET member_count = member_count + 1 WHERE group_id = $1',
            [id]
        );

        res.json({ success: true, message: 'Successfully joined group' });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ message: 'Failed to join group' });
    }
};

// @desc    Leave group
// @access  Private
export const leaveGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 AND role != $3 RETURNING *',
            [id, userId, 'owner']
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Cannot leave group (owner cannot leave)' });
        }

        await pool.query(
            'UPDATE groups SET member_count = GREATEST(member_count - 1, 0) WHERE group_id = $1',
            [id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ message: 'Failed to leave group' });
    }
};

// @desc    Get group members
// @access  Public
export const getGroupMembers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT gm.*, u.name, u.profile_photo_url, u.bio
             FROM group_members gm
             JOIN users u ON gm.user_id = u.user_id
             WHERE gm.group_id = $1
             ORDER BY gm.role DESC, gm.joined_at ASC
             LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({ message: 'Failed to fetch members' });
    }
};

// @desc    Get group posts
// @access  Public
export const getGroupPosts = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT gp.*, u.name as user_name, u.profile_photo_url as user_photo
             FROM group_posts gp
             JOIN users u ON gp.user_id = u.user_id
             WHERE gp.group_id = $1 AND gp.is_hidden = FALSE
             ORDER BY gp.is_pinned DESC, gp.created_at DESC
             LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get group posts error:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

// @desc    Create group post
// @access  Private (members only)
export const createGroupPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { content, media_url, media_type, is_announcement } = req.body;

        // Check membership
        const memberCheck = await pool.query(
            'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Must be a member to post' });
        }

        const result = await pool.query(
            `INSERT INTO group_posts (group_id, user_id, content, media_url, media_type, is_announcement)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, userId, content, media_url, media_type, is_announcement || false]
        );

        // Update post count
        await pool.query(
            'UPDATE groups SET post_count = post_count + 1 WHERE group_id = $1',
            [id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create group post error:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// @desc    Request to join group
// @access  Private
export const requestToJoin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { message } = req.body;

        // Check if already member
        const memberCheck = await pool.query(
            'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Already a member' });
        }

        // Check if request already exists
        const requestCheck = await pool.query(
            'SELECT status FROM group_join_requests WHERE group_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (requestCheck.rows.length > 0 && requestCheck.rows[0].status === 'pending') {
            return res.status(400).json({ message: 'Request already pending' });
        }

        await pool.query(
            'INSERT INTO group_join_requests (group_id, user_id, message) VALUES ($1, $2, $3)',
            [id, userId, message]
        );

        res.json({ success: true, message: 'Join request submitted' });
    } catch (error) {
        console.error('Request to join error:', error);
        res.status(500).json({ message: 'Failed to submit request' });
    }
};

