import { pool } from '../config/db';

export interface VendorPromotion {
  promo_id?: number;
  vendor_id: number;
  store_id?: number;
  title: string;
  subtitle?: string;
  promo_type?: 'banner' | 'flash_sale' | 'announcement' | 'featured_product';
  media_type?: 'image' | 'video' | 'text';
  media_url?: string;
  background_color?: string;
  text_color?: string;
  placement?: 'store_hero' | 'store_sidebar' | 'product_grid' | 'checkout';
  display_order: number;
  discount_type?: 'percentage' | 'fixed' | 'none';
  discount_value?: number;
  promo_code?: string;
  target_products?: number[];
  target_categories?: string[];
  start_date?: Date;
  end_date?: Date;
  is_recurring: boolean;
  recurrence_pattern?: any;
  is_active: boolean;
  requires_approval: boolean;
  approved_by?: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  views: number;
  clicks: number;
  conversions: number;
  created_at?: Date;
  updated_at?: Date;
}

export class VendorPromotionModel {
  static async findAll(filters?: { vendor_id?: number; store_id?: number; is_active?: boolean }): Promise<VendorPromotion[]> {
    let query = 'SELECT * FROM vendor_promotions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.vendor_id) {
      query += ` AND vendor_id = $${paramCount}`;
      params.push(filters.vendor_id);
      paramCount++;
    }

    if (filters?.store_id) {
      query += ` AND store_id = $${paramCount}`;
      params.push(filters.store_id);
      paramCount++;
    }

    if (filters?.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findActiveByStore(store_id: number, placement?: string): Promise<VendorPromotion[]> {
    let query = `
      SELECT * FROM vendor_promotions 
      WHERE store_id = $1 
      AND is_active = true
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date >= NOW())
    `;
    const params: any[] = [store_id];

    if (placement) {
      query += ' AND placement = $2';
      params.push(placement);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(promo_id: number): Promise<VendorPromotion | null> {
    const result = await pool.query('SELECT * FROM vendor_promotions WHERE promo_id = $1', [promo_id]);
    return result.rows[0] || null;
  }

  static async create(promotion: VendorPromotion): Promise<VendorPromotion> {
    const result = await pool.query(
      `INSERT INTO vendor_promotions (
        vendor_id, store_id, title, subtitle, promo_type, media_type, media_url,
        background_color, text_color, placement, display_order, discount_type,
        discount_value, promo_code, target_products, target_categories, start_date,
        end_date, is_recurring, recurrence_pattern, requires_approval, approval_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        promotion.vendor_id, promotion.store_id, promotion.title, promotion.subtitle,
        promotion.promo_type, promotion.media_type, promotion.media_url,
        promotion.background_color, promotion.text_color, promotion.placement,
        promotion.display_order || 0, promotion.discount_type, promotion.discount_value,
        promotion.promo_code, promotion.target_products, promotion.target_categories,
        promotion.start_date, promotion.end_date, promotion.is_recurring || false,
        promotion.recurrence_pattern, promotion.requires_approval !== false, 'pending'
      ]
    );
    return result.rows[0];
  }

  static async update(promo_id: number, updates: Partial<VendorPromotion>): Promise<VendorPromotion | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE vendor_promotions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE promo_id = $${fields.length + 1} RETURNING *`,
      [...values, promo_id]
    );
    
    return result.rows[0] || null;
  }

  static async delete(promo_id: number): Promise<boolean> {
    await pool.query('DELETE FROM vendor_promotions WHERE promo_id = $1', [promo_id]);
    return true;
  }

  static async approve(promo_id: number, approved_by: number): Promise<VendorPromotion | null> {
    const result = await pool.query(
      `UPDATE vendor_promotions 
       SET approval_status = 'approved', is_active = true, approved_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE promo_id = $2 RETURNING *`,
      [approved_by, promo_id]
    );
    return result.rows[0] || null;
  }

  static async reject(promo_id: number, approved_by: number, rejection_reason?: string): Promise<VendorPromotion | null> {
    const result = await pool.query(
      `UPDATE vendor_promotions 
       SET approval_status = 'rejected', is_active = false, rejection_reason = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE promo_id = $3 RETURNING *`,
      [rejection_reason, approved_by, promo_id]
    );
    return result.rows[0] || null;
  }

  static async findPending(): Promise<VendorPromotion[]> {
    const result = await pool.query(
      `SELECT vp.*, u.email as vendor_email, s.name as store_name
       FROM vendor_promotions vp
       LEFT JOIN users u ON vp.vendor_id = u.user_id
       LEFT JOIN stores s ON vp.store_id = s.store_id
       WHERE vp.approval_status = 'pending'
       ORDER BY vp.created_at ASC`
    );
    return result.rows;
  }

  static async incrementViews(promo_id: number): Promise<void> {
    await pool.query('UPDATE vendor_promotions SET views = views + 1 WHERE promo_id = $1', [promo_id]);
  }

  static async incrementClicks(promo_id: number): Promise<void> {
    await pool.query('UPDATE vendor_promotions SET clicks = clicks + 1 WHERE promo_id = $1', [promo_id]);
  }
}
