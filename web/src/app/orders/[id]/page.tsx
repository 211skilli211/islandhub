'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Order {
  order_id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  service_fee: number;
  delivery_fee: number;
  discount_amount: number;
  currency: string;
  delivery_type: string;
  delivery_address: any;
  delivery_instructions: string;
  estimated_delivery_time: string;
  actual_delivery_time: string;
  payment_method: string;
  created_at: string;
  paid_at: string;
  completed_at: string;
  items: OrderItem[];
}

interface OrderItem {
  order_item_id: number;
  item_name: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: string;
  selected_variant: any;
  selected_addons: any[];
  status: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrder();
  }, [isAuthenticated, params.id, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${params.id}`);
      setOrder(data);
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      if (error.response?.status === 404) {
        toast.error('Order not found');
        router.push('/dashboard/orders');
      } else {
        toast.error('Failed to load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusStep = (status: string) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📝' },
      { status: 'paid', label: 'Payment Confirmed', icon: '💳' },
      { status: 'processing', label: 'Processing', icon: '⚙️' },
      { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: '📦' },
      { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '✅' },
      { status: 'completed', label: 'Completed', icon: '🎉' }
    ];
    
    const currentIndex = steps.findIndex(s => s.status === status);
    return { steps, currentIndex };
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.patch(`/orders/${params.id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Order Not Found</h1>
          <Link href="/dashboard/orders" className="text-teal-600 hover:underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const { steps, currentIndex } = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center text-slate-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{order.order_number}</h1>
              <p className="text-slate-600 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Status</h2>
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 rounded">
                <div
                  className="h-full bg-teal-500 rounded transition-all"
                  style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step.status}
                    className={`flex flex-col items-center ${
                      index <= currentIndex ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                        index <= currentIndex
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {index < currentIndex ? '✓' : step.icon}
                    </div>
                    <span className="text-xs font-bold text-center max-w-[80px]">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex items-start justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.item_name}</h3>
                      {item.item_description && (
                        <p className="text-sm text-slate-500 mt-1">{item.item_description}</p>
                      )}
                      {item.selected_variant && (
                        <p className="text-xs text-slate-500 mt-1">
                          {Object.entries(item.selected_variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      {item.selected_addons && item.selected_addons.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Add-ons: {item.selected_addons.map(a => a.name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-slate-600 mt-2">
                        {item.quantity} x ${item.unit_price.toFixed(2)} {order.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${item.total_price.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-2 ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Delivery Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{order.delivery_type === 'delivery' ? '🚚' : '🏪'}</span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.delivery_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                    </p>
                    {order.estimated_delivery_time && (
                      <p className="text-sm text-slate-600">
                        Estimated: {new Date(order.estimated_delivery_time).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {order.delivery_type === 'delivery' && order.delivery_address && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-900 mb-1">Delivery Address</p>
                    <p className="text-slate-600">
                      {typeof order.delivery_address === 'string' 
                        ? order.delivery_address 
                        : JSON.stringify(order.delivery_address, null, 2)}
                    </p>
                    {order.delivery_instructions && (
                      <p className="text-sm text-slate-500 mt-2">
                        Instructions: {order.delivery_instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span>${order.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Service Fee</span>
                  <span>${order.service_fee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>${order.tax_amount?.toFixed(2) || '0.00'}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)} {order.currency}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t border-slate-200 pt-4 mb-4">
                <h3 className="font-bold text-slate-900 mb-2">Payment</h3>
                <p className="text-sm text-slate-600">
                  Method: {order.payment_method || 'N/A'}
                </p>
                <p className="text-sm text-slate-600">
                  Status: <span className={getStatusColor(order.payment_status)}>
                    {getStatusLabel(order.payment_status)}
                  </span>
                </p>
                {order.paid_at && (
                  <p className="text-sm text-slate-600">
                    Paid on: {new Date(order.paid_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post(`/orders/${order.order_id}/retry`);
                        if (res.data.checkoutUrl) {
                          window.location.href = res.data.checkoutUrl;
                        }
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Failed to retry payment');
                      }
                    }}
                    className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all"
                  >
                    Complete Payment
                  </button>
                )}

                {['pending', 'paid', 'processing'].includes(order.status) && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                  >
                    Cancel Order
                  </button>
                )}

                <Link
                  href="/dashboard/orders"
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all block text-center"
                >
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
