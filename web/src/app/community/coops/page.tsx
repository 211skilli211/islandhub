'use client';

import { Building2, Users, Search } from 'lucide-react';

export default function CoopsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Cooperatives</h1>
                    <p className="text-slate-500 dark:text-slate-400">Join forces with others for collective buying power and shared resources</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search cooperatives..." 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Coops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Island Grocers Cooperative', members: 45, category: 'Retail', savings: '15%' },
                    { name: 'Farmers United', members: 32, category: 'Agriculture', savings: '20%' },
                    { name: 'Island Transport Pool', members: 28, category: 'Transportation', savings: '25%' },
                    { name: 'Tech Share Collective', members: 18, category: 'Technology', savings: '30%' },
                    { name: 'Bulk Buyers Club', members: 56, category: 'General', savings: '18%' },
                    { name: 'Shared Workspace Hub', members: 12, category: 'Professional', savings: '40%' },
                ].map((coop, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">{coop.category}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mt-4">{coop.name}</h3>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                <Users className="w-4 h-4" />
                                {coop.members} members
                            </div>
                            <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">Save {coop.savings}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Co-op CTA */}
            <div className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-teal-100 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Start a Cooperative</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Gather neighbors, friends, or fellow entrepreneurs to unlock collective savings</p>
                <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold">Create Co-op</button>
            </div>
        </div>
    );
}