import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

// ==================== TYPES ====================

type SubscriptionType = 'vendor' | 'customer' | 'campaign_creator';

interface LimitConfig {
  table: string;
  idField: string;
  userIdField?: string;
  limitField: string;
  tierField: string;
  countQuery: string;
  limitCode: string;
  errorMessage: string;
}

interface BenefitConfig {
  table: string;
  idField: string;
  benefitFields: string[];
  defaultValues: { [key: string]: any };
  attachToRequest: { [key: string]: string };
}

// ==================== GENERIC SUBSCRIPTION CHECKER ====================

/**
 * Generic subscription limit checker factory
 */
const createLimitChecker = (config: LimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = req.user.id;

      // Get subscription details
      let queryId = userId;
      
      // For vendor subscriptions, we need to get vendor_id first
      if (config.table === 'vendor_subscriptions') {
        const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        if (vendorResult.rows.length === 0) {
          return res.status(403).json({ message: 'Vendor profile required.' });
        }
        queryId = vendorResult.rows[0].id;
      }

      const subResult = await pool.query(
        `SELECT ${config.tierField}, ${config.limitField} FROM ${config.table} 
         WHERE ${config.idField} = $1 AND status = 'active' LIMIT 1`,
        [queryId]
      );

      if (subResult.rows.length === 0) {
        return res.status(403).json({
          message: 'Active subscription required.',
          code: 'SUBSCRIPTION_REQUIRED'
        });
      }

      const { [config.tierField]: tier, [config.limitField]: limit } = subResult.rows[0];

      // Count current items
      let countQuery = config.countQuery;
      let countParams: any[] = [queryId];
      
      // Special handling for store_id in request body (for listings)
      if (config.countQuery.includes('$2')) {
        const store_id = req.body.store_id;
        if (!store_id) {
          return res.status(400).json({ message: 'store_id is required.' });
        }
        countParams.push(store_id);
        
        // Verify store ownership for vendor
        if (config.table === 'vendor_subscriptions') {
          const ownerCheck = await pool.query('SELECT vendor_id FROM stores WHERE store_id = $1', [store_id]);
          if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].vendor_id !== queryId) {
            return res.status(403).json({ message: 'You do not own this store.' });
          }
        }
      }

      const countResult = await pool.query(countQuery, countParams);
      const currentCount = parseInt(countResult.rows[0].count);

      if (currentCount >= limit) {
        return res.status(403).json({
          error: config.errorMessage,
          code: config.limitCode,
          current_tier: tier,
          limit: limit
        });
      }

      next();
    } catch (error) {
      console.error(`Error in limit checker:`, error);
      res.status(500).json({ message: 'Internal server error checking subscription limits' });
    }
  };
};

/**
 * Generic benefit applier factory
 */
const createBenefitApplier = (config: BenefitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        // Apply defaults for non-authenticated users
        Object.entries(config.defaultValues).forEach(([key, value]) => {
          (req as any)[config.attachToRequest[key] || key] = value;
        });
        return next();
      }

      const userId = req.user.id;

      const fields = config.benefitFields.join(', ');
      const subResult = await pool.query(
        `SELECT ${fields} FROM ${config.table} WHERE ${config.idField} = $1 AND status = 'active' LIMIT 1`,
        [userId]
      );

      if (subResult.rows.length === 0) {
        // Apply defaults if no subscription
        Object.entries(config.defaultValues).forEach(([key, value]) => {
          (req as any)[config.attachToRequest[key] || key] = value;
        });
      } else {
        // Apply subscription benefits
        const row = subResult.rows[0];
        Object.entries(row).forEach(([key, value]) => {
          const reqKey = config.attachToRequest[key] || key;
          (req as any)[reqKey] = parseFloat(value as string) || value;
        });
      }

      next();
    } catch (error) {
      console.error(`Error in benefit applier:`, error);
      // Fallback to defaults on error
      Object.entries(config.defaultValues).forEach(([key, value]) => {
        (req as any)[config.attachToRequest[key] || key] = value;
      });
      next();
    }
  };
};

/**
 * Generic tier requirement checker factory
 */
const createTierChecker = (table: string, idField: string, requiredTier: string, errorMessage: string, errorCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = req.user.id;

      const subResult = await pool.query(
        `SELECT tier FROM ${table} WHERE ${idField} = $1 AND status = 'active' AND tier = $2 LIMIT 1`,
        [userId, requiredTier]
      );

      if (subResult.rows.length === 0) {
        return res.status(403).json({
          message: errorMessage,
          code: errorCode
        });
      }

      next();
    } catch (error) {
      console.error(`Error in tier checker:`, error);
      res.status(500).json({ message: 'Internal server error checking tier status' });
    }
  };
};

// ==================== LEGACY SUBSCRIPTION CHECKER ====================

/**
 * Legacy subscription check - maintains backward compatibility
 * Checks if user has any active subscription (for backward compatibility)
 */
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userId = req.user.id;

        // Skip for admins if they need to create system listings
        if (req.user.role === 'admin') {
            return next();
        }

        const query = `
            SELECT * FROM subscriptions 
            WHERE user_id = $1 
            AND status = 'active' 
            AND (expires_at IS NULL OR expires_at > NOW())
            LIMIT 1
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: 'Active subscription required to create listings.',
                code: 'SUBSCRIPTION_REQUIRED'
            });
        }

        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ message: 'Error checking subscription status' });
    }
};

// ==================== VENDOR MIDDLEWARE ====================

export const checkStoreLimit = createLimitChecker({
  table: 'vendor_subscriptions',
  idField: 'vendor_id',
  limitField: 'max_stores',
  tierField: 'tier',
  countQuery: 'SELECT COUNT(*) FROM stores WHERE vendor_id = $1',
  limitCode: 'STORE_LIMIT_EXCEEDED',
  errorMessage: 'Store limit reached for your tier'
});

export const checkListingLimit = createLimitChecker({
  table: 'vendor_subscriptions',
  idField: 'vendor_id',
  limitField: 'max_listings_per_store',
  tierField: 'tier',
  countQuery: 'SELECT COUNT(*) FROM listings WHERE store_id = $2',
  limitCode: 'LISTING_LIMIT_EXCEEDED',
  errorMessage: 'Listing limit reached for your tier'
});

// ==================== CUSTOMER MIDDLEWARE ====================

export const applyCustomerVipBenefits = createBenefitApplier({
  table: 'customer_subscriptions',
  idField: 'user_id',
  benefitFields: ['tier', 'discount_rate', 'rewards_multiplier'],
  defaultValues: {
    discount_rate: 0,
    rewards_multiplier: 1,
    tier: 'general'
  },
  attachToRequest: {
    discount_rate: 'vip_discount',
    rewards_multiplier: 'rewards_multiplier',
    tier: 'customer_tier'
  }
});

export const requireVipStatus = createTierChecker(
  'customer_subscriptions',
  'user_id',
  'vip',
  'This feature requires a VIP subscription.',
  'VIP_REQUIRED'
);

// ==================== CAMPAIGN CREATOR MIDDLEWARE ====================

export const checkCampaignLimit = createLimitChecker({
  table: 'campaign_creator_subscriptions',
  idField: 'user_id',
  limitField: 'max_campaigns',
  tierField: 'tier',
  countQuery: "SELECT COUNT(*) FROM campaigns WHERE user_id = $1 AND status = 'active'",
  limitCode: 'CAMPAIGN_LIMIT_EXCEEDED',
  errorMessage: 'Campaign limit reached for your tier'
});

export const applyPlatformFee = createBenefitApplier({
  table: 'campaign_creator_subscriptions',
  idField: 'user_id',
  benefitFields: ['platform_fee'],
  defaultValues: {
    platform_fee: 5.0
  },
  attachToRequest: {
    platform_fee: 'platform_fee'
  }
});

export const requireVerifiedNonprofit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;

    const subResult = await pool.query(
      "SELECT tier, nonprofit_verified FROM campaign_creator_subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1",
      [userId]
    );

    if (subResult.rows.length === 0 || subResult.rows[0].tier !== 'nonprofit' || !subResult.rows[0].nonprofit_verified) {
      return res.status(403).json({
        message: 'Verified nonprofit status required for this action.',
        code: 'NONPROFIT_VERIFICATION_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireVerifiedNonprofit middleware:', error);
    res.status(500).json({ message: 'Internal server error checking nonprofit status' });
  }
};

// ==================== EXPORTS FOR BACKWARD COMPATIBILITY ====================

// Re-export factory functions for custom use cases
export { createLimitChecker, createBenefitApplier, createTierChecker };
