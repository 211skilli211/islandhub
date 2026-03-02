'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CREATE_OPTIONS = [
    {
        title: 'Launch Store',
        description: 'Open your business on the island. Perfect for restaurants, shops, and makers.',
        icon: '🏪',
        href: '/become-vendor',
        color: 'from-teal-400 to-teal-600',
        badge: 'Top Pick'
    },
    {
        title: 'Post Service',
        description: 'Offer your skills. From taxi rides and boat charters to cleaning and repairs.',
        icon: '🛠️',
        href: '/create?type=service',
        color: 'from-indigo-400 to-indigo-600'
    },
    {
        title: 'Start Campaign',
        description: 'Raise funds for a cause, project, or event. Connect with the community.',
        icon: '📣',
        href: '/campaigns/new',
        color: 'from-rose-400 to-rose-600'
    },
    {
        title: 'Add Product',
        description: 'Sell individual items, rentals, or unique island products.',
        icon: '📦',
        href: '/create?type=product',
        color: 'from-amber-400 to-amber-600'
    }
];

export default function StartHubPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4"
                    >
                        Start <span className="text-teal-600">Something</span> New
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto"
                    >
                        Whether you're opening a shop, offering a service, or raising funds, we've got you covered.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {CREATE_OPTIONS.map((option, idx) => (
                        <motion.div
                            key={option.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={option.href} className="block h-full group">
                                <div className="h-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-100 hover:-translate-y-2 transition-all relative overflow-hidden">
                                    {option.badge && (
                                        <div className="absolute top-6 right-6 px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {option.badge}
                                        </div>
                                    )}

                                    <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${option.color} flex items-center justify-center text-3xl mb-8 shadow-lg shadow-inherit group-hover:scale-110 transition-transform`}>
                                        {option.icon}
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">
                                        {option.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                        {option.description}
                                    </p>

                                    <div className="mt-auto flex items-center gap-2 text-teal-600 font-black uppercase tracking-widest text-[10px]">
                                        <span>Get Started</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-10 w-40 h-40 bg-teal-500 blur-[100px]" />
                        <div className="absolute bottom-0 right-10 w-40 h-40 bg-indigo-500 blur-[100px]" />
                    </div>

                    <h2 className="text-3xl font-black mb-4">Not sure where to begin?</h2>
                    <p className="text-slate-400 font-medium mb-8 max-w-xl mx-auto">Our support team is here to help you set up your store or launch your first campaign.</p>
                    <Link href="/contact" className="inline-block px-10 py-4 bg-teal-600 hover:bg-teal-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl shadow-teal-500/20">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
