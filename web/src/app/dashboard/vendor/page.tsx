'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Wallet,
  Plus, Pencil, Trash2, ChevronRight, Search, Filter
} from 'lucide-react';

type VendorTab = 'overview' | 'products' | 'orders' | 'analytics' | 'payouts';

const navItems = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'products', label: 'Products', icon: <Package size={16} /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
  { id: 'payouts', label: 'Payouts', icon: <Wallet size={16} /> },
];

const products = [
  { id: 1, name: 'Himalayan Pink Salt 500g', sku: 'HS-500', price: 25.00, stock: 142, status: 'active' },
  { id: 2, name: 'Himalayan Pink Salt 1kg', sku: 'HS-1K', price: 45.00, stock: 89, status: 'active' },
  { id: 3, name: 'Salt Grinder Set', sku: 'HS-SG', price: 85.00, stock: 34, status: 'active' },
  { id: 4, name: 'Salt Lamp Small', sku: 'HS-SL-S', price: 120.00, stock: 0, status: 'out_of_stock' },
  { id: 5, name: 'Salt Lamp Large', sku: 'HS-SL-L', price: 220.00, stock: 12, status: 'low_stock' },
  { id: 6, name: 'Bath Salt Collection', sku: 'HS-BATH', price: 35.00, stock: 67, status: 'active' },
];

const orders = [
  { id: '#1042', customer: 'Sarah K.', items: 2, total: 70.00, status: 'pending', date: 'May 16' },
  { id: '#1041', customer: 'Marcus T.', items: 1, total: 45.00, status: 'shipped', date: 'May 15' },
  { id: '#1040', customer: 'Lisa M.', items: 3, total: 155.00, status: 'delivered', date: 'May 15' },
  { id: '#1039', customer: 'James R.', items: 1, total: 25.00, status: 'delivered', date: 'May 14' },
  { id: '#1038', customer: 'Anita P.', items: 2, total: 170.00, status: 'processing', date: 'May 14' },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/100/10 text-emerald-400 dark:text-emerald-400',
    out_of_stock: 'bg-red-500/10 text-red-600 dark:text-red-400',
    low_stock: 'bg-sand-500/50/10 text-sand-500 dark:text-sand-400',
    pending: 'bg-sand-500/50/10 text-sand-500 dark:text-sand-400',
    processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    shipped: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    delivered: 'bg-emerald-500/100/10 text-emerald-400 dark:text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };
  return (
    <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status] || styles.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function KPICard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-4 border border-border-primary dark:border-ocean-700">
      <p className="text-xs font-medium text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-ink-primary dark:text-sand-50 mt-1">{value}</p>
      <p className={`text-xs mt-1.5 font-medium ${up ? 'text-emerald-400 dark:text-emerald-400' : 'text-sand-500 dark:text-sand-400'}`}>{change}</p>
    </div>
  );
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<VendorTab>('overview');
  const [orderFilter, setOrderFilter] = useState('all');

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);

  return (
    <DashboardLayout
      title="Vendor Dashboard"
      subtitle="Horizon Salt Co."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as VendorTab)}
      sidebarFooter={
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center text-white text-xs font-bold">H</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink-primary dark:text-sand-50 truncate">Horizon Salt</p>
            <p className="text-[10px] text-ink-tertiary dark:text-ink-tertiary">Vendor</p>
          </div>
        </div>
      }
    >
      {activeTab === 'overview' && (
        <div>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ink-primary dark:text-sand-50">Overview</h1>
            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">Performance summary for Horizon Salt</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KPICard label="Revenue (30d)" value="$8,420" change="+14.2% vs last month" up />
            <KPICard label="Orders (30d)" value="127" change="+8.5% vs last month" up />
            <KPICard label="Products" value="6" change="1 low stock" up={false} />
            <KPICard label="Avg. Rating" value="4.8 ★" change="23 reviews" up />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700">
              <div className="flex items-center justify-between p-4 border-b border-border-primary dark:border-ocean-700">
                <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-ocean-500 hover:underline font-medium flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-ocean-700/50">
                {orders.slice(0, 4).map(o => (
                  <div key={o.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-primary dark:text-sand-50">{o.id}</p>
                      <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">{o.customer} . {o.items} item{o.items > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-ink-primary dark:text-sand-50">${o.total.toFixed(2)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700">
              <div className="flex items-center justify-between p-4 border-b border-border-primary dark:border-ocean-700">
                <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Top Products</h2>
                <button onClick={() => setActiveTab('products')} className="text-xs text-ocean-500 hover:underline font-medium flex items-center gap-1">
                  Manage <ChevronRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-ocean-700/50">
                {products.filter(p => p.status === 'active').slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-medium text-ink-primary dark:text-sand-50 truncate">{p.name}</p>
                      <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">{p.sku} . Stock: {p.stock}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink-primary dark:text-sand-50 flex-shrink-0">${p.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-ink-primary dark:text-sand-50">Products</h1>
              <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">{products.length} products . {products.filter(p => p.status === 'active').length} active</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-semibold rounded-xl transition-colors self-start">
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-primary dark:border-ocean-700 bg-surface-primary/50 dark:bg-ocean-800/50">
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-5 py-3">Product</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">SKU</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Price</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Stock</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Status</th>
                    <th className="text-right text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-t border-border-primary dark:border-ocean-700/50 hover:bg-surface-primary/50 dark:hover:bg-ocean-700/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-ink-primary dark:text-sand-50">{p.name}</td>
                      <td className="px-3 py-3 text-sm text-ink-tertiary dark:text-ink-tertiary font-mono text-xs">{p.sku}</td>
                      <td className="px-3 py-3 text-sm font-medium text-ink-primary dark:text-sand-50">${p.price.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <span className={`text-sm font-medium ${
                          p.stock === 0 ? 'text-red-600 dark:text-red-400' :
                          p.stock < 20 ? 'text-sand-500 dark:text-sand-400' :
                          'text-ink-primary dark:text-sand-50'
                        }`}>{p.stock}</span>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-surface-secondary dark:hover:bg-ocean-700 text-ink-tertiary dark:text-ink-tertiary transition-colors"><Pencil size={14} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-ink-tertiary dark:text-ink-tertiary hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-ink-primary dark:text-sand-50">Orders</h1>
              <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">{orders.length} total orders</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map(s => (
                <button
                  key={s}
                  onClick={() => setOrderFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                    orderFilter === s
                      ? 'bg-ocean-500/10 text-ocean-600 dark:text-ocean-400'
                      : 'bg-surface-secondary dark:bg-ocean-800 text-ink-secondary dark:text-ink-tertiary hover:bg-surface-tertiary dark:hover:bg-ocean-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-primary dark:border-ocean-700 bg-surface-primary/50 dark:bg-ocean-800/50">
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-5 py-3">Order</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Customer</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Items</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Total</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Status</th>
                    <th className="text-left text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-3 py-3">Date</th>
                    <th className="text-right text-[10px] font-semibold text-ink-tertiary dark:text-ink-tertiary uppercase tracking-wider px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="border-t border-border-primary dark:border-ocean-700/50 hover:bg-surface-primary/50 dark:hover:bg-ocean-700/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-ocean-500">{o.id}</td>
                      <td className="px-3 py-3 text-sm text-ink-primary dark:text-sand-50">{o.customer}</td>
                      <td className="px-3 py-3 text-sm text-ink-secondary dark:text-ink-tertiary">{o.items}</td>
                      <td className="px-3 py-3 text-sm font-medium text-ink-primary dark:text-sand-50">${o.total.toFixed(2)}</td>
                      <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-3 py-3 text-sm text-ink-tertiary dark:text-ink-tertiary">{o.date}</td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs text-ocean-500 hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center text-sm text-ink-tertiary dark:text-ink-tertiary">No orders with status &quot;{orderFilter}&quot;</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ink-primary dark:text-sand-50">Analytics</h1>
            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">Performance insights for Horizon Salt</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard label="Page Views (30d)" value="2,847" change="+18.3% vs last period" up />
            <KPICard label="Conversion Rate" value="4.4%" change="+0.8% vs last period" up />
            <KPICard label="Cart Abandonment" value="32%" change="-5.2% vs last period" up={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700 p-5">
              <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50 mb-4">Sales by Product</h2>
              <div className="space-y-3">
                {products.filter(p => p.status === 'active').map((p, i) => {
                  const widths = [85, 62, 45, 30, 22];
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ink-secondary dark:text-ink-tertiary truncate mr-2">{p.name}</span>
                        <span className="text-xs font-medium text-ink-primary dark:text-sand-50 flex-shrink-0">{widths[i]}%</span>
                      </div>
                      <div className="h-2 bg-surface-secondary dark:bg-ocean-700 rounded-full overflow-hidden">
                        <div className="h-full bg-ocean-500 rounded-full transition-all" style={{ width: `${widths[i]}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700 p-5">
              <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50 mb-4">Traffic Sources</h2>
              <div className="space-y-3">
                {[
                  { source: 'Direct', pct: 42, color: 'bg-ocean-500' },
                  { source: 'Search', pct: 28, color: 'bg-sunset-500' },
                  { source: 'Social', pct: 18, color: 'bg-teal-500' },
                  { source: 'Referral', pct: 12, color: 'bg-sand-500/50' },
                ].map(item => (
                  <div key={item.source}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-xs text-ink-secondary dark:text-ink-tertiary">{item.source}</span>
                      </div>
                      <span className="text-xs font-medium text-ink-primary dark:text-sand-50">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-secondary dark:bg-ocean-700 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ink-primary dark:text-sand-50">Payouts</h1>
            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">Earnings and payment history</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KPICard label="Available Balance" value="$2,340.00" change="Ready to withdraw" up />
            <KPICard label="Pending (7d)" value="$480.00" change="Processing" up={false} />
            <KPICard label="Total Earned" value="$18,420.00" change="All time" up />
          </div>

          <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl border border-border-primary dark:border-ocean-700">
            <div className="p-4 border-b border-border-primary dark:border-ocean-700">
              <h2 className="text-sm font-semibold text-ink-primary dark:text-sand-50">Payout History</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-ocean-700/50">
              {[
                { date: 'May 15, 2026', amount: 1240.00, status: 'completed' },
                { date: 'May 1, 2026', amount: 980.00, status: 'completed' },
                { date: 'Apr 15, 2026', amount: 1560.00, status: 'completed' },
                { date: 'Apr 1, 2026', amount: 820.00, status: 'completed' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-primary dark:text-sand-50">${p.amount.toFixed(2)}</p>
                    <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">{p.date} . Bank Transfer</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
