'use client';

import { useState } from 'react';
import { Building2, Users, MessageSquare, TrendingUp, Search } from 'lucide-react';

export default function BusinessCommunityPage() {
    const [activeTab, setActiveTab] = useState<'directory' | 'network' | 'forum'>('directory');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Business Community</h1>
                    <p className="text-slate-500 dark:text-slate-400">Connect with local businesses and explore B2B opportunities</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search businesses, services, or industries..." 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('directory')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        activeTab === 'directory' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Directory
                </button>
                <button
                    onClick={() => setActiveTab('network')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        activeTab === 'network' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Network
                </button>
                <button
                    onClick={() => setActiveTab('forum')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        activeTab === 'forum' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Forum
                </button>
            </div>

            {/* Content */}
            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { name: 'Island Food Co.', category: 'Food & Beverage', verified: true },
                        { name: 'Caribbean Tech Solutions', category: 'Technology', verified: true },
                        { name: 'Sunshine Rentals', category: 'Real Estate', verified: false },
                        { name: 'Tropical Logistics', category: 'Transportation', verified: true },
                        { name: 'Island Adventures', category: 'Tourism', verified: true },
                        { name: 'Coastal Services', category: 'Professional Services', verified: false },
                    ].map((business, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                {business.verified && (
                                    <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full">Verified</span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-4">{business.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{business.category}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'network' && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Join the network to connect with other business owners</p>
                    <button className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold">Request Access</button>
                </div>
            )}

            {activeTab === 'forum' && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Business discussions and industry insights</p>
                    <button className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold">Start Discussion</button>
                </div>
            )}
        </div>
    );
}