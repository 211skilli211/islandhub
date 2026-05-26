'use client';

import { useState } from 'react';
import { Radio, Megaphone, BarChart3, TrendingUp, Users, Store, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight, Activity, Package, Eye, MousePointerClick, Target } from 'lucide-react';

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, change, trend, icon, color }: {
  label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-5 border border-border-primary dark:border-ocean-700 hover:shadow-lg hover:border-border-primary dark:hover:border-ocean-600 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-ink-primary dark:text-sand-50">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-ink-tertiary dark:text-ink-tertiary'
            }`}>
              {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Quick Action Card ───────────────────────────────────────
function QuickActionCard({ label, description, icon, color, href }: {
  label: string; description: string; icon: React.ReactNode; color: string; href: string;
}) {
  return (
    <a href={href} className="flex items-center gap-4 p-4 rounded-xl border border-border-primary dark:border-ocean-700 hover:border-border-primary dark:hover:border-ocean-600 hover:bg-surface-primary dark:hover:bg-ocean-700/30 transition-all group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-primary dark:text-sand-50">{label}</p>
        <p className="text-xs text-ink-tertiary dark:text-ink-tertiary truncate">{description}</p>
      </div>
      <ArrowUpRight size={14} className="text-ink-tertiary group-hover:text-ocean-500 transition-colors flex-shrink-0" />
    </a>
  );
}

// ─── Revenue Chart (CSS-based) ───────────────────────────────
function RevenueChart({ period }: { period: string }) {
  const data: Record<string, number[]> = {
    '7d': [40, 55, 45, 65, 50, 70, 60],
    '30d': [40, 55, 45, 65, 50, 70, 60, 75, 80, 72, 85, 90, 78, 95, 88, 82, 92, 85, 78, 70, 82, 90, 95, 88, 76, 85, 92, 98, 88, 82],
    '90d': [30, 45, 35, 55, 40, 60, 50, 65, 70, 62, 75, 80, 68, 85, 78, 72, 82, 75, 68, 60, 72, 80, 85, 78, 66, 75, 82, 88, 78, 72, 65, 78, 85, 90, 82, 70, 78, 85, 88, 82, 75, 68, 80, 85, 90, 82, 75, 80, 85, 88, 82, 78, 85, 90, 92, 88, 85, 80, 75, 82, 88, 92, 85, 78, 85, 90, 88, 82, 78, 85, 90, 92, 88, 85, 80, 75, 82, 88, 92, 85, 78, 85, 90, 95, 90, 85, 88, 92, 95, 90],
  };
  const values = data[period] || data['30d'];
  const max = Math.max(...values);
  const labels: Record<string, string[]> = {
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '30d': Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (5 - i) * 5);
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }),
    '90d': Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (5 - i) * 15);
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }),
  };

  return (
    <div className="h-64 flex items-end gap-1.5 px-2">
      {values.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col gap-0.5 items-center group cursor-pointer">
          <div className="w-full bg-ocean-500/10 rounded-t-sm relative" style={{ height: `${(h / max) * 100}%` }}>
            <div className="absolute bottom-0 left-0 right-0 bg-ocean-500 rounded-t-sm transition-all group-hover:bg-ocean-400" style={{ height: '100%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (CSS-based) ─────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return (
              <circle
                key={i}
                cx="50" cy="50" r="35"
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${pct * 2.2} ${220 - pct * 2.2}`}
                strokeDashoffset={-offset * 2.2}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-ink-primary dark:text-sand-50">{total}</span>
          <span className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-ink-secondary dark:text-ink-tertiary flex-1">{seg.label}</span>
            <span className="text-xs font-semibold text-ink-primary dark:text-sand-50">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function OverviewPage() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary dark:text-sand-50">Dashboard Overview</h1>
          <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-secondary dark:bg-ocean-800 rounded-xl p-0.5 border border-border-primary dark:border-ocean-700">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setChartPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartPeriod === p ? 'bg-surface-elevated dark:bg-ocean-700 text-ink-primary dark:text-sand-50 shadow-sm' : 'text-ink-tertiary dark:text-ink-tertiary hover:text-ink-secondary dark:hover:text-slate-300'
                }`}>
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
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
        <StatCard label="Total Revenue" value="$18,420" change="+12.5% vs last" trend="up" color="bg-ocean-500/10 text-ocean-600 dark:text-ocean-400" icon={<DollarSign size={20} />} />
        <StatCard label="Total Orders" value="1,284" change="+8.2% vs last" trend="up" color="bg-sunset-500/10 text-sunset-600 dark:text-sunset-400" icon={<ShoppingCart size={20} />} />
        <StatCard label="Active Stores" value="12" change="+2 new this week" trend="up" color="bg-amber-500/10 text-amber-600 dark:text-amber-400" icon={<Store size={20} />} />
        <StatCard label="Active Users" value="892" change="+3.1% vs last" trend="up" color="bg-purple-500/10 text-purple-600 dark:text-purple-400" icon={<Users size={20} />} />
      </div>

      {/* Main Grid: Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Revenue Overview</h2>
            <div className="flex items-center gap-4 text-xs text-ink-tertiary dark:text-ink-tertiary">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-ocean-500" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-sunset-500" /> Orders</div>
            </div>
          </div>
          <RevenueChart period={chartPeriod} />
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700 p-5">
          <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50 mb-4">Stores by Category</h2>
          <DonutChart segments={[
            { label: 'Food', value: 3, color: '#0ea5e9' },
            { label: 'Retail', value: 1, color: '#f59e0b' },
            { label: 'Services', value: 7, color: '#22c55e' },
            { label: 'Tours', value: 1, color: '#a855f7' },
          ]} />
        </div>
      </div>

      {/* Quick Access Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Broadcast / Marquee Control */}
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 flex items-center justify-center">
              <Radio size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Broadcast / Marquee</h2>
              <p className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">Text marquee & announcements</p>
            </div>
          </div>
          <div className="space-y-2">
            <a href="/admin/broadcasts" className="flex items-center justify-between p-3 rounded-xl bg-surface-primary dark:bg-ocean-700/30 hover:bg-ocean-50 dark:hover:bg-ocean-700/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-ocean-500" />
                <span className="text-xs font-medium text-ink-secondary dark:text-slate-300">Text Marquee</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
            </a>
            <a href="/admin/marquee" className="flex items-center justify-between p-3 rounded-xl bg-surface-primary dark:bg-ocean-700/30 hover:bg-ocean-50 dark:hover:bg-ocean-700/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-sunset-500" />
                <span className="text-xs font-medium text-ink-secondary dark:text-slate-300">Brand Marquee</span>
              </div>
              <span className="text-[10px] text-ink-tertiary dark:text-ink-tertiary font-medium">3 brands</span>
            </a>
            <a href="/admin/notifications" className="flex items-center justify-between p-3 rounded-xl bg-surface-primary dark:bg-ocean-700/30 hover:bg-ocean-50 dark:hover:bg-ocean-700/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-purple-500" />
                <span className="text-xs font-medium text-ink-secondary dark:text-slate-300">Push Broadcast</span>
              </div>
              <span className="text-[10px] text-ink-tertiary dark:text-ink-tertiary font-medium">Send</span>
            </a>
          </div>
        </div>

        {/* Ad Banner Controller */}
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-sunset-500/10 text-sunset-600 dark:text-sunset-400 flex items-center justify-center">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Ad Banner Controller</h2>
              <p className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">Manage advertising spaces</p>
            </div>
          </div>
          <div className="space-y-2">
            <a href="/admin/ads" className="flex items-center justify-between p-3 rounded-xl bg-surface-primary dark:bg-ocean-700/30 hover:bg-ocean-50 dark:hover:bg-ocean-700/50 transition-colors">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-ocean-500" />
                <span className="text-xs font-medium text-ink-secondary dark:text-slate-300">Active Ads</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">5 live</span>
            </a>
            <a href="/admin/ads?tab=spaces" className="flex items-center justify-between p-3 rounded-xl bg-surface-primary dark:bg-ocean-700/30 hover:bg-ocean-50 dark:hover:bg-ocean-700/50 transition-colors">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-ink-secondary dark:text-slate-300">Ad Spaces</span>
              </div>
              <span className="text-[10px] text-ink-tertiary dark:text-ink-tertiary font-medium">8 spaces</span>
            </a>
            <a href="/admin/ads?tab=create" className="flex items-center justify-between p-3 rounded-xl bg-ocean-500/10 hover:bg-ocean-500/20 transition-colors">
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-ocean-600 dark:text-ocean-400" />
                <span className="text-xs font-semibold text-ocean-700 dark:text-ocean-400">Create New Ad</span>
              </div>
              <span className="text-[10px] text-ocean-600 dark:text-ocean-400 font-medium">+ New</span>
            </a>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">System Health</h2>
              <p className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">All services status</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'API Server', status: 'operational', uptime: '99.9%' },
              { label: 'Database', status: 'operational', uptime: '99.8%' },
              { label: 'Storage', status: 'operational', uptime: '100%' },
              { label: 'CDN', status: 'degraded', uptime: '97.2%' },
              { label: 'Render Deploy', status: 'operational', uptime: '99.5%' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs text-ink-secondary dark:text-ink-tertiary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">{item.uptime}</span>
                  <span className={`text-[10px] font-medium capitalize px-1.5 py-0.5 rounded ${
                    item.status === 'operational' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  }`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Stores + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stores */}
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Top Performing Stores</h2>
            <a href="/admin/stores" className="text-xs text-ocean-500 hover:underline font-medium">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border-primary dark:border-ocean-700 bg-surface-primary/50 dark:bg-ocean-800/50">
                  <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-5 py-2">Store</th>
                  <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-2">Orders</th>
                  <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-2">Revenue</th>
                  <th className="text-right text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-5 py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Horizon Salt', category: 'Food', orders: 47, revenue: '$2,340', growth: '+12%' },
                  { name: 'Caribbean Crafts', category: 'Retail', orders: 32, revenue: '$1,890', growth: '+8%' },
                  { name: 'Island Jerk Spot', category: 'Food', orders: 28, revenue: '$1,450', growth: '+23%' },
                  { name: 'Tropical Spa', category: 'Services', orders: 19, revenue: '$3,800', growth: '+5%' },
                  { name: 'Island Explorer Tours', category: 'Tours', orders: 15, revenue: '$4,500', growth: '+18%' },
                ].map(store => (
                  <tr key={store.name} className="border-t border-border-primary dark:border-ocean-700/50 hover:bg-surface-primary/50 dark:hover:bg-ocean-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white text-xs font-bold">{store.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-ink-primary dark:text-sand-50">{store.name}</p>
                          <p className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">{store.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-ink-secondary dark:text-ink-tertiary">{store.orders}</td>
                    <td className="px-3 py-3 text-sm font-medium text-ink-primary dark:text-sand-50">{store.revenue}</td>
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
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Recent Activity</h2>
            <button className="text-xs text-ocean-500 hover:underline font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-ocean-700/50">
            {[
              { action: 'New order #1042', detail: 'Horizon Salt — $45.00 XCD', time: '2 min ago', type: 'order' },
              { action: 'Store approved', detail: 'Island Jerk Spot', time: '15 min ago', type: 'store' },
              { action: 'New user registered', detail: 'sarah_k@example.com', time: '1 hour ago', type: 'user' },
              { action: 'Payout processed', detail: '$1,240.00 XCD — Caribbean Crafts', time: '3 hours ago', type: 'payout' },
              { action: 'Report filed', detail: 'Product listing #387', time: '5 hours ago', type: 'report' },
              { action: 'Delivery completed', detail: 'Order #1039 — St. Kitts', time: '6 hours ago', type: 'delivery' },
            ].map((item, i) => {
              const colors: Record<string, string> = {
                order: 'bg-ocean-500/10 text-ocean-600 dark:text-ocean-400',
                store: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                user: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                payout: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                delivery: 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
                report: 'bg-red-500/10 text-red-600 dark:text-red-400',
              };
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-primary/50 dark:hover:bg-ocean-700/30 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colors[item.type] || colors.order}`}>
                    <span className="text-xs font-bold">{item.type.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-primary dark:text-sand-50 truncate">{item.action}</p>
                    <p className="text-xs text-ink-tertiary dark:text-ink-tertiary truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-ink-tertiary dark:text-ink-tertiary whitespace-nowrap flex-shrink-0">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
