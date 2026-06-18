'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Radio, Megaphone, BarChart3, TrendingUp, Users, Store, DollarSign, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Activity, Package, Eye, Target, ChevronRight,
  Truck, Shield, CreditCard, Bot, Settings, Home, Award
} from 'lucide-react';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, change, trend, icon, color, href }: {
  label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode; color: string; href?: string;
}) {
  const content = (
    <div className={`bg-surface-elevated rounded-xl p-4 border border-border-primary hover:shadow-md hover:border-accent-500/20 transition-all group ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1 truncate">{label}</p>
          <p className="text-xl font-bold text-ink-primary truncate">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${
              trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-ink-tertiary'
            }`}>
              {trend === 'up' ? <ArrowUpRight size={11} /> : trend === 'down' ? <ArrowDownRight size={11} /> : null}
              <span className="truncate">{change}</span>
            </div>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Revenue Chart (CSS-based) ───────────────────────────────────────────────
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
    '30d': Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (5 - i) * 5); return d.toLocaleDateString('en', { month: 'short', day: 'numeric' }); }),
    '90d': Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (5 - i) * 15); return d.toLocaleDateString('en', { month: 'short', day: 'numeric' }); }),
  };

  return (
    <div className="h-52 flex items-end gap-1 px-1">
      {values.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col gap-0.5 items-center group cursor-pointer">
          <div className="w-full bg-accent-500/10 rounded-t-sm relative hover:bg-accent-500/20 transition-colors" style={{ height: `${(h / max) * 100}%` }}>
            <div className="absolute bottom-0 left-0 right-0 bg-accent-500 rounded-t-sm transition-all group-hover:bg-accent-400" style={{ height: '100%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (CSS-based) ─────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return (
              <circle key={i} cx="50" cy="50" r="35" fill="none" stroke={seg.color} strokeWidth="12"
                strokeDasharray={`${pct * 2.2} ${220 - pct * 2.2}`} strokeDashoffset={-offset * 2.2} strokeLinecap="round" className="transition-all duration-500" />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-ink-primary">{total}</span>
          <span className="text-[9px] text-ink-tertiary">Total</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-ink-secondary flex-1">{seg.label}</span>
            <span className="text-[11px] font-semibold text-ink-primary">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Action ────────────────────────────────────────────────────────────
function QuickAction({ label, icon, color, href }: { label: string; icon: React.ReactNode; color: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-lg border border-border-primary hover:border-accent-500/20 hover:bg-surface-elevated transition-all group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>{icon}</div>
      <span className="text-xs font-semibold text-ink-primary flex-1">{label}</span>
      <ChevronRight size={12} className="text-ink-tertiary group-hover:text-accent-500 transition-colors" />
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-primary">Dashboard Overview</h1>
          <p className="text-xs text-ink-tertiary mt-0.5">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-elevated rounded-lg p-0.5 border border-border-primary">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setChartPeriod(p)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  chartPeriod === p ? 'bg-accent-500 text-white shadow-sm' : 'text-ink-tertiary hover:text-ink-secondary'
                }`}>
                {p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
          <button className="px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-lg transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards — 4 cols on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value="$18,420" change="+12.5% vs last" trend="up" color="bg-accent-500/10 text-accent-500" icon={<DollarSign size={16} />} href="/admin/revenue" />
        <StatCard label="Total Orders" value="1,284" change="+8.2% vs last" trend="up" color="bg-sky-500/10 text-sky-500" icon={<ShoppingCart size={16} />} href="/admin/orders" />
        <StatCard label="Active Stores" value="12" change="+2 new this week" trend="up" color="bg-amber-500/10 text-amber-500" icon={<Store size={16} />} href="/admin/stores" />
        <StatCard label="Active Users" value="892" change="+3.1% vs last" trend="up" color="bg-emerald-500/10 text-emerald-500" icon={<Users size={16} />} href="/admin/users" />
      </div>

      {/* Main Grid: Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface-elevated rounded-xl border border-border-primary p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ink-primary">Revenue Overview</h2>
            <div className="flex items-center gap-3 text-[10px] text-ink-tertiary">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-500" /> Revenue</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-500" /> Orders</div>
            </div>
          </div>
          <RevenueChart period={chartPeriod} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-surface-elevated rounded-xl border border-border-primary p-4">
          <h2 className="text-xs font-semibold text-ink-primary mb-3">Stores by Category</h2>
          <DonutChart segments={[
            { label: 'Food', value: 3, color: '#0ea5e9' },
            { label: 'Retail', value: 1, color: '#f59e0b' },
            { label: 'Services', value: 7, color: '#22c55e' },
            { label: 'Tours', value: 1, color: '#a855f7' },
          ]} />
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Broadcast */}
        <div className="bg-surface-elevated rounded-xl border border-border-primary p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-500/10 text-accent-500 flex items-center justify-center"><Radio size={14} /></div>
            <h2 className="text-xs font-semibold text-ink-primary">Broadcast</h2>
          </div>
          <div className="space-y-1.5">
            <QuickAction label="Text Marquee" icon={<Radio size={13} />} color="bg-accent-500/10 text-accent-500" href="/admin/broadcasts" />
            <QuickAction label="Brand Marquee" icon={<Award size={13} />} color="bg-amber-500/10 text-amber-500" href="/admin/brands" />
            <QuickAction label="Push Broadcast" icon={<Megaphone size={13} />} color="bg-emerald-500/10 text-emerald-500" href="/admin/notifications" />
          </div>
        </div>

        {/* Ads */}
        <div className="bg-surface-elevated rounded-xl border border-border-primary p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Megaphone size={14} /></div>
            <h2 className="text-xs font-semibold text-ink-primary">Ad Banners</h2>
          </div>
          <div className="space-y-1.5">
            <QuickAction label="Active Ads (5)" icon={<Eye size={13} />} color="bg-accent-500/10 text-accent-500" href="/admin/ads" />
            <QuickAction label="Ad Spaces (8)" icon={<Target size={13} />} color="bg-amber-500/10 text-amber-500" href="/admin/ads?tab=spaces" />
            <QuickAction label="Create New Ad" icon={<Megaphone size={13} />} color="bg-accent-500/10 text-accent-500" href="/admin/ads?tab=create" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-surface-elevated rounded-xl border border-border-primary p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Activity size={14} /></div>
            <h2 className="text-xs font-semibold text-ink-primary">System Health</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'API Server', status: 'operational', uptime: '99.9%', color: 'bg-emerald-500' },
              { label: 'Database', status: 'operational', uptime: '99.8%', color: 'bg-emerald-500' },
              { label: 'Storage', status: 'operational', uptime: '100%', color: 'bg-emerald-500' },
              { label: 'CDN', status: 'degraded', uptime: '97.2%', color: 'bg-amber-500' },
              { label: 'Render Deploy', status: 'operational', uptime: '99.5%', color: 'bg-emerald-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="text-[11px] text-ink-secondary">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ink-tertiary">{item.uptime}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                    item.status === 'operational' ? 'text-emerald-600 bg-emerald-500/10' : 'text-amber-600 bg-amber-500/10'
                  }`}>{item.status === 'operational' ? 'OK' : 'Slow'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Stores + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Stores */}
        <div className="bg-surface-elevated rounded-xl border border-border-primary">
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-xs font-semibold text-ink-primary">Top Performing Stores</h2>
            <Link href="/admin/stores" className="text-[11px] text-accent-500 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border-primary bg-surface-secondary/50">
                  <th className="text-left text-[9px] font-semibold text-ink-tertiary uppercase tracking-wider px-4 py-2">Store</th>
                  <th className="text-left text-[9px] font-semibold text-ink-tertiary uppercase tracking-wider px-3 py-2">Orders</th>
                  <th className="text-left text-[9px] font-semibold text-ink-tertiary uppercase tracking-wider px-3 py-2">Revenue</th>
                  <th className="text-right text-[9px] font-semibold text-ink-tertiary uppercase tracking-wider px-4 py-2">Growth</th>
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
                  <tr key={store.name} className="border-t border-border-primary hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-[10px] font-bold">{store.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-medium text-ink-primary">{store.name}</p>
                          <p className="text-[9px] text-ink-tertiary">{store.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-ink-secondary">{store.orders}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-ink-primary">{store.revenue}</td>
                    <td className="px-4 py-2.5 text-right"><span className="text-[11px] font-medium text-emerald-500">{store.growth}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-elevated rounded-xl border border-border-primary">
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-xs font-semibold text-ink-primary">Recent Activity</h2>
            <button className="text-[11px] text-accent-500 hover:underline font-medium">View All</button>
          </div>
          <div className="divide-y divide-border-primary">
            {[
              { action: 'New order #1042', detail: 'Horizon Salt — $45.00 XCD', time: '2 min ago', color: 'bg-accent-500/10 text-accent-500' },
              { action: 'Store approved', detail: 'Island Jerk Spot', time: '15 min ago', color: 'bg-emerald-500/10 text-emerald-500' },
              { action: 'New user registered', detail: 'sarah_k@example.com', time: '1 hour ago', color: 'bg-sky-500/10 text-sky-500' },
              { action: 'Payout processed', detail: '$1,240.00 XCD — Caribbean Crafts', time: '3 hours ago', color: 'bg-amber-500/10 text-amber-500' },
              { action: 'Report filed', detail: 'Product listing #387', time: '5 hours ago', color: 'bg-red-500/10 text-red-500' },
              { action: 'Delivery completed', detail: 'Order #1039 — St. Kitts', time: '6 hours ago', color: 'bg-accent-500/10 text-accent-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-secondary/30 transition-colors">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}>
                  <span className="text-[9px] font-bold">{item.action.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-primary truncate">{item.action}</p>
                  <p className="text-[10px] text-ink-tertiary truncate">{item.detail}</p>
                </div>
                <span className="text-[9px] text-ink-tertiary whitespace-nowrap flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
