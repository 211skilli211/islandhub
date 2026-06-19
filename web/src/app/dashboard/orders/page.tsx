'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Image from 'next/image';
import toast from '@/lib/toast';
import Link from 'next/link';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Order {
  order_id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  delivery_type: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  order_item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/orders');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/me');
      setOrders(data);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'paid':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-surface-secondary text-ink-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handlePaymentRetry = async (order: Order) => {
    try {
      const { data } = await api.post(`/orders/${order.order_id}/retry`);
      
      if (data.order_id) {
        // Store the order in localStorage to complete payment on checkout
        localStorage.setItem('pendingOrderRetry', JSON.stringify({
          orderId: order.order_id,
          amount: order.total_amount,
          currency: order.currency
        }));
        
        // Navigate to listings where they can complete purchase
        router.push('/checkout?retry=' + order.order_id);
      }
    } catch (error: any) {
      console.error('Payment retry error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment retry');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary dark:bg-ocean-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-ocean-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-ink-primary">My Orders</h1>
            <p className="text-ink-secondary mt-1">Track and manage your purchases</p>
          </div>
          <Link
            href="/listings"
            className="px-6 py-3 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
          >
            Browse Marketplace
          </Link>
        </div>

        
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === status
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-elevated dark:bg-ocean-800 text-ink-secondary hover:bg-surface-secondary'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl shadow-sm border border-border-primary p-12 text-center">
            <EmojiIcon emoji="📦" size={48} className="text-6xl mb-4" />
            <h2 className="text-2xl font-bold text-ink-primary mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-ink-secondary mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start shopping!"
                : `You don't have any ${filter} orders.`
              }
            </p>
            <Link
              href="/listings"
              className="px-8 py-4 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl shadow-sm border border-border-primary overflow-hidden hover:shadow-md transition-shadow"
              >
                
                <div className="p-6 border-b border-border-primary">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-ink-primary">
                          {order.order_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-ink-tertiary">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-ink-primary">
                        ${order.total_amount.toFixed(2)} {order.currency}
                      </p>
                      <p className="text-sm text-ink-tertiary">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex items-center justify-between py-3 border-b border-border-primary last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-ink-primary">{item.item_name}</p>
                          <p className="text-sm text-ink-tertiary">
                            {item.quantity} x ${item.unit_price.toFixed(2)} {order.currency}
                          </p>
                        </div>
                        <p className="font-bold text-ink-primary">
                          ${item.total_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                
                <div className="px-6 py-4 bg-surface-primary dark:bg-ocean-900 flex items-center justify-between">
                  <div className="text-sm text-ink-secondary">
                    {order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏪 Store Pickup'}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/orders/${order.order_id}`}
                      className="px-4 py-2 bg-surface-elevated dark:bg-ocean-800 border border-border-primary text-ink-secondary font-bold rounded-xl hover:bg-surface-secondary transition-all"
                    >
                      View Details
                    </Link>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handlePaymentRetry(order)}
                        className="px-4 py-2 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
                      >
                        Complete Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
