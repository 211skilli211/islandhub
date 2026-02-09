import { Rule } from '@antigravity/core';

export const marketplaceRules: Rule[] = [
  {
    name: 'validate_listing_creation',
    description: 'Ensure new listings meet marketplace requirements',
    condition: "user.role === 'vendor' AND request.type === 'listing'",
    action: 'validate_listing_data',
    priority: 'high'
  },
  {
    name: 'check_payment_compliance',
    description: 'Verify payment processing meets compliance standards',
    condition: "transaction.amount > 1000",
    action: 'run_payment_validation',
    priority: 'high'
  },
  {
    name: 'enforce_listing_limits',
    description: 'Apply marketplace listing limits and restrictions',
    condition: "user.subscription_tier !== 'premium' AND listing_count > 50",
    action: 'upgrade_subscription_required',
    priority: 'medium'
  },
  {
    name: 'validate_pricing_compliance',
    description: 'Ensure listing prices follow marketplace guidelines',
    condition: "listing.price <= 0 OR listing.price > 10000",
    action: 'reject_invalid_pricing',
    priority: 'medium'
  },
  {
    name: 'monitor_fraud_indicators',
    description: 'Detect and flag potentially fraudulent activity',
    condition: "listing.description CONTAINS 'guaranteed income' OR listing.price < market_average * 0.3",
    action: 'flag_for_review',
    priority: 'high'
  }
];