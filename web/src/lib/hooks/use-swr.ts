'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';
import api from '@/lib/api'; // Assumes '@/lib/api' exists and is configured with auth headers

// Define types based on audit context
interface ListingFilters {
  category?: string;
  sub_category?: string;
  tour_category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}

interface CartItem {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  shippingOptions: any[];
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// --- Core Fetcher ---
const fetcher = (url: string) => api.get(url).then(res => res.data);

// --- Generic Data Hooks ---

export function useListings(params?: ListingFilters) {
  const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';

  return useSWR(
    `/listings${queryString}`,
    fetcher,
    {
      dedupingInterval: 60000, // Cache for 1 minute
      revalidateOnFocus: false, // Reduce API calls
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
      fallbackData: null,
    }
  );
}

export function useCampaigns(featured?: boolean) {
  const key = featured ? '/campaigns?featured=true' : '/campaigns';

  return useSWR<any[]>(
    key,
    fetcher,
    {
      dedupingInterval: 120000, // 2 minutes for campaigns
      revalidateOnFocus: false,
      refreshInterval: 600000, // 10 minutes for campaigns
    }
  );
}

export function useStores(params?: any) {
  const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';

  return useSWR<any[]>(
    `/stores${queryString}`,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  );
}

export function useUserData() {
  const { data, error, isLoading, mutate } = useSWR(
    '/users/me',
    fetcher,
    {
      dedupingInterval: 30000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    refreshUser: mutate,
  };
}

// --- Local Storage Hook (Cart) ---
export function useCart() {
  const { data: cart, mutate: updateCart } = useSWR<CartState>(
    'cart',
    () => {
      // Safety check: Read from localStorage only if not on server
      if (typeof window === 'undefined') return null;

      const saved = localStorage.getItem('islandhub_cart');
      return saved ? JSON.parse(saved) : { items: [], total: 0, itemCount: 0 };
    },
    {
      dedupingInterval: 0, // Always check storage on mount/focus
      revalidateOnFocus: false,
    }
  );

  const addToCart = useCallback((item: Omit<CartItem, 'quantity' | 'vendorName'> & { quantity?: number }) => {
    updateCart(prevCart => {
      if (!prevCart) return { items: [{ ...item, quantity: item.quantity || 1, vendorName: 'Unknown' }], total: item.price * (item.quantity || 1), itemCount: item.quantity || 1 };

      const existingIndex = prevCart.items.findIndex(i => i.id === item.id);
      let newItems;

      if (existingIndex > -1) {
        newItems = prevCart.items.map((i, index) =>
          index === existingIndex
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        newItems = [...prevCart.items, { ...item, quantity: item.quantity || 1, vendorName: 'Unknown' }]; // Vendor name needs to be enriched on the server side for final checkout, but stored here for display
      }

      const newTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

      // Persist locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('islandhub_cart', JSON.stringify({ items: newItems, total: newTotal, itemCount: newItemCount }));
      }

      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  }, [updateCart]);


  const removeItem = useCallback((id: string) => {
    updateCart(prevCart => {
      if (!prevCart) return undefined;
      const newItems = prevCart.items.filter(i => i.id !== id);
      const newTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

      if (typeof window !== 'undefined') {
        localStorage.setItem('islandhub_cart', JSON.stringify({ items: newItems, total: newTotal, itemCount: newItemCount }));
      }
      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  }, [updateCart]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    updateCart(prevCart => {
      if (!prevCart) return undefined;

      let newItems;
      if (quantity <= 0) {
        newItems = prevCart.items.filter(i => i.id !== id);
      } else {
        newItems = prevCart.items.map(i =>
          i.id === id ? { ...i, quantity } : i
        );
      }

      const newTotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

      if (typeof window !== 'undefined') {
        localStorage.setItem('islandhub_cart', JSON.stringify({ items: newItems, total: newTotal, itemCount: newItemCount }));
      }
      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  }, [updateCart]);


  const value = useMemo(() => ({
    items: cart?.items || [],
    addItem: addToCart,
    removeItem,
    updateQuantity,
    total: cart?.total || 0,
    itemCount: cart?.itemCount || 0,
  }), [cart, addToCart, removeItem, updateQuantity]);

  return { cart: value, addToCart, removeFromCart: removeItem, updateCart };
}

const EMPTY_ARRAY: any[] = [];

export function useRecommendations(type?: 'personalized' | 'trending', limit: number = 10) {
  const endpoint = type === 'trending'
    ? `/recommendations/trending?limit=${limit}`
    : `/recommendations/personalized?limit=${limit}`;

  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    fetcher,
    {
      dedupingInterval: 300000, // 5 minutes for recommendations
      revalidateOnFocus: false,
      refreshInterval: 600000, // 10 minutes
      fallbackData: null,
    }
  );

  return {
    recommendations: data?.recommendations || data || EMPTY_ARRAY,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}