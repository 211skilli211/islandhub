'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
    { 
        icon: '🔍', 
        title: 'Browse & Discover', 
        desc: 'Explore products, rentals, services, and campaigns from verified island vendors. Use filters to find exactly what you need.',
        details: ['Search by location, category, price', 'Read reviews from real buyers', 'Save favorites for later']
    },
    { 
        icon: '📦', 
        title: 'Connect & Purchase', 
        desc: 'Add items to cart or donate directly to campaigns. Choose your preferred payment method.',
        details: ['Secure checkout with Stripe/PayPal', 'Mobile money via WiPay', 'Support causes you care about']
    },
    { 
        icon: '🚚', 
        title: 'Receive & Enjoy', 
        desc: 'Track your orders in real-time. Get updates at every step from purchase to delivery.',
        details: ['Real-time tracking', 'Delivery notifications', '14-day buyer protection']
    },
    { 
        icon: '⭐', 
        title: 'Review & Repeat', 
        desc: 'Share your experience to help the community. Earn rewards points on every purchase.',
        details: ['Earn 1 point per $1 spent', 'Unlock VIP benefits', 'Refer friends for bonuses']
    }
];

const roles = [
    { id: 'buyer', label: 'As a Buyer', icon: '🛒' },
    { id: 'vendor', label: 'As a Vendor', icon: '🛍️' },
    { id: 'donor', label: 'As a Donor', icon: '❤️' }
];

export default function HowItWorksPage() {
    const [activeRole, setActiveRole] = useState('buyer');

    const roleFlows = {
        buyer: [
            { step: 1, title: 'Create Account', desc: 'Sign up for free and verify your email' },
            { step: 2, title: 'Browse', desc: 'Explore thousands of local listings' },
            { step: 3, title: 'Purchase', desc: 'Checkout securely with your preferred method' },
            { step: 4, title: 'Receive', desc: 'Track delivery and leave a review' }
        ],
        vendor: [
            { step: 1, title: 'Register', desc: 'Sign up and complete your profile' },
            { step: 2, title: 'Setup Store', desc: 'Add listings, photos, and details' },
            { step: 3, title: 'Connect Payments', desc: 'Link Stripe, PayPal, or WiPay' },
            { step: 4, title: 'Start Selling', desc: 'Publish listings and grow your business' }
        ],
        donor: [
            { step: 1, title: 'Find Causes', desc: 'Browse active campaigns' },
            { step: 2, title: 'Donate', desc: 'Choose amount and payment method' },
            { step: 3, title: 'Track Impact', desc: 'Follow campaign progress' },
            { step: 4, title: 'Share', desc: 'Help spread the word' }
        ]
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 py-32 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10">
                        Simple & Secure
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
                        How IslandHub <span className="text-teal-400">Works</span>
                    </h1>
                    <p className="text-xl text-teal-50/80 max-w-2xl mx-auto leading-relaxed">
                        The simplest way to buy, sell, rent, and fundraise in the Caribbean. 
                        Get started in minutes.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group"
                        >
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                                    {idx + 1}
                                </div>
                                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">{step.desc}</p>
                                <ul className="space-y-2">
                                    {step.details.map((d, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" /> {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Role-based Flow */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 text-center">Choose Your Journey</h2>
                    
                    {/* Role Switcher */}
                    <div className="flex justify-center gap-4 mb-16">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setActiveRole(role.id)}
                                className={`px-8 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 ${
                                    activeRole === role.id 
                                        ? 'bg-teal-600 text-white shadow-xl shadow-teal-100' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <span className="text-xl">{role.icon}</span>
                                {role.label}
                            </button>
                        ))}
                    </div>

                    {/* Flow */}
                    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        {roleFlows[activeRole as keyof typeof roleFlows].map((item, idx) => (
                            <div key={idx} className="flex-1 flex md:flex-col items-center gap-4 md:gap-0">
                                <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-2xl font-black text-teal-600 shrink-0">
                                    {item.step}
                                </div>
                                <div className="text-center md:text-center">
                                    <h4 className="font-black text-slate-900">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                                {idx < 3 && (
                                    <div className="hidden md:block text-3xl text-slate-200">→</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Signals */}
            <section className="bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-black text-slate-900 mb-12">Trusted by Thousands</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: '💳', name: 'Stripe', desc: 'Secure Payments' },
                            { icon: '🏦', name: 'WiPay', desc: 'Caribbean Mobile Money' },
                            { icon: '🛡️', name: 'Verified', desc: 'Vendor Trust' },
                            { icon: '🔒', name: '256-bit', desc: 'SSL Encryption' }
                        ].map((trust, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100">
                                <span className="text-4xl mb-4 block">{trust.icon}</span>
                                <p className="font-black text-slate-900">{trust.name}</p>
                                <p className="text-xs text-slate-400 mt-1">{trust.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-teal-600 to-emerald-600 py-24 text-center text-white">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to get started?</h2>
                    <p className="text-teal-50 text-lg mb-10 leading-relaxed">
                        Join thousands of islanders already buying, selling, and growing together.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="px-12 py-5 bg-white text-teal-900 rounded-2xl font-black text-lg hover:shadow-xl transition-all hover:scale-105">
                            Join Free
                        </Link>
                        <Link href="/pricing" className="px-12 py-5 bg-teal-800 text-white rounded-2xl font-black text-lg hover:bg-teal-900 transition-all border border-teal-500/30">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
