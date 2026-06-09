'use client';

import { useParams } from 'next/navigation';
import StaysHubPage from '@/components/hub/rentals/StaysHubPage';
import RentalsGatewayPage from '@/components/hub/rentals/RentalsGatewayPage';
import { getCategoryLayout } from '@/lib/hubConfigs';

/**
 * /hub/rentals/[category] — Rental sub-hub pages
 * - /hub/rentals/stays → Airbnb-style property listings
 * - /hub/rentals/longterm → Zillow-style (placeholder)
 * - /hub/rentals/equipment → Fat Llama-style (placeholder)
 */
export default function RentalsCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  // Route to dedicated sub-hub components
  switch (category) {
    case 'stays':
      return <StaysHubPage />;
    case 'longterm':
    case 'equipment':
    case 'cars':
    case 'sea':
      // TODO: Build dedicated pages for these sub-hubs
      return <SubHubPlaceholder category={category} />;
    default:
      // No category specified → show rental gateway
      return <RentalsGatewayPage />;
  }
}

function SubHubPlaceholder({ category }: { category: string }) {
  const config = getCategoryLayout('rentals', category);
  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {config?.pageTitle || category}
          </h1>
          <p className="text-lg text-teal-200">{config?.subtitle}</p>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-ink-primary mb-2">Coming Soon</h2>
        <p className="text-ink-secondary mb-4">
          The {config?.pageTitle || category} experience is being built with {config?.reference || 'a custom design'}.
        </p>
        <a href="/hub/rentals" className="text-accent-500 font-medium hover:underline">
          ← Back to Rentals
        </a>
      </div>
    </div>
  );
}
