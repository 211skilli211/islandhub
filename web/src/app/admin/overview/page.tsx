'use client';

import { useState } from 'react';

function StatCard({ label, value, change, trend, icon, color }: {
  label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white dark:bg-ocean-800 rounded-2xl p-5 border border-slate-200 dark:border-ocean-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-ocean-600 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-sand-50">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {trend === 'up' && <span>↑</span>}
              {trend === 'down' && <span>↓</span>}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const quickActions = [
  { label: 'Add Store', icon: '+', href: '/admin/stores?action=create', color: 'bg-ocean-500' },
  { label: 'Upload Media', icon: '↑', href: '/admin/media', color: 'bg-sunset-500' },
  { label: 'Manage Orders', icon: '○', href: '/admin/orders', color: 'bg-amber-500' },
  { label: 'View Reports', icon: '◈', href: '/admin/reports', color: 'bg-purple-500' },
];

const recentActivity = [
  { action: 'New order #1042', detail: 'Horizon Salt — $45.00 XCD', time: '2 min ago', type: 'order' },
  { action: 'Store approved', detail: 'Island Jerk Spot', time: '15 min ago', type: 'store' },
  { action: 'New user registered', detail: 'sarah_k@example.com', time: '1 hour ago', type: 'user' },
  { action: 'Payout processed', detail: '$1,240.00 XCD — Caribbean Crafts', time: '3 hours ago', type: 'payout' },
  { action: 'Report filed', detail: 'Product listing #387', time: '5 hours ago', type: 'report' },
  { action: 'Delivery completed', detail: 'Order #1039 — St. Kitts', time: '6 hours ago', type: 'delivery' },
];

const topStores = [
  { name: 'Horizon Salt', category: 'Food', orders: 47, revenue: '$2,340', growth: '+12%' },
  { name: 'Caribbean Crafts', category: 'Retail', orders: 32, revenue: '$1,890', growth: '+8%' },
  { name: 'Island Jerk Spot', category: 'Food', orders: 28, revenue: '$1,450', growth: '+23%' },
  { name: 'Tropical Spa', category: 'Services', orders: 19, revenue: '$3,800', growth: '+5%' },
  { name: 'Island Explorer Tours', category: 'Tours', orders: 15, revenue: '$4,500', growth: '+18%' },
];

const activityColors: Record<string, string> = {
  order: 'bg-ocean-500/10 text-ocean-600 dark:text-ocean-400',
  store: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  user: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  payout: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  delivery: 'bg-turquoise-500/10 text-turquoise-600 dark:text-turquoise-400',
  report: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function OverviewPage() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-sand-50">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-ocean-800 rounded-xl p-0.5 border border-slate-200 dark:border-ocean-700">
            {(['7d', '30d', '90d'] as const).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartPeriod === period
                    ? 'bg-white dark:bg-ocean-700 text-slate-900 dark:text-sand-50 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button className="px-4 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-semibold rounded-xl transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value="$18,420"
          change="+12.5% vs last month"
          trend="up"
          color="bg-ocean-500/10 text-ocean-600 dark:text-ocean-400"
          icon={<span className="text-lg">💰</span>}
        />
        <StatCard
          label="Total Orders"
          value="1,284"
          change="+8.2% vs last month"
          trend="up"
          color="bg-sunset-500/10 text-sunset-600 dark:text-sunset-400"
          icon={<span className="text-lg">📋</span>}
        />
        <StatCard
          label="Active Stores"
          value="12"
          change="+2 new this week"
          trend="up"
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          icon={<span className="text-lg">🏪</span>}
        />
        <StatCard
          label="Active Users"
          value="892"
          change="+3.1% vs last month"
          trend="up"
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          icon={<span className="text-lg">👥</span>}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-ocean-800 rounded-2xl border border-slate-200 dark:border-ocean-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-sand-50">Revenue Overview</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-ocean-500" />
                Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sunset-500" />
                Orders
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-1.5 px-2">
            {[40, 55, 45, 65, 50, 70, 60, 75, 80, 72, 85, 90, 78, 95, 88, 82, 92, 85, 78, 70, 82, 90, 95, 88, 76, 85, 92, 98, 88, 82].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center group cursor-pointer">
                <div className="w-full bg-ocean-500/10 rounded-t-sm relative" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-ocean-500 rounded-t-sm transition-all group-hover:bg-ocean-400" style={{ height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500 px-2">
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (5 - i) * 5);
              return <span key={i}>{d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>;
            })}
          </div>
        </div>

        {/* Quick Actions + System Status */}
        <div className="bg-white dark:bg-ocean-800 rounded-2xl border border-slate-200 dark:border-ocean-700 p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-sand-50 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(a => (
              <a key={a.label} href={a.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-ocean-700 hover:border-slate-300 dark:hover:border-ocean-600 hover:bg-slate-50 dark:hover:bg-ocean-700/30 transition-all group">
                <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{a.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-ocean-700">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">System Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'API Server', status: 'operational' },
                { label: 'Database', status: 'operational' },
                { label: 'Storage', status: 'operational' },
                { label: 'CDN', status: 'degraded' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'operational' ? 'bg-emerald-500' : item.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-[10px] font-medium capitalize ${
                      item.status === 'operational' ? 'text-emerald-600 dark:text-emerald-400' : item.status === 'degraded' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600'
                    }`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stores */}
        <div className="bg-white dark:bg-ocean-800 rounded-2xl border border-slate-200 dark:border-ocean-700">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-sand-50">Top Performing Stores</h2>
            <a href="/admin/stores" className="text-xs text-ocean-500 hover:underline font-medium">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-slate-200 dark:border-ocean-700 bg-slate-50/50 dark:bg-ocean-800/50">
                  <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2">Store</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">Orders</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">Revenue</th>
                  <th className="text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {topStores.map(store => (
                  <tr key={store.name} className="border-t border-slate-100 dark:border-ocean-700/50 hover:bg-slate-50/50 dark:hover:bg-ocean-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white text-xs font-bold">
                          {store.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-sand-50">{store.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{store.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400">{store.orders}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-sand-50">{store.revenue}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-medium ${store.growth.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{store.growth}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-ocean-800 rounded-2xl border border-slate-200 dark:border-ocean-700">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-sand-50">Recent Activity</h2>
            <button className="text-xs text-ocean-500 hover:underline font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-ocean-700/50">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-ocean-700/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activityColors[item.type] || activityColors.order}`}>
                  <span className="text-xs font-bold">{item.type.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-sand-50 truncate">{item.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
