'use client';

import useSWR from 'swr';
import api from '@/lib/api';

// ─── Types ───
export interface CategoryStats {
  food: number;
  product: number;
  rental: number;
  service: number;
  tour: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  totalListings: number;
  totalOrders: number;
  totalRevenue: number;
  categories: CategoryStats;
}

// ─── Fetcher ───
const fetcher = (url: string) => api.get(url).then(res => res.data);

// ─── Hooks ───

/**
 * Fetch category counts for the homepage marketplace section.
 * Falls back to 0 for each category if the API is unavailable.
 */
export function useCategoryStats() {
  const { data, error, isLoading } = useSWR<{ categories: CategoryStats }>(
    '/stats/categories',
    fetcher,
    {
      dedupingInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      fallbackData: {
        categories: { food: 0, product: 0, rental: 0, service: 0, tour: 0 }
      },
    }
  );

  return {
    stats: data?.categories || { food: 0, product: 0, rental: 0, service: 0, tour: 0 },
    isLoading,
    isError: error,
  };
}

/**
 * Fetch platform-wide statistics for admin dashboard.
 */
export function usePlatformStats() {
  const { data, error, isLoading } = useSWR<PlatformStats>(
    '/stats/platform',
    fetcher,
    {
      dedupingInterval: 60000, // 1 minute
      revalidateOnFocus: true,
      fallbackData: {
        totalUsers: 0,
        totalVendors: 0,
        totalListings: 0,
        totalOrders: 0,
        totalRevenue: 0,
        categories: { food: 0, product: 0, rental: 0, service: 0, tour: 0 },
      },
    }
  );

  return {
    stats: data || {
      totalUsers: 0,
      totalVendors: 0,
      totalListings: 0,
      totalOrders: 0,
      totalRevenue: 0,
      categories: { food: 0, product: 0, rental: 0, service: 0, tour: 0 },
    },
    isLoading,
    isError: error,
  };
}

/**
 * Fetch subscription tier pricing.
 */
export function useSubscriptionTiers() {
  const { data, error, isLoading } = useSWR(
    '/subscriptions/tiers',
    fetcher,
    {
      dedupingInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      fallbackData: [
        { id: 'vip', name: 'VIP Customer', price: 15, period: 'month', features: ['10% OFF every order', 'Double reward points', 'Early access'] },
        { id: 'premium', name: 'Premium Vendor', price: 99, period: 'month', features: ['Advanced analytics', 'Custom branding', 'Lower commission', 'Featured storefront'] },
      ],
    }
  );

  return {
    tiers: data || [],
    isLoading,
    isError: error,
  };
}
