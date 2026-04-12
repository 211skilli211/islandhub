'use client';

import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface AnalyticsProps {
    data: {
        stats: {
            total_revenue: number;
            total_orders: number;
            total_views: number;
        };
        trend: any[];
        breakdown: any[];
        performance: any[];
    };
}

const COLORS = ['#0d9488', '#2563eb', '#7c3aed', '#db2777', '#f59e0b'];

export default function VendorDashboardAnalytics({ data }: AnalyticsProps) {
    const { stats, trend, breakdown, performance } = data;

    const conversionRate = stats.total_views > 0
        ? ((stats.total_orders / stats.total_views) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `$${Number(stats.total_revenue || 0).toLocaleString()}`, icon: '💰', color: 'teal' },
                    { label: 'Total Orders', value: stats.total_orders || 0, icon: '📦', color: 'blue' },
                    { label: 'Listing Views', value: stats.total_views || 0, icon: '👁️', color: 'indigo' },
                    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '📈', color: 'rose' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-100/50">
                        <div className="text-2xl mb-4">{stat.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Revenue Trend</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last 6 Months</span>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend.reverse()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0d9488"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Split */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic mb-8">Category Split</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakdown}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="units"
                                    nameKey="type"
                                >
                                    {breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {breakdown.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="font-bold text-slate-500 uppercase tracking-widest">{entry.type}</span>
                                </div>
                                <span className="font-black text-slate-900">{entry.units} Sold</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Listing Performance */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Top Listings Performance</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views vs Sales</p>
                </div>
                <div className="space-y-6">
                    {performance.map((item, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-black text-slate-900 truncate max-w-[200px]">{item.title}</span>
                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">{item.views} Views</span>
                                    <span className="text-teal-600">{item.sales} Sales</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden flex">
                                <div
                                    className="h-full bg-slate-200 transition-all duration-500 group-hover:bg-indigo-100"
                                    style={{ width: `${Math.min(100, (Number(item.views) / Math.max(...performance.map(p => Number(p.views)))) * 100)}%` }}
                                />
                                <div
                                    className="h-full bg-teal-500 -ml-1 rounded-r-full"
                                    style={{ width: `${(Number(item.sales) / Math.max(1, Number(item.views))) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
