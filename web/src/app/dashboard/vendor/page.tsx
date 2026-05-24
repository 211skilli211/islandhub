'use client';

import { useState } from 'react';

type VendorTab = 'overview' | 'products' | 'orders' | 'analytics' | 'payouts';

const vendorNavItems: { id: VendorTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> } },
  { id: 'products', label: 'Products', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> } },
  { id: 'orders', label: 'Orders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> } },
  { id: 'analytics', label: 'Analytics', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> } },
  { id: 'payouts', label: 'Payouts', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> } },
];

const mockProducts = [
  { id: 1, name: 'Himalayan Pink Salt 500g', sku: 'HS-500', price: '$25.00', stock: 142, status: 'active', image: '🧂' },
  { id: 2, name: 'Himalayan Pink Salt 1kg', sku: 'HS-1K', price: '$45.00', stock: 89, status: 'active', image: '🧂' },
  { id: 3, name: 'Salt Grinder Set', sku: 'HS-SG', price: '$85.00', stock: 34, status: 'active', image: '🥄' },
  { id: 4, name: 'Salt Lamp Small', sku: 'HS-SL-S', price: '$120.00', stock: 0, status: 'out_of_stock', image: '💡' },
  { id: 5, name: 'Salt Lamp Large', sku: 'HS-SL-L', price: '$220.00', stock: 12, status: 'active', image: '💡' },
  { id: 6, name: 'Bath Salt Collection', sku: 'HS-BATH', price: '$35.00', stock: 67, status: 'active', image: '🛁' },
];

const mockOrders = [
  { id: '#1042', customer: 'Sarah K.', items: 2, total: '$70.00', status: 'pending', date: 'May 16' },
  { id: '#1041', customer: 'Marcus T.', items: 1, total: '$45.00', status: 'shipped', date: 'May 15' },
  { id: '#1040', customer: 'Lisa M.', items: 3, total: '$155.00', status: 'delivered', date: 'May 15' },
  { id: '#1039', customer: 'James R.', items: 1, total: '$25.00', status: 'delivered', date: 'May 14' },
  { id: '#1038', customer: 'Anita P.', items: 2, total: '$170.00', status: 'processing', date: 'May 14' },
];

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  out_of_stock: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  delivered: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<VendorTab>('overview');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const filteredOrders = orderFilter === 'all' ? mockOrders : mockOrders.filter(o => o.status === orderFilter);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-full lg:w-56 bg-white dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">H</div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Horizon Salt</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Vendor Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="p-2 flex lg:flex-col gap-1 overflow-x-auto">
          {vendorNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vendor Overview</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Horizon Salt Co. — Performance summary</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Revenue', value: '$8,420', change: '+14.2%', up: true, color: 'from-teal-500 to-teal-600' },
                { label: 'Orders (30d)', value: '127', change: '+8.5%', up: true, color: 'from-blue-500 to-blue-600' },
                { label: 'Products', value: '6', change: '1 low stock', up: false, color: 'from-amber-500 to-amber-600' },
                { label: 'Avg. Rating', value: '4.8', change: '★ 23 reviews', up: true, color: 'from-purple-500 to-purple-600' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} opacity-20`}></div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                  <p className={`text-xs mt-1 font-medium ${kpi.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{kpi.change}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">View All</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {mockOrders.slice(0, 4).map(order => (
                    <div key={order.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{order.id}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.customer} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{order.total}</p>
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Top Products</h2>
                  <button onClick={() => setActiveTab('products')} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">Manage</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {mockProducts.filter(p => p.status === 'active').slice(0, 4).map(product => (
                    <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{product.image}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku} · Stock: {product.stock}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{product.price}</span>
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Products</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{mockProducts.length} products · {mockProducts.filter(p => p.status === 'active').length} active</p>
              </div>
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 self-start">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Product
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Product</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">SKU</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Price</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Stock</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Status</th>
                      <th className="text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProducts.map(product => (
                      <tr key={product.id} className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">{product.image}</div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{product.sku}</td>
                        <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white">{product.price}</td>
                        <td className="px-3 py-3">
                          <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : product.stock < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{product.stock}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[product.status]}`}>{product.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Orders</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{mockOrders.length} total orders</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['all', 'pending', 'processing', 'shipped', 'delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                      orderFilter === status
                        ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Order</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Customer</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Items</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Total</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Status</th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-3">Date</th>
                      <th className="text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-teal-600 dark:text-teal-400">{order.id}</td>
                        <td className="px-3 py-3 text-sm text-slate-900 dark:text-white">{order.customer}</td>
                        <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400">{order.items}</td>
                        <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white">{order.total}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{order.date}</td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No orders with status "{orderFilter}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Performance insights for Horizon Salt</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Page Views (30d)', value: '2,847', change: '+18.3%', up: true },
                { label: 'Conversion Rate', value: '4.4%', change: '+0.8%', up: true },
                { label: 'Cart Abandonment', value: '32%', change: '-5.2%', up: false },
              ].map(metric => (
                <div key={metric.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                  <p className={`text-xs mt-1 font-medium ${metric.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{metric.change} vs last period</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Sales by Product</h2>
                <div className="space-y-3">
                  {mockProducts.filter(p => p.status === 'active').map((product, i) => {
                    const widths = [85, 62, 45, 30, 22];
                    return (
                      <div key={product.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-700 dark:text-slate-300 truncate mr-2">{product.name}</span>
                          <span className="text-xs font-medium text-slate-900 dark:text-white flex-shrink-0">{widths[i]}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" style={{ width: `${widths[i]}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Traffic Sources</h2>
                <div className="space-y-3">
                  {[
                    { source: 'Direct', pct: 42, color: 'bg-teal-500' },
                    { source: 'Search', pct: 28, color: 'bg-blue-500' },
                    { source: 'Social', pct: 18, color: 'bg-purple-500' },
                    { source: 'Referral', pct: 12, color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                          <span className="text-xs text-slate-700 dark:text-slate-300">{item.source}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-900 dark:text-white">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payouts</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Earnings and payment history</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Available Balance', value: '$2,340.00', color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Pending (7d)', value: '$480.00', color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Total Earned', value: '$18,420.00', color: 'text-slate-900 dark:text-white' },
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Payout History</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {[
                  { date: 'May 15, 2026', amount: '$1,240.00', status: 'completed', method: 'Bank Transfer' },
                  { date: 'May 1, 2026', amount: '$980.00', status: 'completed', method: 'Bank Transfer' },
                  { date: 'Apr 15, 2026', amount: '$1,560.00', status: 'completed', method: 'Bank Transfer' },
                  { date: 'Apr 1, 2026', amount: '$820.00', status: 'completed', method: 'Bank Transfer' },
                ].map((payout, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{payout.amount}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{payout.date} · {payout.method}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{payout.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
