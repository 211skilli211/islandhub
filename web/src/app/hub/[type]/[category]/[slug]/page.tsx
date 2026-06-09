'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Fallback individual listing page within a category.
 * Each hub type will override this with a dedicated detail component.
 * 
 * Routes: /hub/food/restaurants/jerk-kitchen, /hub/rentals/stays/beach-villa, etc.
 */
export default function HubCategoryItemPage() {
  const params = useParams();
  const type = params?.type as string;
  const category = params?.category as string;
  const slug = params?.slug as string;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-ink-tertiary">
          <Link href="/hub" className="hover:text-ink-primary">Hub</Link>
          <span className="mx-2">/</span>
          <Link href={`/hub/${type}`} className="hover:text-ink-primary capitalize">{type}</Link>
          <span className="mx-2">/</span>
          <Link href={`/hub/${type}/${category}`} className="hover:text-ink-primary capitalize">{category}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink-primary capitalize">{slug?.replace(/-/g, ' ')}</span>
        </nav>

        {/* Placeholder — will be replaced by dedicated detail pages */}
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-12 text-center">
          <div className="text-5xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-ink-primary mb-2 capitalize">
            {slug?.replace(/-/g, ' ')}
          </h1>
          <p className="text-ink-secondary mb-4">
            This {category} listing in {type} is under construction.
          </p>
          <p className="text-sm text-ink-tertiary">
            Dedicated {type}/{category} detail pages are being built with category-specific layouts.
          </p>
          <div className="mt-6">
            <Link
              href={`/hub/${type}/${category}`}
              className="px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors"
            >
              Back to {category}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
