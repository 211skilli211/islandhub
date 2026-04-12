import dynamic from 'next/dynamic';
import React from 'react';
import { ErrorBoundary, dynamicImportErrorFallback } from '@/components/ErrorBoundary';

// Skeleton components
function ChartSkeleton({ type }: { type: 'line' | 'bar' | 'pie' }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-6" />
            <div className="h-64 bg-slate-100 rounded" />
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
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
        loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-xl" />,
        ssr: false // Image cropper needs window
    }
);

export const CreateListingModal = dynamic(
    () => import('@/components/CreateListingModal'),
    {
        loading: () => (
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-48" />
                </div>
            </div>
        ),
        ssr: false
    }
);

export const AvailabilityCalendar = dynamic(
    () => import('@/components/AvailabilityCalendar'),
    {
        loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />,
        ssr: false
    }
);

// --- Messaging Components ---

export const ChatWindow = dynamic(
    () => import('@/components/ChatWindow'),
    {
        loading: () => (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Chat...</p>
            </div>
        ),
        ssr: false
    }
);

export const DeliveryChat = dynamic(
    () => import('@/components/DeliveryChat'),
    {
        loading: () => <div className="h-full bg-slate-50 animate-pulse rounded-xl" />,
        ssr: false
    }
);

// --- Map Components ---

export const DynamicMap = dynamic(
    () => import('@/components/Map/MapWithErrorBoundary').then(mod => mod.default || mod.DynamicMap || mod),
    {
        loading: () => (
            <div className="w-full h-full min-h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-slate-400 text-sm font-medium">Loading map...</p>
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
            <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-bold">
                Loading Map...
            </div>
        ),
        ssr: false
    }
);
