'use client';

import { useParams } from 'next/navigation';
import { getHubConfig } from '@/lib/hubConfigs';
import HubTypePage from '@/components/hub/HubPage';

/**
 * Fallback subtype page — renders the generic HubPage for now.
 * Each hub type will override this with a dedicated component as we build them.
 * 
 * Routes: /hub/food/restaurants, /hub/tours/land, /hub/rentals/stays, etc.
 */
export default function HubCategoryPage() {
  const params = useParams();
  const type = params?.type as string;
  const category = params?.category as string;
  const config = getHubConfig(type);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🏝️</span>
          <h1 className="text-2xl font-bold text-ink-primary mb-2">Category Not Found</h1>
          <p className="text-ink-tertiary">The category &quot;{category}&quot; in &quot;{type}&quot; doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  // For now, render the generic HubPage filtered by category
  // TODO: Replace with dedicated category components per hub type
  return <HubTypePage />;
}
