'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import Link from 'next/link';

interface VendorOrdersProps {
    storeId: number;
    category?: string;
}

export default function VendorOrders({ storeId, category }: VendorOrdersProps) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isFood = category === 'food' || category === 'Food';
    const isService = category === 'service' || category === 'Services';
    const isTaxi = category === 'taxi' || category === 'Taxi';
    const isRental = category === 'rental' || category === 'Rentals';
    const isCampaign = category === 'campaign' || category === 'Campaign';

    const fetchOrders = async () => {
        if (!storeId) return;
        try {
            // Fetch relevant statuses based on category
            const statusFilter = isCampaign ? 'paid,completed' : 'paid,pending,preparing,ready';
            const res = await api.get(`/orders/store/${storeId}?status=${statusFilter}`);
            setOrders(res.data || []);
        } catch (error) {
            console.error('Orders Fetch Error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [storeId, category]);

    const updateStatus = async (orderId: number, status: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status } : o));
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            toast.success(`Booking #${orderId} updated to ${status.replace('_', ' ')}`);
        } catch (error) {
            console.error('Status update failed', error);
            toast.error('Failed to update status');
            fetchOrders(); // Revert on failure
        }
    };

    const getColumns = () => {
        if (isCampaign) {
            return {
                left: { label: 'Recent Donations', items: orders, nextStatus: 'completed', actionLabel: 'Acknowledge' },
                middle: { label: 'Processed', items: [], nextStatus: '', actionLabel: '' },
                right: { label: 'Finalized', items: [], nextStatus: '', actionLabel: '' }
            };
        }

        const newItems = orders.filter(o => ['pending', 'paid'].includes(o.status));
        const activeItems = orders.filter(o => o.status === 'preparing');
        const readyItems = orders.filter(o => o.status === 'ready');

        return {
            left: {
                label: isFood ? 'New Kitchen Orders' : isService ? 'Pending Bookings' : isTaxi ? 'Pending Pickups' : 'New Requests',
                items: newItems,
                nextStatus: isTaxi ? 'preparing' : 'preparing',
                actionLabel: isFood ? 'Start Prep ➔' : isTaxi ? 'Accept Ride ➔' : 'Confirm ➔'
            },
            middle: {
                label: isFood ? 'In Production' : isService ? 'In Progress' : isTaxi ? 'En Route' : 'Processing',
                items: activeItems,
                nextStatus: 'ready',
                actionLabel: isFood ? 'Mark Ready ✓' : isTaxi ? 'Arrived ✓' : 'Complete ✓'
            },
            right: {
                label: isFood ? 'Ready & Waiting' : 'Finalized',
                items: readyItems,
                nextStatus: 'completed',
                actionLabel: isFood ? 'Handed Over ✓' : 'Archive Order'
            }
        };
    };

    const { left, middle, right } = getColumns();

    if (loading && orders.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border-primary border-t-rose-500" />
                <p className="mt-4 text-ink-tertiary0 font-black uppercase text-[10px] tracking-widest">Hydrating Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary tracking-tight">
                        {isFood ? 'Live Kitchen KDS' : isTaxi ? 'Fleet Dispatch' : isService ? 'Booking Manager' : 'Orders & Requests'}
                    </h2>
                    <p className="text-ink-tertiary0 text-xs font-bold">Real-time store workflow</p>
                </div>
                <button
                    onClick={() => fetchOrders()}
                    className="bg-ink-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-tertiary transition-all shadow-lg shadow-black/10"
                >
                    Refresh Board
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Column 1 */}
                <div className="bg-surface-secondary rounded-4xl p-6 flex flex-col border border-border-primary">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-6 px-2 flex justify-between items-center">
                        <span>{left.label}</span>
                        <span className="bg-surface-tertiary text-ink-secondary px-2 py-0.5 rounded-full">{left.items.length}</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                        {left.items.map(order => (
                            <OrderCard key={order.order_id} order={order}
                                actionLabel={left.actionLabel}
                                onAction={() => updateStatus(order.order_id, left.nextStatus)}
                                color="border-l-4 border-border-primary"
                                isCampaign={isCampaign}
                            />
                        ))}
                        {left.items.length === 0 && <EmptyState label="Board Clear" />}
                    </div>
                </div>

                {/* Column 2 */}
                {!isCampaign && (
                    <div className="bg-[#e11d48]/5/50 rounded-4xl p-6 flex flex-col border border-[#e11d48]/20/50">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#e11d48] mb-6 px-2 flex justify-between items-center">
                            <span>{middle.label}</span>
                            <span className="bg-[#e11d48]/50 text-white px-2 py-0.5 rounded-full">{middle.items.length}</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                            {middle.items.map(order => (
                                <OrderCard key={order.order_id} order={order}
                                    actionLabel={middle.actionLabel}
                                    onAction={() => updateStatus(order.order_id, middle.nextStatus)}
                                    color="border-l-4 border-[#e11d48]"
                                />
                            ))}
                            {middle.items.length === 0 && <EmptyState label="No Active Work" />}
                        </div>
                    </div>
                )}

                {/* Column 3 */}
                {!isCampaign && (
                    <div className="bg-emerald-500/10/50 rounded-4xl p-6 flex flex-col border border-emerald-500/20/50">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 px-2 flex justify-between items-center">
                            <span>{right.label}</span>
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full">{right.items.length}</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                            {right.items.map(order => (
                                <OrderCard key={order.order_id} order={order}
                                    actionLabel={right.actionLabel}
                                    onAction={() => updateStatus(order.order_id, right.nextStatus)}
                                    color="border-l-4 border-emerald-500"
                                />
                            ))}
                            {right.items.length === 0 && <EmptyState label="All Caught Up" />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderCard({ order, actionLabel, onAction, color, isCampaign }: any) {
    const elapsed = Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000); // Minutes

    return (
        <div className={`bg-surface-elevated p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-border-primary ${color}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="font-black text-2xl text-ink-primary tracking-tighter italic">#{order.order_id}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[9px] font-black text-ink-tertiary tracking-widest uppercase">{order.customer_name || 'Guest User'}</p>
                        {order.user_id && (
                            <Link
                                href={`/dashboard/messages?userId=${order.user_id}&userName=${encodeURIComponent(order.customer_name || 'Customer')}`}
                                className="p-1.5 bg-surface-secondary text-ink-tertiary hover:bg-accent-500/10 hover:text-accent-400 rounded-lg transition-all"
                                title="Chat with Customer"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </Link>
                        )}
                    </div>
                    <div className="mt-1 flex gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${order.order_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-surface-secondary text-ink-tertiary0'}`}>
                            {order.order_type || 'pickup'}
                        </span>
                        {order.status === 'dispatched' && (
                            <span className="text-[8px] font-black bg-[#818cf8]/15 text-[#6366f1] px-2 py-0.5 rounded uppercase">With Driver</span>
                        )}
                    </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${elapsed > 15 ? 'bg-[#e11d48]/10 text-[#e11d48]' : 'bg-surface-secondary text-ink-tertiary0'}`}>
                    {elapsed}m
                </span>
            </div>

            <div className="space-y-2 mb-6 border-y border-border-primary py-4">
                {isCampaign ? (
                    <div className="flex justify-between items-center text-[#e11d48] font-black">
                        <span>Donation</span>
                        <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                ) : (
                    order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-ink-secondary">
                            <span className="flex gap-2">
                                <span className="text-[#e11d48]">{item.quantity}x</span>
                                <span>{item.item_name || item.title || 'Item'}</span>
                            </span>
                        </div>
                    ))
                )}
            </div>

            {actionLabel && (
                <button
                    onClick={onAction}
                    className="w-full py-4 bg-ink-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-surface-tertiary active:scale-95 transition-all shadow-lg shadow-black/10">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-border-primary/30 rounded-3xl bg-surface-secondary/30">
            <span className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">{label}</span>
        </div>
    );
}
