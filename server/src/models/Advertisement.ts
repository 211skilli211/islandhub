import { pool } from '../config/db';

export interface Advertisement {
  ad_id?: number;
  title: string;
  description?: string;
  advertiser_type: 'vendor' | 'external' | 'platform';
  advertiser_id?: number;
  advertiser_name?: string;
  contact_email?: string;
  contact_phone?: string;
  media_type: 'image' | 'video' | 'carousel';
  media_url: string;
  media_urls?: any;
  thumbnail_url?: string;
  ad_space_id?: number;
  placement_priority: number;
  target_pages?: string[];
  target_categories?: string[];
  target_locations?: string[];
  click_action?: string;
  target_url?: string;
  target_store_id?: number;
  target_listing_id?: number;
  start_date?: Date;
  end_date?: Date;
  schedule_config?: any;
  pricing_model?: string;
  budget_amount?: number;
  spent_amount: number;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
  is_active: boolean;
  impressions: number;
  clicks: number;
  created_by?: number;
  approved_by?: number;
  approved_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class AdvertisementModel {
  static async findAll(filters?: { status?: string; advertiser_type?: string }): Promise<Advertisement[]> {
    let query = `
      SELECT a.*, s.name as space_name, s.display_name as space_display_name,
             u.email as creator_email
      FROM advertisements a
      LEFT JOIN ad_spaces s ON a.ad_space_id = s.space_id
      LEFT JOIN users u ON a.created_by = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.advertiser_type) {
      query += ` AND a.advertiser_type = $${paramCount}`;
      params.push(filters.advertiser_type);
      paramCount++;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findActive(filters?: { space_name?: string; location?: string; page?: string }): Promise<Advertisement[]> {
    let query = `
      SELECT a.*, s.name as space_name, s.display_name as space_display_name
      FROM advertisements a
      LEFT JOIN ad_spaces s ON a.ad_space_id = s.space_id
      WHERE a.is_active = true 
      AND a.status = 'active'
      AND (a.start_date IS NULL OR a.start_date <= NOW())
      AND (a.end_date IS NULL OR a.end_date >= NOW())
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.space_name) {
      query += ` AND s.name = $${paramCount}`;
      params.push(filters.space_name);
      paramCount++;
    }

    if (filters?.location) {
      query += ` AND s.location = $${paramCount}`;
      params.push(filters.location);
      paramCount++;
    }

    if (filters?.page) {
      query += ` AND $${paramCount} = ANY(a.target_pages)`;
      params.push(filters.page);
      paramCount++;
    }

    query += ' ORDER BY a.placement_priority DESC, a.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(ad_id: number): Promise<Advertisement | null> {
    const result = await pool.query('SELECT * FROM advertisements WHERE ad_id = $1', [ad_id]);
    return result.rows[0] || null;
  }

  static async create(ad: Advertisement): Promise<Advertisement> {
    const result = await pool.query(
      `INSERT INTO advertisements (
        title, description, advertiser_type, advertiser_id, advertiser_name,
        contact_email, contact_phone, media_type, media_url, media_urls,
        thumbnail_url, ad_space_id, placement_priority, target_pages,
        target_categories, target_locations, click_action, target_url,
        target_store_id, target_listing_id, start_date, end_date,
        schedule_config, pricing_model, budget_amount, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *`,
      [
        ad.title, ad.description, ad.advertiser_type, ad.advertiser_id, ad.advertiser_name,
        ad.contact_email, ad.contact_phone, ad.media_type, ad.media_url, ad.media_urls,
        ad.thumbnail_url, ad.ad_space_id, ad.placement_priority || 0, ad.target_pages,
        ad.target_categories, ad.target_locations, ad.click_action, ad.target_url,
        ad.target_store_id, ad.target_listing_id, ad.start_date, ad.end_date,
        ad.schedule_config, ad.pricing_model, ad.budget_amount, ad.status || 'draft', ad.created_by
      ]
    );
    return result.rows[0];
  }

  static async update(ad_id: number, updates: Partial<Advertisement>): Promise<Advertisement | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE advertisements SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ad_id = $${fields.length + 1} RETURNING *`,
      [...values, ad_id]
    );
    
    return result.rows[0] || null;
  }

  static async delete(ad_id: number): Promise<boolean> {
    await pool.query('DELETE FROM advertisements WHERE ad_id = $1', [ad_id]);
    return true;
  }

  static async approve(ad_id: number, approved_by: number): Promise<Advertisement | null> {
    const result = await pool.query(
      `UPDATE advertisements 
       SET status = 'active', is_active = true, approved_by = $1, approved_at = CURRENT_TIMESTAMP 
       WHERE ad_id = $2 RETURNING *`,
      [approved_by, ad_id]
    );
    return result.rows[0] || null;
  }

  static async toggleStatus(ad_id: number): Promise<Advertisement | null> {
    const result = await pool.query(
      `UPDATE advertisements 
       SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
       WHERE ad_id = $1 RETURNING *`,
      [ad_id]
    );
    return result.rows[0] || null;
  }

  static async incrementImpressions(ad_id: number): Promise<void> {
    await pool.query('UPDATE advertisements SET impressions = impressions + 1 WHERE ad_id = $1', [ad_id]);
  }

  static async incrementClicks(ad_id: number): Promise<void> {
    await pool.query('UPDATE advertisements SET clicks = clicks + 1 WHERE ad_id = $1', [ad_id]);
  }
}
