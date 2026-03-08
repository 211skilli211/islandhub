import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';

// @desc    Get all community events
// @access  Public
export const getEvents = async (req: Request, res: Response) => {
    try {
        const { category, start_date, end_date, limit = 20, offset = 0 } = req.query;
        const userId = (req.user as any)?.id;

        let query = `
            SELECT ce.*, u.name as organizer_name, u.profile_photo_url as organizer_photo,
                   (SELECT COUNT(*) FROM event_rsvps WHERE event_id = ce.event_id AND status = 'attending') as attendee_count,
                   (SELECT COUNT(*) FROM event_rsvps WHERE event_id = ce.event_id AND status = 'interested') as interested_count
            FROM community_events ce
            JOIN users u ON ce.organizer_id = u.user_id
            WHERE ce.is_cancelled = FALSE AND ce.start_time > CURRENT_TIMESTAMP
        `;
        const params: any[] = [];

        if (category) {
            query += ' AND ce.category = $' + (params.length + 1);
            params.push(category);
        }

        if (start_date) {
            query += ' AND ce.start_time >= $' + (params.length + 1);
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND ce.start_time <= $' + (params.length + 1);
            params.push(end_date);
        }

        query += ' ORDER BY ce.start_time ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Check RSVP status if logged in
        if (userId) {
            const events = result.rows;
            for (const event of events) {
                const rsvpCheck = await pool.query(
                    'SELECT status FROM event_rsvps WHERE event_id = $1 AND user_id = $2',
                    [event.event_id, userId]
                );
                event.user_rsvp = rsvpCheck.rows[0]?.status || null;
            }
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// @desc    Get user's events
// @access  Private
export const getMyEvents = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT ce.*, er.status as user_rsvp
             FROM community_events ce
             JOIN event_rsvps er ON ce.event_id = er.event_id
             WHERE er.user_id = $1 AND ce.is_cancelled = FALSE
             ORDER BY ce.start_time ASC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// @desc    Get event details
// @access  Public
export const getEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT ce.*, u.name as organizer_name, u.profile_photo_url as organizer_photo
             FROM community_events ce
             JOIN users u ON ce.organizer_id = u.user_id
             WHERE ce.event_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const event = result.rows[0];

        // Get attendee count
        const attendeeCount = await pool.query(
            'SELECT COUNT(*) FROM event_rsvps WHERE event_id = $1 AND status = $2',
            [id, 'attending']
        );
        event.attendee_count = parseInt(attendeeCount.rows[0].count);

        if (userId) {
            const rsvpCheck = await pool.query(
                'SELECT status FROM event_rsvps WHERE event_id = $1 AND user_id = $2',
                [id, userId]
            );
            event.user_rsvp = rsvpCheck.rows[0]?.status || null;
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
};

// @desc    Create an event
// @access  Private
export const createEvent = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const {
            title, description, cover_image_url, location, location_type, virtual_link, address,
            start_time, end_time, timezone, capacity, is_recurring, recurrence_rule,
            group_id, visibility, category, tags
        } = req.body;

        const result = await pool.query(
            `INSERT INTO community_events 
             (title, description, cover_image_url, location, location_type, virtual_link, address,
              start_time, end_time, timezone, capacity, is_recurring, recurrence_rule,
              organizer_id, group_id, visibility, category, tags)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             RETURNING *`,
            [title, description, cover_image_url, location, location_type || 'physical',
                virtual_link, address, start_time, end_time, timezone || 'UTC',
                capacity, is_recurring || false, recurrence_rule, userId, group_id,
                visibility || 'public', category, tags]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Failed to create event' });
    }
};

// @desc    Update event
// @access  Private (organizer only)
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const updates = req.body;

        // Check ownership
        const ownerCheck = await pool.query('SELECT organizer_id FROM community_events WHERE event_id = $1', [id]);
        if (ownerCheck.rows[0]?.organizer_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const allowedFields = ['title', 'description', 'cover_image_url', 'location', 'location_type',
            'virtual_link', 'address', 'start_time', 'end_time', 'timezone', 'capacity',
            'is_recurring', 'recurrence_rule', 'visibility', 'category', 'tags'];

        const setClause: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key) && value !== undefined) {
                setClause.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (setClause.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        setClause.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await pool.query(
            `UPDATE community_events SET ${setClause.join(', ')} WHERE event_id = $${paramCount} RETURNING *`,
            values
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Failed to update event' });
    }
};

// @desc    Delete event
// @access  Private (organizer only)
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        const ownerCheck = await pool.query('SELECT organizer_id FROM community_events WHERE event_id = $1', [id]);
        if (ownerCheck.rows[0]?.organizer_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await pool.query('UPDATE community_events SET is_cancelled = TRUE WHERE event_id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

// @desc    RSVP to event
// @access  Private
export const rsvpEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { status = 'interested' } = req.body;

        // Check if event exists
        const eventCheck = await pool.query('SELECT * FROM community_events WHERE event_id = $1', [id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check existing RSVP
        const existingRsvp = await pool.query(
            'SELECT status FROM event_rsvps WHERE event_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingRsvp.rows.length > 0) {
            // Update existing
            await pool.query(
                'UPDATE event_rsvps SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE event_id = $2 AND user_id = $3',
                [status, id, userId]
            );
        } else {
            // Create new RSVP
            await pool.query(
                'INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1, $2, $3)',
                [id, userId, status]
            );
        }

        // Update counts
        const attendingCount = await pool.query(
            'SELECT COUNT(*) FROM event_rsvps WHERE event_id = $1 AND status = $2',
            [id, 'attending']
        );
        const interestedCount = await pool.query(
            'SELECT COUNT(*) FROM event_rsvps WHERE event_id = $1 AND status = $2',
            [id, 'interested']
        );

        await pool.query(
            'UPDATE community_events SET attendee_count = $1, interested_count = $2 WHERE event_id = $3',
            [attendingCount.rows[0].count, interestedCount.rows[0].count, id]
        );

        res.json({ success: true, status });
    } catch (error) {
        console.error('RSVP error:', error);
        res.status(500).json({ message: 'Failed to RSVP' });
    }
};

// @desc    Get event attendees
// @access  Public
export const getEventAttendees = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status = 'attending', limit = 50, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT er.*, u.name, u.profile_photo_url
             FROM event_rsvps er
             JOIN users u ON er.user_id = u.user_id
             WHERE er.event_id = $1 AND er.status = $2
             ORDER BY er.created_at DESC
             LIMIT $3 OFFSET $4`,
            [id, status, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get attendees error:', error);
        res.status(500).json({ message: 'Failed to fetch attendees' });
    }
};

