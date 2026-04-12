import dynamic from 'next/dynamic';
import { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary'; // Assuming react-error-boundary is installed

// --- SKELETON COMPONENTS ---

const MapSkeleton = memo(function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-slate-400 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  );
});

const MapErrorBoundary = memo(function MapErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
      <div className="text-center p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-slate-600 font-medium mb-2">Map Failed to Load</p>
        <p className="text-slate-400 text-sm">{error.message}</p>
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