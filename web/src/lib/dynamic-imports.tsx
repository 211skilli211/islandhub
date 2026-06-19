import dynamic from 'next/dynamic';
import React from 'react';
import { ErrorBoundary, dynamicImportErrorFallback } from '@/components/ErrorBoundary';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

// Skeleton components
function ChartSkeleton({ type }: { type: 'line' | 'bar' | 'pie' }) {
    return (
        <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary animate-pulse">
            <div className="h-6 bg-surface-tertiary rounded w-1/3 mb-6" />
            <div className="h-64 bg-surface-secondary rounded" />
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 bg-surface-secondary rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="h-96 bg-surface-secondary rounded-2xl animate-pulse" />
        </div>
    );
}

// Chart components - only load when dashboard is visible
export const SalesChart = dynamic(
    () => import('@/components/charts/RevenueChart').then(mod => mod.default), // Reusing RevenueChart as SalesChart for now or generic Chart
    {
        loading: () => <ChartSkeleton type="line" />,
        ssr: false
    }
);

export const RevenueChart = dynamic(
    () => import('@/components/charts/RevenueChart').then(mod => mod.default),
    {
        loading: () => <ChartSkeleton type="bar" />,
        ssr: false
    }
);

export const AnalyticsDashboard = dynamic(
    () => import('@/components/VendorDashboardAnalytics').then(mod => mod.default),
    {
        loading: () => <DashboardSkeleton />,
        ssr: false
    }
);

// --- Form & Upload Components ---

export const ImageUpload = dynamic(
    () => import('@/components/ImageUpload'),
    {
        loading: () => <div className="h-32 bg-surface-secondary animate-pulse rounded-xl" />,
        ssr: false // Image cropper needs window
    }
);

export const CreateListingModal = dynamic(
    () => import('@/components/CreateListingModal'),
    {
        loading: () => (
            <div className="fixed inset-0 bg-ink-primary/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-surface-elevated p-8 rounded-2xl animate-pulse">
                    <div className="h-6 bg-surface-tertiary rounded w-32 mb-4" />
                    <div className="h-4 bg-surface-tertiary rounded w-48" />
                </div>
            </div>
        ),
        ssr: false
    }
);

export const AvailabilityCalendar = dynamic(
    () => import('@/components/AvailabilityCalendar'),
    {
        loading: () => <div className="h-64 bg-surface-secondary animate-pulse rounded-xl" />,
        ssr: false
    }
);

// --- Messaging Components ---

export const ChatWindow = dynamic(
    () => import('@/components/ChatWindow'),
    {
        loading: () => (
            <div className="h-full flex flex-col items-center justify-center bg-surface-secondary">
                <div className="animate-spin h-12 w-12 border-4 border-[#14b8a6] border-t-transparent rounded-full mb-4"></div>
                <p className="font-black text-ink-tertiary uppercase tracking-widest text-xs">Loading Chat...</p>
            </div>
        ),
        ssr: false
    }
);

export const DeliveryChat = dynamic(
    () => import('@/components/DeliveryChat'),
    {
        loading: () => <div className="h-full bg-surface-secondary animate-pulse rounded-xl" />,
        ssr: false
    }
);

// --- Map Components ---

export const DynamicMap = dynamic(
    () => import('@/components/Map/MapWithErrorBoundary').then(mod => mod.default || mod.DynamicMap || mod),
    {
        loading: () => (
            <div className="w-full h-full min-h-[400px] bg-surface-secondary animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <EmojiIcon emoji="🗺️" size={40} className="text-4xl mb-4" />
                    <p className="text-ink-tertiary text-sm font-medium">Loading map...</p>
                </div>
            </div>
        ),
        ssr: false
    }
);

export const DispatchMap = dynamic(
    () => import('@/components/admin/DispatchMap'),
    {
        loading: () => (
            <div className="w-full h-full bg-surface-secondary animate-pulse flex items-center justify-center text-ink-tertiary font-bold">
                Loading Map...
            </div>
        ),
        ssr: false
    }
);
