import { pool } from '../config/db';

export interface AdSpace {
  space_id?: number;
  name: string;
  display_name: string;
  description?: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  location: string;
  position?: string;
  max_file_size?: number;
  allowed_media_types?: string[];
  max_duration?: number;
  base_price?: number;
  pricing_period?: string;
  is_active: boolean;
  max_concurrent_ads: number;
  created_at?: Date;
  updated_at?: Date;
}

export class AdSpaceModel {
  static async findAll(filters?: { location?: string; is_active?: boolean }): Promise<AdSpace[]> {
    let query = 'SELECT * FROM ad_spaces WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.location) {
      query += ` AND location = $${paramCount}`;
      params.push(filters.location);
      paramCount++;
    }

    if (filters?.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    query += ' ORDER BY location, position';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(space_id: number): Promise<AdSpace | null> {
    const result = await pool.query('SELECT * FROM ad_spaces WHERE space_id = $1', [space_id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<AdSpace | null> {
    const result = await pool.query('SELECT * FROM ad_spaces WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  static async create(adSpace: AdSpace): Promise<AdSpace> {
    const {
      name,
      display_name,
      description,
      width,
      height,
      aspect_ratio,
      location,
      position,
      max_file_size,
      allowed_media_types,
      max_duration,
      base_price,
      pricing_period,
      is_active = true,
      max_concurrent_ads = 1
    } = adSpace;

    const result = await pool.query(
      `INSERT INTO ad_spaces (
        name, display_name, description, width, height, aspect_ratio, location,
        position, max_file_size, allowed_media_types, max_duration, base_price,
        pricing_period, is_active, max_concurrent_ads
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        name, display_name, description, width, height, aspect_ratio, location,
        position, max_file_size, allowed_media_types, max_duration, base_price,
        pricing_period, is_active, max_concurrent_ads
      ]
    );
    return result.rows[0];
  }

  static async update(space_id: number, updates: Partial<AdSpace>): Promise<AdSpace | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE ad_spaces SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE space_id = $${fields.length + 1} RETURNING *`,
      [...values, space_id]
    );
    
    return result.rows[0] || null;
  }

  static async delete(space_id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM ad_spaces WHERE space_id = $1', [space_id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
