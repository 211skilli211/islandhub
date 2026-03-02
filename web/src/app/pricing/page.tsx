'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const VENDOR_TIERS = [
    {
        name: 'Basic',
        id: 'basic_product',
        price: '29',
        commission: '5%',
        listings: '10',
        stores: '1',
        features: ['Standard Storefront', 'Local Discovery', 'Community Reviews'],
        color: 'slate',
        buttonText: 'Start for Free*',
        link: '/become-vendor'
    },
    {
        name: 'Premium',
        id: 'premium_product',
        price: '99',
        commission: '3%',
        listings: '50',
        stores: '3',
        features: ['Custom Branding', 'Advanced Analytics', 'Priority Support', 'Featured Search Results'],
        color: 'teal',
        recommended: true,
        buttonText: 'Go Premium',
        link: '/become-vendor?tier=premium'
    },
    {
        name: 'Enterprise',
        id: 'enterprise_product',
        price: '299',
        commission: '2%',
        listings: 'Unlimited',
        stores: 'Unlimited',
        features: ['Dedicated Account Manager', 'API Access', 'Automated Payouts', 'Verified Badge'],
        color: 'indigo',
        buttonText: 'Scale Up',
        link: '/become-vendor?tier=enterprise'
    }
];

const CUSTOMER_TIERS = [
    {
        name: 'General',
        price: '0',
        discount: '0%',
        multiplier: '1x',
        features: ['Full Marketplace Access', 'Standard Rewards'],
        color: 'slate'
    },
    {
        name: 'Island VIP',
        price: '15',
        discount: '10%',
        multiplier: '2x',
        features: ['10% OFF Every Order', 'Double Reward Points', 'Early Access to Deals', 'VIP Support'],
        color: 'amber',
        recommended: true,
        buttonText: 'Join VIP',
        link: '/login?redirect=/pricing'
    }
];

const CREATOR_TIERS = [
    {
        name: 'Individual',
        price: '0',
        fee: '5%',
        limit: '3',
        features: ['Public Campaigns', 'Standard Reporting'],
        color: 'slate'
    },
    {
        name: 'Organization',
        price: '49',
        fee: '3%',
        limit: '10',
        features: ['Advanced Analytics', 'Team Access', 'Promoted Campaigns'],
        color: 'teal'
    },
    {
        name: 'Nonprofit',
        price: 'Custom',
        fee: '0%',
        limit: 'Unlimited',
        features: ['Zero Platform Fees', 'Verification Badge', 'Community Spotlight'],
        color: 'emerald',
        buttonText: 'Verify Status',
        link: '/contact'
    }
];

export default function PricingPage() {
    const [activeRole, setActiveRole] = useState<'vendor' | 'customer' | 'creator'>('vendor');

    return (
        <main className="min-h-screen bg-slate-50">

            {/* Hero Section */}
            <section className="bg-teal-950 py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight italic"
                    >
                        Choose Your <span className="text-teal-400">Island Tier</span>
                    </motion.h1>
                    <p className="text-teal-50/70 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Whether you're selling local artisans, shopping for the best deals, or raising funds for a cause, we have a plan to empower your journey.
                    </p>
                </div>
            </section>

            {/* Role Switcher */}
            <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-teal-900/10 flex flex-col md:flex-row gap-2">
                    {[
                        { id: 'vendor', label: 'Sell & Rent', icon: '🛍️' },
                        { id: 'customer', label: 'Shop & Save', icon: '✨' },
                        { id: 'creator', label: 'Raise Funds', icon: '❤️' }
                    ].map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id as any)}
                            className={`flex-1 py-6 rounded-[1.8rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${activeRole === role.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-100 scale-[1.02]' : 'bg-transparent text-slate-400 hover:bg-slate-50'}`}
                        >
                            <span className="text-xl">{role.icon}</span>
                            {role.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Pricing Grid */}
            <section className="max-w-7xl mx-auto px-4 py-24">
                <motion.div
                    key={activeRole}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {(activeRole === 'vendor' ? VENDOR_TIERS : activeRole === 'customer' ? CUSTOMER_TIERS : CREATOR_TIERS).map((tier: any, idx) => (
                        <div
                            key={tier.name}
                            className={`p-10 rounded-[3rem] border-4 transition-all relative overflow-hidden flex flex-col ${tier.recommended ? 'bg-white border-teal-500 shadow-3xl scale-105 z-10 ring-8 ring-teal-500/5' : 'bg-white/50 border-slate-100'}`}
                        >
                            {tier.recommended && (
                                <div className="absolute top-0 right-0 bg-teal-500 px-8 py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-bl-3xl">Best Value</div>
                            )}

                            <h3 className="text-2xl font-black text-slate-900 mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className={`text-5xl font-black ${tier.color === 'amber' ? 'text-amber-500' : tier.color === 'indigo' ? 'text-indigo-600' : 'text-teal-600'}`}>
                                    {tier.price !== 'Custom' ? `$${tier.price}` : tier.price}
                                </span>
                                {tier.price !== 'Custom' && tier.price !== '0' && (
                                    <span className="text-slate-400 text-sm font-bold"> /mo</span>
                                )}
                            </div>

                            <div className="space-y-6 mb-12 flex-1">
                                {activeRole === 'vendor' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Commission</p>
                                            <p className="font-black text-slate-900">{tier.commission}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Listings</p>
                                            <p className="font-black text-slate-900">{tier.listings}</p>
                                        </div>
                                    </div>
                                )}

                                {activeRole === 'customer' && tier.discount !== '0%' && (
                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                        <p className="text-amber-900 font-black flex items-center gap-2">
                                            <span>🎁</span> {tier.discount} Discount on All Orders
                                        </p>
                                    </div>
                                )}

                                <ul className="space-y-4">
                                    {tier.features.map((f: string) => (
                                        <li key={f} className="flex items-center gap-3 text-slate-600 font-medium">
                                            <span className={`text-${tier.color}-500`}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={tier.link || '/register'}
                                className={`w-full py-6 rounded-2xl font-black text-center transition-all ${tier.recommended ? 'bg-teal-600 text-white shadow-2xl shadow-teal-100 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {tier.buttonText || 'Get Started'}
                            </Link>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Comparison Table Section */}
            <section className="max-w-5xl mx-auto px-4 py-24 border-t border-slate-200">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight italic">Compare All Features</h2>
                    <p className="text-slate-500 font-medium">Deep dive into exactly what each tier offers.</p>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-8 font-black text-xs uppercase tracking-widest text-slate-400">Feature</th>
                                <th className="p-8 font-black text-sm text-slate-900 text-center">Basic</th>
                                <th className="p-8 font-black text-sm text-teal-600 text-center">Premium</th>
                                <th className="p-8 font-black text-sm text-indigo-600 text-center">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { name: 'Stores per User', basic: '1', premium: '3', enterprise: 'Unlimited' },
                                { name: 'Analytics Dashboard', basic: 'Basic', premium: 'Advanced', enterprise: 'Enterprise' },
                                { name: 'Sales Commission', basic: '5.0%', premium: '3.0%', enterprise: '2.0%' },
                                { name: 'API Support', basic: '❌', premium: '❌', enterprise: '✅' },
                                { name: 'Featured Listings', basic: '❌', premium: '2 / week', enterprise: '10 / week' },
                                { name: 'Support Tier', basic: 'Email', premium: 'Priority', enterprise: '24/7 Dedicated' }
                            ].map((row) => (
                                <tr key={row.name} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="p-8 font-bold text-slate-700">{row.name}</td>
                                    <td className="p-8 text-center text-slate-500 font-medium">{row.basic}</td>
                                    <td className="p-8 text-center text-teal-700 font-bold">{row.premium}</td>
                                    <td className="p-8 text-center text-indigo-700 font-black">{row.enterprise}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="bg-teal-600 py-24 text-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Have more questions?</h2>
                <p className="text-teal-50 text-xl font-medium mb-12 max-w-2xl mx-auto opacity-90">
                    Our team is here to help you choose the right path for your island journey.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/contact" className="px-12 py-5 bg-white text-teal-900 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
                        Talk to Sales
                    </Link>
                    <Link href="/how-it-works" className="px-12 py-5 bg-teal-800 text-white rounded-2xl font-black text-lg hover:bg-teal-900 transition-all border border-teal-500/30">
                        Read FAQ
                    </Link>
                </div>
            </section>
        </main>
    );
}
