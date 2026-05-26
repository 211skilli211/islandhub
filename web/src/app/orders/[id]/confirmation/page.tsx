'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import toast from '@/lib/toast';

interface OrderItem {
    order_item_id: number;
    listing_id: number;
    title: string;
    image_url?: string;
    store_name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    rental_dates?: any;
    service_details?: any;
}

interface Order {
    order_id: number;
    order_number: string;
    status: string;
    payment_status: string;
    subtotal: number;
    tax_amount: number;
    service_fee: number;
    total_amount: number;
    delivery_fee: number;
    currency: string;
    created_at: string;
}

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${params.id}`);
            setOrder(response.data);
            setItems(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path?: string) => {
        if (!path) return '/placeholder-product.jpg';
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-ink-primary mb-4">Order not found</h1>
                    <button
                        onClick={() => router.push('/listings')}
                        className="px-8 py-4 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-8 mb-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-ink-primary mb-2">Order Confirmed!</h1>
                    <p className="text-ink-secondary mb-4">Thank you for your purchase</p>
                    <p className="text-sm text-ink-tertiary">Order #{order.order_number}</p>
                </div>

                {/* Order Details */}
                <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6 mb-8">
                    <h2 className="text-2xl font-bold text-ink-primary mb-6">Order Details</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-ink-secondary">Order Date</p>
                            <p className="font-semibold text-ink-primary">
                                {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-ink-secondary">Payment Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.payment_status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.order_item_id} className="flex gap-4 p-4 bg-surface-primary rounded-xl">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-elevated">
                                    <Image
                                        src={getImageUrl(item.image_url)}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-ink-primary">{item.title}</h3>
                                    <p className="text-sm text-ink-secondary">{item.store_name}</p>

                                    {item.rental_dates && (
                                        <p className="text-xs text-accent-400 mt-1">
                                            Rental: {new Date(item.rental_dates.start).toLocaleDateString()} - {new Date(item.rental_dates.end).toLocaleDateString()}
                                        </p>
                                    )}
                                    {item.service_details && (
                                        <p className="text-xs text-accent-400 mt-1">
                                            Package: {item.service_details.package}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-ink-secondary">Qty: {item.quantity}</span>
                                        <span className="font-bold text-ink-primary">${item.total_price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Summary */}
                <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6 mb-8">
                    <h2 className="text-xl font-bold text-ink-primary mb-4">Payment Summary</h2>

                    <div className="space-y-2">
                        <div className="flex justify-between text-ink-secondary">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-ink-secondary">
                            <span>Service Fee</span>
                            <span>${order.service_fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-ink-secondary">
                            <span>Tax</span>
                            <span>${order.tax_amount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border-primary pt-2 mt-2">
                            <div className="flex justify-between text-xl font-bold text-ink-primary">
                                <span>Total Paid</span>
                                <span>${order.total_amount.toFixed(2)} XCD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/listings')}
                        className="flex-1 py-4 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 py-4 bg-surface-elevated border-2 border-border-primary text-ink-secondary font-bold rounded-xl hover:bg-surface-primary transition-all"
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        </div>
    );
}
