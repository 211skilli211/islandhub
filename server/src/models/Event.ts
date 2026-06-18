import { pool } from '../config/db';

export interface CampaignEvent {
    event_id?: number;
    campaign_id: number;
    title: string;
    description?: string;
    event_type: 'volunteer' | 'workshop' | 'meetup' | 'online';
    start_time: Date;
    end_time: Date;
    location?: string;
    max_attendees?: number;
    created_at?: Date;
}

export interface EventRegistration {
    registration_id?: number;
    event_id: number;
    user_id: number;
    status: 'registered' | 'cancelled' | 'attended';
    registered_at?: Date;
}

export class EventModel {
    static async create(event: CampaignEvent): Promise<CampaignEvent> {
        const { campaign_id, title, description, event_type, start_time, end_time, location, max_attendees } = event;
        const result = await pool.query(
            `INSERT INTO campaign_events 
            (campaign_id, title, description, event_type, start_time, end_time, location, max_attendees)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [campaign_id, title, description, event_type, start_time, end_time, location, max_attendees]
        );
        return result.rows[0];
    }

    static async findByCampaignId(campaignId: number): Promise<CampaignEvent[]> {
        const result = await pool.query(
            'SELECT * FROM campaign_events WHERE campaign_id = $1 ORDER BY start_time ASC',
            [campaignId]
        );
        return result.rows;
    }

    static async registerUser(eventId: number, userId: number): Promise<EventRegistration> {
        const result = await pool.query(
            `INSERT INTO event_registrations (event_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (event_id, user_id) DO NOTHING
            RETURNING *`,
            [eventId, userId]
        );
        return result.rows[0];
    }

    static async getAttendees(eventId: number): Promise<any[]> {
        const result = await pool.query(
            `SELECT u.name, u.email, er.status, er.registered_at 
            FROM event_registrations er
            JOIN users u ON er.user_id = u.user_id
            WHERE er.event_id = $1`,
            [eventId]
        );
        return result.rows;
    }

    static async getUserRegistrations(userId: number): Promise<any[]> {
        const result = await pool.query(
            `SELECT er.*, ce.title as event_title, ce.start_time, ce.location 
            FROM event_registrations er
            JOIN campaign_events ce ON er.event_id = ce.event_id
            WHERE er.user_id = $1
            ORDER BY ce.start_time DESC`,
            [userId]
        );
        return result.rows;
    }
}
