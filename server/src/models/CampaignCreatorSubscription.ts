import { pool } from '../config/db';

export interface CampaignCreatorSubscription {
  id?: number;
  user_id: number;
  tier: 'individual' | 'organization' | 'nonprofit';
  status: 'active' | 'past_due' | 'cancelled' | 'incomplete';
  dodo_subscription_id?: string;
  dodo_customer_id?: string;
  dodo_price_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  platform_fee: number;
  max_campaigns: number;
  nonprofit_verified: boolean;
  nonprofit_verification_date?: Date;
  nonprofit_tax_id?: string;
  features: any;
  created_at?: Date;
  updated_at?: Date;
}

export class CampaignCreatorSubscriptionModel {
  static async findByUserId(user_id: number): Promise<CampaignCreatorSubscription | null> {
    const result = await pool.query(
      'SELECT * FROM campaign_creator_subscriptions WHERE user_id = $1 AND status = $2 LIMIT 1',
      [user_id, 'active']
    );
    return result.rows[0] || null;
  }

  static async create(subscription: CampaignCreatorSubscription): Promise<CampaignCreatorSubscription> {
    const {
      user_id,
      tier = 'individual',
      status = 'active',
      dodo_subscription_id,
      dodo_customer_id,
      dodo_price_id,
      platform_fee = 5.00,
      max_campaigns = 3,
      nonprofit_verified = false,
      features = {}
    } = subscription;

    const result = await pool.query(
      `INSERT INTO campaign_creator_subscriptions (
        user_id, tier, status, dodo_subscription_id, dodo_customer_id,
        dodo_price_id, platform_fee, max_campaigns, nonprofit_verified, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        user_id, tier, status, dodo_subscription_id, dodo_customer_id,
        dodo_price_id, platform_fee, max_campaigns, nonprofit_verified, JSON.stringify(features)
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<CampaignCreatorSubscription>): Promise<CampaignCreatorSubscription | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE campaign_creator_subscriptions SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    return result.rows[0] || null;
  }

  static async verifyNonprofit(id: number, tax_id?: string): Promise<CampaignCreatorSubscription | null> {
    const result = await pool.query(
      `UPDATE campaign_creator_subscriptions 
       SET nonprofit_verified = true, 
           nonprofit_verification_date = CURRENT_TIMESTAMP,
           nonprofit_tax_id = COALESCE($2, nonprofit_tax_id)
       WHERE id = $1 
       RETURNING *`,
      [id, tax_id]
    );
    return result.rows[0] || null;
  }
}
