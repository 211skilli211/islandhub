import { pool } from '../config/db';

export interface CustomerSubscription {
  id?: number;
  user_id: number;
  tier: 'general' | 'vip';
  status: 'active' | 'past_due' | 'cancelled' | 'incomplete';
  dodo_subscription_id?: string;
  dodo_customer_id?: string;
  dodo_price_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  discount_rate: number;
  rewards_multiplier: number;
  features: any;
  created_at?: Date;
  updated_at?: Date;
}

export class CustomerSubscriptionModel {
  static async findByUserId(user_id: number): Promise<CustomerSubscription | null> {
    const result = await pool.query(
      'SELECT * FROM customer_subscriptions WHERE user_id = $1 AND status = $2 LIMIT 1',
      [user_id, 'active']
    );
    return result.rows[0] || null;
  }

  static async create(subscription: CustomerSubscription): Promise<CustomerSubscription> {
    const {
      user_id,
      tier = 'general',
      status = 'active',
      dodo_subscription_id,
      dodo_customer_id,
      dodo_price_id,
      discount_rate = 0.00,
      rewards_multiplier = 1.00,
      features = {}
    } = subscription;

    const result = await pool.query(
      `INSERT INTO customer_subscriptions (
        user_id, tier, status, dodo_subscription_id, dodo_customer_id,
        dodo_price_id, discount_rate, rewards_multiplier, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id, tier, status, dodo_subscription_id, dodo_customer_id,
        dodo_price_id, discount_rate, rewards_multiplier, JSON.stringify(features)
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<CustomerSubscription>): Promise<CustomerSubscription | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE customer_subscriptions SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    return result.rows[0] || null;
  }
}
