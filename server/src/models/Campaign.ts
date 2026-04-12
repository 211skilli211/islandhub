import { pool } from '../config/db';

export interface Campaign {
    campaign_id?: number;
    user_id: number;
    title: string;
    description: string;
    category: 'business' | 'arts' | 'community' | 'tourism' | 'disaster_relief';
    goal_amount: number;
    current_amount?: number;
    currency?: string;
    status?: 'draft' | 'active' | 'completed' | 'cancelled';
    start_date?: Date;
    end_date?: Date;
    verified?: boolean;
    created_at?: Date;
}

export class CampaignModel {
    static async create(campaign: Campaign): Promise<Campaign> {
        const { user_id, title, description, category, goal_amount, end_date } = campaign;
        const result = await pool.query(
            `INSERT INTO campaigns (user_id, title, description, category, goal_amount, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
            [user_id, title, description, category, goal_amount, end_date]
        );
        return result.rows[0];
    }

    static async findById(id: number): Promise<Campaign | null> {
        const result = await pool.query('SELECT * FROM campaigns WHERE campaign_id = $1', [id]);
        return result.rows[0] || null;
    }

    static async verify(id: number): Promise<Campaign | null> {
        const result = await pool.query(
            'UPDATE campaigns SET verified = TRUE, status = \'active\' WHERE campaign_id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findAll(isAdmin: boolean = false): Promise<Campaign[]> {
        let query = 'SELECT * FROM campaigns ORDER BY created_at DESC';
        if (!isAdmin) {
            query = 'SELECT * FROM campaigns WHERE verified = TRUE ORDER BY created_at DESC';
        }
        const result = await pool.query(query);
        return result.rows;
    }

    static async search(term: string): Promise<Campaign[]> {
        const result = await pool.query(
            `SELECT * FROM campaigns 
             WHERE verified = TRUE 
             AND (title ILIKE $1 OR description ILIKE $1) 
             ORDER BY created_at DESC`,
            [`%${term}%`]
        );
        return result.rows;
    }
    static async findByUserId(user_id: number): Promise<Campaign[]> {
        const result = await pool.query('SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        return result.rows;
    }

    static async updateCurrentAmount(campaign_id: number, newAmount: number): Promise<Campaign | null> {
        const result = await pool.query(
            'UPDATE campaigns SET current_amount = $1 WHERE campaign_id = $2 RETURNING *',
            [newAmount, campaign_id]
        );
        return result.rows[0] || null;
    }

    static async update(campaign_id: number, updates: Partial<Campaign>): Promise<Campaign | null> {
        const keys = Object.keys(updates);
        if (keys.length === 0) return null;

        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = keys.map(key => (updates as any)[key]);

        const result = await pool.query(
            `UPDATE campaigns SET ${setClause} WHERE campaign_id = $1 RETURNING *`,
            [campaign_id, ...values]
        );
        return result.rows[0] || null;
    }
}
