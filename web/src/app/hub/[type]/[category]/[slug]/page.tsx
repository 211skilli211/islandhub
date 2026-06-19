'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RatingBadge, PriceTag, ImageGallery, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

/**
 * Rental detail page — works for stays, cars, sea, tools, long-term.
 * Reads the subtype from the URL to determine which layout to render.
 */
export default function RentalDetailPage() {
  const params = useParams();
  const category = params?.category as string;
  const slug = params?.slug as string;

  if (!slug) {
    return <EmptyState emoji="🏠" title="Property not found" />;
  }

  // Decode the slug for display
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Determine layout based on category
  const layoutConfig: Record<string, { title: string; price: number; unit: string; type: 'date-range' }> = {
    stays: { title: name, price: 120, unit: '/night', type: 'date-range' },
    cars: { title: name, price: 55, unit: '/day', type: 'date-range' },
    sea: { title: name, price: 250, unit: '/half day', type: 'date-range' },
    equipment: { title: name, price: 30, unit: '/day', type: 'date-range' },
    longterm: { title: name, price: 900, unit: '/month', type: 'date-range' },
    tools: { title: name, price: 30, unit: '/day', type: 'date-range' },
  };

  const config = layoutConfig[category] || layoutConfig.stays;

  return (
    <div className="min-h-screen bg-surface-primary">
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="text-xs text-ink-tertiary">
          <Link href="/hub" className="hover:text-ink-primary">Hub</Link>
          <span className="mx-1.5">/</span>
          <Link href="/hub/rentals" className="hover:text-ink-primary">Rentals</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/hub/rentals/${category}`} className="hover:text-ink-primary capitalize">{category}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-primary capitalize">{name}</span>
        </nav>
      </div>

      
      <div className="max-w-7xl mx-auto px-4">
        <div className="aspect-[16/9] bg-gradient-to-br from-teal-800 to-cyan-900 rounded-2xl flex items-center justify-center">
          <span className="text-6xl opacity-50">{category === 'cars' ? '🚗' : category === 'sea' ? '🚤' : category === 'equipment' || category === 'tools' ? '🔧' : '<EmojiIcon emoji="🏠" size={48} />'}</span>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-ink-primary capitalize">{name}</h1>
                <RatingBadge rating={4.8} reviewCount={24} />
              </div>
              <p className="text-sm text-ink-secondary mt-1 capitalize">{category} rental in St. Kitts & Nevis</p>
            </div>
            <div className="prose prose-sm text-ink-secondary">
              <p>This {category === 'stays' ? 'beautiful property' : category === 'cars' ? 'well-maintained vehicle' : category === 'sea' ? 'boat' : 'equipment'} is available for rent. Contact the host for more details and to arrange your booking.</p>
            </div>
            <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-primary">
              <p className="text-sm text-ink-tertiary">Full {category} detail page with all features coming soon.</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                type={config.type}
                pricePerUnit={config.price}
                unitLabel={config.unit}
                rating={4.8}
                reviewCount={24}
                urgency={{ type: 'scarcity', value: 'High demand this week' }}
                cancellationText={`Free cancellation up to 48 hours before${category === 'longterm' ? ' move-in' : ''}`}
                ctaLabel={`Book ${category === 'longterm' ? 'Viewing' : 'Now'} - From ${config.price}${config.unit}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
