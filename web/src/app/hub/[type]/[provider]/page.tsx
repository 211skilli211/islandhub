import { redirect } from 'next/navigation';

/**
 * /hub/[type]/[provider] → Level 3: Dedicated Vendor Storefront
 * Bridges the hub funnel into the existing /store/[slug] storefront.
 * This ensures the marketplace hierarchy is complete:
 *   /hub (gateway) → /hub/[type] (aggregator) → /hub/[type]/[provider] (storefront)
 */
export default function HubProviderPage({
  params,
}: {
  params: { type: string; provider: string };
}) {
  // Redirect to the fully-featured storefront at /store/[slug]
  // The store page already has catalog, branding, and commerce logic
  redirect(`/store/${params.provider}`);
}
