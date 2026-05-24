'use client';

import { useState } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, change, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {trend === 'up' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const quickActions = [
  { label: 'Add Store', icon: '+', href: '/admin/stores?action=create', color: 'bg-teal-500' },
  { label: 'Upload Media', icon: '↑', href: '/admin/media', color: 'bg-blue-500' },
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

export default function OverviewPage() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            {(['7d', '30d', '90d'] as const).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chartPeriod === period
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
          color="bg-teal-500/10 text-teal-600 dark:text-teal-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Total Orders"
          value="1,284"
          change="+8.2% vs last month"
          trend="up"
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        />
        <StatCard
          label="Active Stores"
          value="12"
          change="+2 new this week"
          trend="up"
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard
          label="Active Users"
          value="892"
          change="+3.1% vs last month"
          trend="up"
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue Overview</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                Orders
              </div>
            </div>
          </div>
          {/* Chart area */}
          <div className="h-64 flex items-end gap-1.5 px-2">
            {[40, 55, 45, 65, 50, 70, 60, 75, 80, 72, 85, 90, 78, 95, 88, 82, 92, 85, 78, 70, 82, 90, 95, 88, 76, 85, 92, 98, 88, 82].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                <div className="w-full bg-teal-500/20 rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-teal-500 rounded-t-sm transition-all group-hover:bg-teal-400" style={{ height: '100%' }}></div>
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

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{action.label}</span>
              </a>
            ))}
          </div>

          {/* System Status */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                      item.status === 'operational' ? 'bg-emerald-500' :
                      item.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-[10px] font-medium capitalize ${
                      item.status === 'operational' ? 'text-emerald-600 dark:text-emerald-400' :
                      item.status === 'degraded' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600'
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Top Performing Stores</h2>
            <a href="/admin/stores" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2">Store</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">Orders</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">Revenue</th>
                  <th className="text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {topStores.map((store, i) => (
                  <tr key={store.name} className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                          {store.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{store.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{store.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400">{store.orders}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white">{store.revenue}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-medium ${
                        store.growth.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>{store.growth}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            <button className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  item.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  item.type === 'store' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                  item.type === 'user' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                  item.type === 'payout' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  item.type === 'delivery' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  <span className="text-xs font-bold">{item.type.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.action}</p>
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
