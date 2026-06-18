import { pool } from '../config/db';

export interface VendorSubscription {
  id?: number;
  vendor_id: number;
  tier: 'basic_product' | 'premium_product' | 'enterprise_product' | 'basic_service' | 'premium_service' | 'enterprise_service';
  vendor_type: 'product' | 'service';
  status: 'active' | 'past_due' | 'cancelled' | 'incomplete';
  dodo_subscription_id?: string;
  dodo_customer_id?: string;
  dodo_price_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  commission_rate: number;
  max_stores: number;
  max_listings_per_store: number;
  features: any;
  created_at?: Date;
  updated_at?: Date;
}

export class VendorSubscriptionModel {
  static async findByVendorId(vendor_id: number): Promise<VendorSubscription | null> {
    const result = await pool.query(
      'SELECT * FROM vendor_subscriptions WHERE vendor_id = $1 AND status = $2 LIMIT 1',
      [vendor_id, 'active']
    );
    return result.rows[0] || null;
  }

  static async create(subscription: VendorSubscription): Promise<VendorSubscription> {
    const {
      vendor_id,
      tier,
      vendor_type,
      status = 'active',
      dodo_subscription_id,
      dodo_customer_id,
      dodo_price_id,
      commission_rate = 5.00,
      max_stores = 1,
      max_listings_per_store = 10,
      features = {}
    } = subscription;

    const result = await pool.query(
      `INSERT INTO vendor_subscriptions (
        vendor_id, tier, vendor_type, status, dodo_subscription_id, dodo_customer_id,
        dodo_price_id, commission_rate, max_stores, max_listings_per_store, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        vendor_id, tier, vendor_type, status, dodo_subscription_id, dodo_customer_id,
        dodo_price_id, commission_rate, max_stores, max_listings_per_store, JSON.stringify(features)
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<VendorSubscription>): Promise<VendorSubscription | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE vendor_subscriptions SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    return result.rows[0] || null;
  }
}
