'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PlatformOverview {
  total_orders: number;
  active_stores: number;
  active_customers: number;
  total_revenue: number;
  total_commission: number;
  avg_order_value: number;
}

interface RevenueTrend {
  date: string;
  orders: number;
  revenue: number;
  commission: number;
  stores: number;
  customers: number;
}

interface TopStore {
  store_id: number;
  store_name: string;
  logo_url: string;
  order_count: number;
  total_revenue: number;
  unique_customers: number;
  avg_order_value: number;
}

interface UserStats {
  new_users: number;
  active_users: number;
  total_users: number;
  active_buyers: number;
}

export default function AdminAnalyticsDashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [topStores, setTopStores] = useState<TopStore[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [timeRange, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, trendsRes, storesRes, usersRes] = await Promise.all([
        api.get(`/analytics/admin/overview?days=${timeRange}`),
        api.get(`/analytics/admin/revenue-trends?days=${timeRange}`),
        api.get(`/analytics/admin/top-stores?days=${timeRange}&limit=10`),
        api.get(`/analytics/admin/user-stats?days=${timeRange}`)
      ]);

      setOverview(overviewRes.data.data);
      setTrends(trendsRes.data.data);
      setTopStores(storesRes.data.data);
      setUserStats(usersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const revenueChartData = {
    labels: trends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue',
        data: trends.map(t => t.revenue),
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Commission',
        data: trends.map(t => t.commission),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const platformDistributionData = {
    labels: ['Active Stores', 'Active Customers', 'Total Orders'],
    datasets: [{
      data: [
        overview?.active_stores || 0,
        overview?.active_customers || 0,
        overview?.total_orders || 0,
      ],
      backgroundColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
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
            <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="text-slate-600 mt-1">Overview of platform performance</p>
          </div>
          
          <div className="flex gap-2">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  timeRange === days
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Platform KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${overview?.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Commission</h3>
              <span className="text-2xl">🏦</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${overview?.total_commission?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Orders</h3>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.total_orders || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Stores</h3>
              <span className="text-2xl">🏪</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.active_stores || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Buyers</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.active_customers || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Order</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${overview?.avg_order_value?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* User Statistics */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-2xl text-white">
              <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Total Users</p>
              <p className="text-4xl font-bold mt-2">{userStats.total_users.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
              <p className="text-sm font-bold opacity-80 uppercase tracking-wider">New Users</p>
              <p className="text-4xl font-bold mt-2">+{userStats.new_users}</p>
              <p className="text-sm opacity-70 mt-1">Last {timeRange} days</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
              <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Active Users</p>
              <p className="text-4xl font-bold mt-2">{userStats.active_users.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
              <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Active Buyers</p>
              <p className="text-4xl font-bold mt-2">{userStats.active_buyers}</p>
              <p className="text-sm opacity-70 mt-1">Made purchases</p>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue & Commission Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue & Commission Trends</h2>
            <div className="h-80">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Platform Activity</h2>
            <div className="h-64">
              <Doughnut
                data={platformDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Stores Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Top Performing Stores</h2>
            <p className="text-sm text-slate-600 mt-1">Based on revenue (Last {timeRange} days)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Customers</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topStores.map((store, index) => (
                  <tr key={store.store_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 font-bold flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        {store.logo_url && (
                          <img src={store.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <span className="font-semibold text-slate-900">{store.store_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {store.order_count}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {store.unique_customers}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${store.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      ${store.avg_order_value?.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {topStores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No store data available for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
