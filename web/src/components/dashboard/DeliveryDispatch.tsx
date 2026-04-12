'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface DeliveryDispatchProps {
    storeId?: string;
}

interface DeliveryJob {
    id: number;
    order_id: number;
    customer_name: string;
    customer_address: string;
    items: string[];
    status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
    driver_name?: string;
    driver_id?: number;
    created_at: string;
    estimated_delivery?: string;
}

interface LogisticsStats {
    pending: number;
    assigned: number;
    in_transit: number;
    delivered_today: number;
    total_jobs: number;
}

export default function DeliveryDispatch({ storeId }: DeliveryDispatchProps) {
    const [jobs, setJobs] = useState<DeliveryJob[]>([]);
    const [stats, setStats] = useState<LogisticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<DeliveryJob | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchJobs();
        fetchStats();
    }, [storeId]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/logistics/jobs');
            const data = response.data;

            // Transform API data to match our interface
            const transformedJobs: DeliveryJob[] = Array.isArray(data) ? data.map((job: any) => ({
                id: job.id || job.job_id,
                order_id: job.order_id,
                customer_name: job.customer_name || job.customer?.name || 'Unknown Customer',
                customer_address: job.customer_address || job.address || 'No address',
                items: job.items || (job.order_items ? JSON.parse(job.order_items) : ['Order items']),
                status: job.status || 'pending',
                driver_name: job.driver_name || job.driver?.name,
                driver_id: job.driver_id || job.driver?.id,
                created_at: job.created_at || job.created,
                estimated_delivery: job.estimated_delivery || job.eta,
            })) : [];

            setJobs(transformedJobs);
        } catch (err: any) {
            console.error('Error fetching delivery jobs:', err);
            setError(err.message || 'Failed to load delivery jobs');
            // Fallback to empty array - the UI will handle it
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/logistics/stats');
            const data = response.data;

            setStats({
                pending: data.pending || data.pending_count || 0,
                assigned: data.assigned || data.assigned_count || 0,
                in_transit: data.in_transit || data.transit_count || 0,
                delivered_today: data.delivered_today || data.delivered_count || 0,
                total_jobs: data.total_jobs || data.total || 0,
            });
        } catch (err) {
            console.error('Error fetching logistics stats:', err);
            // Calculate stats from jobs as fallback
            setStats(null);
        }
    };

    const filteredJobs = statusFilter === 'all'
        ? jobs
        : jobs.filter(job => job.status === statusFilter);

    const pendingCount = stats?.pending || jobs.filter(j => j.status === 'pending').length;
    const assignedCount = stats?.assigned || jobs.filter(j => j.status === 'assigned').length;
    const inTransitCount = stats?.in_transit || jobs.filter(j => j.status === 'picked_up').length;
    const deliveredCount = stats?.delivered_today || jobs.filter(j => j.status === 'delivered').length;
    const totalCount = stats?.total_jobs || jobs.length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'picked_up': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500';
            case 'assigned': return 'bg-blue-500';
            case 'picked_up': return 'bg-purple-500';
            case 'delivered': return 'bg-emerald-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Delivery Dispatch</h2>
                    <p className="text-gray-600">Manage and track all delivery requests</p>
                </div>
                <button
                    onClick={fetchJobs}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <span>↻</span> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                >
                    <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                    <div className="text-sm text-amber-700">Pending</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                >
                    <div className="text-2xl font-bold text-blue-600">{assignedCount}</div>
                    <div className="text-sm text-blue-700">Assigned</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-200"
                >
                    <div className="text-2xl font-bold text-purple-600">{inTransitCount}</div>
                    <div className="text-sm text-purple-700">In Transit</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-emerald-50 rounded-xl p-4 border border-emerald-200"
                >
                    <div className="text-2xl font-bold text-emerald-600">{deliveredCount}</div>
                    <div className="text-sm text-emerald-700">Delivered</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                    <div className="text-2xl font-bold text-gray-600">{totalCount}</div>
                    <div className="text-sm text-gray-700">Total</div>
                </motion.div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'assigned', 'picked_up', 'delivered'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Delivery List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Active Deliveries</h3>
                    <span className="text-sm text-gray-500">{filteredJobs.length} jobs</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
                        <p className="text-gray-500 mt-2">Loading deliveries...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-2">📦</div>
                        <p className="text-gray-500">No delivery requests found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {statusFilter !== 'all' ? 'Try changing the filter' : 'New requests will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredJobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${getStatusDot(job.status)}`} />
                                        <div>
                                            <div className="font-medium text-gray-900">{job.customer_name}</div>
                                            <div className="text-sm text-gray-500">{job.customer_address}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {job.items.slice(0, 2).join(', ')}
                                                {job.items.length > 2 && ` +${job.items.length - 2} more`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                                            {job.status.replace('_', ' ')}
                                        </span>
                                        {job.driver_name && (
                                            <div className="text-sm text-gray-500 mt-1">🚗 {job.driver_name}</div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            {formatTime(job.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left">
                    <div className="font-medium text-gray-900">Assign Driver</div>
                    <div className="text-sm text-gray-500">Match pending orders to available drivers</div>
                </button>
                <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                    <div className="font-medium text-gray-900">Track Live</div>
                    <div className="text-sm text-gray-500">View real-time driver locations</div>
                </button>
                <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left">
                    <div className="font-medium text-gray-900">Delivery History</div>
                    <div className="text-sm text-gray-500">View completed deliveries</div>
                </button>
            </div>
        </div>
    );
}
