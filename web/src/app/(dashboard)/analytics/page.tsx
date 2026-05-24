'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic Imports for Heavy Chart Components
const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
    loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl" />,
    ssr: false
});

const OrderStatusChart = dynamic(() => import('@/components/charts/OrderStatusChart'), {
    loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-full" />,
    ssr: false
});

interface DashboardStats {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    avg_order_value: number;
    revenue_7d: number;
    revenue_30d: number;
    orders_7d: number;
    orders_30d: number;
    pending_orders: number;
    processing_orders: number;
    completed_orders: number;
}

interface SalesData {
    date: string;
    revenue: number;
    orders: number;
    customers: number;
}

interface TopProduct {
    listing_id: number;
    product_name: string;
    units_sold: number;
    revenue: number;
    avg_rating: number;
}

interface OrderStatus {
    status: string;
    order_count: number;
    total_amount: number;
}

interface CustomerStats {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    avg_customer_value: number;
}

export default function VendorAnalyticsDashboard() {
    const { user } = useAuthStore();
    const [timeRange, setTimeRange] = useState(30);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
    const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [statsRes, salesRes, productsRes, statusRes, customersRes] = await Promise.all([
                api.get('/analytics/vendor/dashboard'),
                api.get(`/analytics/vendor/sales-chart?days=${timeRange}`),
                api.get(`/analytics/vendor/top-products?days=${timeRange}&limit=10`),
                api.get('/analytics/vendor/order-status'),
                api.get(`/analytics/vendor/customers?days=${timeRange}`)
            ]);

            setStats(statsRes.data.data);
            setSalesData(salesRes.data.data);
            setTopProducts(productsRes.data.data);
            setOrderStatus(statusRes.data.data);
            setCustomerStats(customersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Chart data preparation
    const revenueChartData = {
        labels: salesData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Revenue',
                data: salesData.map(d => d.revenue),
                borderColor: 'rgb(13, 148, 136)',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Orders',
                data: salesData.map(d => d.orders * 10), // Scale for visibility
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                yAxisID: 'y1',
            }
        ]
    };

    const orderStatusData = {
        labels: orderStatus.map(s => s.status.replace(/_/g, ' ').toUpperCase()),
        datasets: [{
            data: orderStatus.map(s => s.order_count),
            backgroundColor: [
                'rgb(234, 179, 8)',  // yellow - pending
                'rgb(59, 130, 246)', // blue - paid/processing
                'rgb(34, 197, 94)',  // green - completed
                'rgb(239, 68, 68)',  // red - cancelled
            ],
        }]
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                        <p className="text-slate-600 mt-1">Track your store performance and insights</p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                        {[7, 30, 90].map(days => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${timeRange === days
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {days} Days
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</h3>
                            <span className="text-2xl">💰</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            ${stats?.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                        <p className="text-sm text-teal-600 mt-2 font-medium">
                            +${stats?.revenue_30d?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} (30d)
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Orders</h3>
                            <span className="text-2xl">📦</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats?.total_orders || 0}</p>
                        <p className="text-sm text-teal-600 mt-2 font-medium">
                            +{stats?.orders_30d || 0} (30d)
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</h3>
                            <span className="text-2xl">📊</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            ${stats?.avg_order_value?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Per transaction</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Customers</h3>
                            <span className="text-2xl">👥</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{customerStats?.total_customers || 0}</p>
                        <p className="text-sm text-teal-600 mt-2 font-medium">
                            +{customerStats?.new_customers || 0} new ({timeRange}d)
                        </p>
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-yellow-700">{stats?.pending_orders || 0}</p>
                        <p className="text-sm text-yellow-600 font-medium">Pending Orders</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-blue-700">{stats?.processing_orders || 0}</p>
                        <p className="text-sm text-blue-600 font-medium">Processing</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-green-700">{stats?.completed_orders || 0}</p>
                        <p className="text-sm text-green-600 font-medium">Completed</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-purple-700">
                            ${(stats?.revenue_7d || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">Revenue (7d)</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue & Orders Trend</h2>
                        <div className="h-80 w-full">
                            <RevenueChart data={revenueChartData} />
                        </div>
                    </div>

                    {/* Order Status Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Order Status</h2>
                        <div className="h-64 w-full">
                            <OrderStatusChart data={orderStatusData} />
                        </div>
                        <div className="mt-4 space-y-2">
                            {orderStatus.map(status => (
                                <div key={status.status} className="flex justify-between text-sm">
                                    <span className="text-slate-600 capitalize">{status.status.replace(/_/g, ' ')}</span>
                                    <span className="font-bold text-slate-900">{status.order_count} (${status.total_amount?.toFixed(2)})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Top Performing Products</h2>
                        <p className="text-sm text-slate-600 mt-1">Based on revenue (Last {timeRange} days)</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Units Sold</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topProducts.map((product, index) => (
                                    <tr key={product.listing_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 font-bold flex items-center justify-center text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="font-semibold text-slate-900">{product.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                            {product.units_sold}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                            ${product.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="font-bold text-slate-900">{product.avg_rating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {topProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No sales data available for this period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Insights */}
                {customerStats && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-slate-900">{customerStats.total_customers}</p>
                                <p className="text-sm text-slate-600 mt-1">Total Customers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-teal-600">{customerStats.new_customers}</p>
                                <p className="text-sm text-slate-600 mt-1">New ({timeRange}d)</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{customerStats.returning_customers}</p>
                                <p className="text-sm text-slate-600 mt-1">Returning</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600">
                                    ${customerStats.avg_customer_value?.toFixed(2)}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">Avg Customer Value</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
