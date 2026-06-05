'use client';

import { Building2, Users, Search } from 'lucide-react';

export default function CoopsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-primary dark:text-white">Cooperatives</h1>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Join forces with others for collective buying power and shared resources</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
                <input 
                    type="text" 
                    placeholder="Search cooperatives..." 
                    className="w-full pl-12 pr-4 py-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400"
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
                    <div key={idx} className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl p-6 border border-border-primary dark:border-border-primary hover:border-teal-500 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-accent-500/15 dark:bg-accent-800 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-accent-400 dark:text-accent-400" />
                            </div>
                            <span className="px-2 py-1 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-ink-tertiary text-xs font-bold rounded-full">{coop.category}</span>
                        </div>
                        <h3 className="font-bold text-ink-primary dark:text-white mt-4">{coop.name}</h3>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-primary dark:border-border-primary">
                            <div className="flex items-center gap-1 text-ink-tertiary dark:text-ink-tertiary text-sm">
                                <Users className="w-4 h-4" />
                                {coop.members} members
                            </div>
                            <span className="text-accent-400 dark:text-accent-400 font-bold text-sm">Save {coop.savings}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Co-op CTA */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-ink-800 dark:to-ink-700 rounded-2xl p-6 border border-teal-100 dark:border-border-primary">
                <h3 className="font-bold text-ink-primary dark:text-white mb-2">Start a Cooperative</h3>
                <p className="text-sm text-ink-secondary dark:text-ink-tertiary mb-4">Gather neighbors, friends, or fellow entrepreneurs to unlock collective savings</p>
                <button className="px-6 py-3 bg-accent-500 text-white rounded-xl font-bold">Create Co-op</button>
            </div>
        </div>
    );
}