'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { 
  ShoppingBag, Heart, Clock, CreditCard, Package, 
  MapPin, Star, ChevronRight, Truck, MessageSquare 
} from 'lucide-react';

interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items?: any[];
}

interface Activity {
  id: number;
  type: string;
  title: string;
  created_at: string;
}

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses'>('overview');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [ordersRes, wishRes] = await Promise.all([
          api.get('/orders/me').catch(() => ({ data: [] })),
          api.get('/bookmarks').catch(() => ({ data: [] })),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);
        setWishlistCount(Array.isArray(wishRes.data) ? wishRes.data.length : 0);
      } catch (e) {
        console.error('Buyer dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-palm-500';
      case 'shipped': return 'bg-brand-500';
      case 'processing': return 'bg-warning-500';
      case 'cancelled': return 'bg-danger-500';
      default: return 'bg-ink-tertiary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-ink-tertiary">
        <div className="w-12 h-12 border-4 border-accent-500/20 border-t-accent-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-display-md text-ink-primary">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-body-md text-ink-secondary mt-2">Here's what's happening with your account.</p>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-accent-600" />
            </div>
            <span className="text-caption-xs text-ink-tertiary">Total Orders</span>
          </div>
          <p className="text-2xl font-black text-ink-primary">{orders.length}</p>
        </div>
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-coral-600" />
            </div>
            <span className="text-caption-xs text-ink-tertiary">Wishlist</span>
          </div>
          <p className="text-2xl font-black text-ink-primary">{wishlistCount}</p>
        </div>
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-palm-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-palm-600" />
            </div>
            <span className="text-caption-xs text-ink-tertirty">In Transit</span>
          </div>
          <p className="text-2xl font-black text-ink-primary">
            {orders.filter(o => ['shipped', 'processing'].includes(o.status)).length}
          </p>
        </div>
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-brand-600" />
            </div>
            <span className="text-caption-xs text-ink-tertiary">Total Spent</span>
          </div>
          <p className="text-2xl font-black text-ink-primary">
            ${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/create?type=product" className="p-5 bg-surface-elevated rounded-2xl border border-border-primary hover:shadow-lg flex flex-col items-center gap-3 group transition-all">
          <span className="text-3xl p-3 bg-accent-50 rounded-2xl group-hover:scale-110 transition-all">📦</span>
          <span className="text-caption font-bold text-center">Sell Something</span>
        </Link>
        <Link href="/create?type=service" className="p-5 bg-surface-elevated rounded-2xl border border-border-primary hover:shadow-lg flex flex-col items-center gap-3 group transition-all">
          <span className="text-3xl p-3 bg-palm-50 rounded-2xl group-hover:scale-110 transition-all">🛠️</span>
          <span className="text-caption font-bold text-center">Offer Service</span>
        </Link>
        <Link href="/request-ride?type=taxi" className="p-5 bg-surface-elevated rounded-2xl border border-border-primary hover:shadow-lg flex flex-col items-center gap-3 group transition-all">
          <span className="text-3xl p-3 bg-sand-50 rounded-2xl group-hover:scale-110 transition-all">🚕</span>
          <span className="text-caption font-bold text-center">Book a Ride</span>
        </Link>
        <Link href="/bookmarks" className="p-5 bg-surface-elevated rounded-2xl border border-border-primary hover:shadow-lg flex flex-col items-center gap-3 group transition-all">
          <span className="text-3xl p-3 bg-coral-50 rounded-2xl group-hover:scale-110 transition-all">❤️</span>
          <span className="text-caption font-bold text-center">My Wishlist</span>
        </Link>
      </div>

      
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <h2 className="text-headline-sm text-ink-primary">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-caption text-accent-600 hover:text-accent-700 font-bold flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-ink-tertiary mx-auto mb-4" />
            <p className="text-body-sm text-ink-secondary mb-4">You haven't placed any orders yet.</p>
            <Link href="/stores" className="inline-flex items-center px-6 py-3 bg-accent-600 text-white rounded-xl font-bold text-sm hover:bg-accent-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-primary">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-5 flex items-center justify-between hover:bg-surface-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center">
                    <Package className="w-6 h-6 text-ink-secondary" />
                  </div>
                  <div>
                    <p className="text-body-sm font-bold text-ink-primary">Order #{order.id}</p>
                    <p className="text-caption text-ink-tertiary">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-body-sm font-bold text-ink-primary">${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-8 text-white">
        <h2 className="text-headline-lg font-black mb-2">Explore the Marketplace</h2>
        <p className="text-body-sm opacity-80 mb-6">Discover local products, services, and experiences across the Caribbean.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/food" className="px-5 py-2.5 bg-surface-elevated/20 backdrop-blur rounded-xl text-sm font-bold hover:bg-surface-elevated/30 transition-colors">🍽️ Food</Link>
          <Link href="/products" className="px-5 py-2.5 bg-surface-elevated/20 backdrop-blur rounded-xl text-sm font-bold hover:bg-surface-elevated/30 transition-colors">🛍️ Shop</Link>
          <Link href="/services" className="px-5 py-2.5 bg-surface-elevated/20 backdrop-blur rounded-xl text-sm font-bold hover:bg-surface-elevated/30 transition-colors">🛠️ Services</Link>
          <Link href="/rentals" className="px-5 py-2.5 bg-surface-elevated/20 backdrop-blur rounded-xl text-sm font-bold hover:bg-surface-elevated/30 transition-colors">🏠 Stays</Link>
          <Link href="/tours" className="px-5 py-2.5 bg-surface-elevated/20 backdrop-blur rounded-xl text-sm font-bold hover:bg-surface-elevated/30 transition-colors">🗺️ Tours</Link>
        </div>
      </div>
    </div>
  );
}
