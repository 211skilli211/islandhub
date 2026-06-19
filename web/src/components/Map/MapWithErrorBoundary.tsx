import dynamic from 'next/dynamic';
import { memo } from 'react';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { ErrorBoundary } from 'react-error-boundary'; // Assuming react-error-boundary is installed

// --- SKELETON COMPONENTS ---

const MapSkeleton = memo(function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] bg-surface-secondary animate-pulse rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <EmojiIcon emoji="🗺️" size={40} className="text-4xl mb-4" />
        <p className="text-ink-tertiary text-sm font-medium">Loading map...</p>
      </div>
    </div>
  );
});

const MapErrorBoundary = memo(function MapErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full h-full min-h-[400px] bg-surface-secondary rounded-2xl flex items-center justify-center border-2 border-dashed border-border-primary">
      <div className="text-center p-8">
        <EmojiIcon emoji="⚠️" size={40} className="text-4xl mb-4" />
        <p className="text-ink-secondary font-medium mb-2">Map Failed to Load</p>
        <p className="text-ink-tertiary text-sm">{error.message}</p>
      </div>
    </div>
  );
});

// --- DYNAMIC IMPORT WRAPPER ---

// Note: Assuming the original Map component is default exported from '@/components/Map'
const DynamicMap = dynamic(
  () => import('@/components/Map').then(mod => mod.default), // Use .default if it's a CJS export or if Next.js requires it
  {
    loading: () => <MapSkeleton />,
    ssr: false, // Leaflet requires window, must disable SSR
  }
);

export default function MapWithErrorBoundary(props: any) {
  return (
    <ErrorBoundary fallback={<MapErrorBoundary error={new Error('Map failed to load')} />}>
      <DynamicMap {...props} />
    </ErrorBoundary>
  );
}

// Re-exporting for cleaner imports in pages that were not using the dynamic wrapper yet
export { DynamicMap, MapSkeleton, MapErrorBoundary };