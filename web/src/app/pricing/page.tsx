'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const VENDOR_TIERS = [
    {
        name: 'Basic',
        id: 'basic_product',
        price: '29',
        commission: '5%',
        listings: '10',
        stores: '1',
        sensoryTagline: 'Just getting started? Dip your toes in.',
        sensoryDesc: 'Perfect for side-hustlers testing the waters with a handful of products.',
        features: ['Standard Storefront', 'Local Discovery', 'Community Reviews'],
        color: 'slate',
        buttonText: 'Start — $29/mo',
        link: '/become-vendor'
    },
    {
        name: 'Premium',
        id: 'premium_product',
        price: '99',
        commission: '3%',
        listings: '50',
        stores: '3',
        sensoryTagline: 'Ready to ride the wave?',
        sensoryDesc: 'For growing businesses hungry for branding, analytics, and serious reach.',
        features: ['Custom Branding', 'Advanced Analytics', 'Priority Support', 'Featured Search Results'],
        color: 'teal',
        recommended: true,
        buttonText: 'Start — $99/mo',
        link: '/become-vendor?tier=premium'
    },
    {
        name: 'Enterprise',
        id: 'enterprise_product',
        price: '299',
        commission: '2%',
        listings: 'Unlimited',
        stores: 'Unlimited',
        sensoryTagline: 'Built for island-scale empires.',
        sensoryDesc: 'Unlimited everything. Full API access. A dedicated team in your corner.',
        features: ['Dedicated Account Manager', 'API Access', 'Automated Payouts', 'Verified Badge'],
        color: 'indigo',
        buttonText: 'Start — $299/mo',
        link: '/become-vendor?tier=enterprise'
    }
];

const CUSTOMER_TIERS = [
    {
        name: 'General',
        price: '0',
        discount: '0%',
        multiplier: '1x',
        sensoryTagline: 'Browse freely. No strings attached.',
        features: ['Full Marketplace Access', 'Standard Rewards'],
        color: 'slate',
        buttonText: 'Start — Free',
        link: '/register'
    },
    {
        name: 'Island VIP',
        price: '15',
        discount: '10%',
        multiplier: '2x',
        sensoryTagline: 'Feel the VIP breeze.',
        sensoryDesc: 'Unlock exclusive deals, faster rewards, and the inside track on island drops.',
        features: ['10% OFF Every Order', 'Double Reward Points', 'Early Access to Deals', 'VIP Support'],
        color: 'amber',
        recommended: true,
        buttonText: 'Start — $15/mo',
        link: '/login?redirect=/pricing'
    }
];

const CREATOR_TIERS = [
    {
        name: 'Individual',
        price: '0',
        fee: '5%',
        limit: '3',
        sensoryTagline: 'Spark a cause. Share your story.',
        features: ['Public Campaigns', 'Standard Reporting'],
        color: 'slate',
        buttonText: 'Start — Free',
        link: '/register'
    },
    {
        name: 'Organization',
        price: '49',
        fee: '3%',
        limit: '10',
        sensoryTagline: 'Amplify your impact.',
        sensoryDesc: 'Team tools, promoted campaigns, and analytics that move the needle.',
        features: ['Advanced Analytics', 'Team Access', 'Promoted Campaigns'],
        color: 'teal',
        buttonText: 'Start — $49/mo',
        link: '/register'
    },
    {
        name: 'Nonprofit',
        price: 'Custom',
        fee: '0%',
        limit: 'Unlimited',
        sensoryTagline: 'Zero fees. Maximum impact.',
        features: ['Zero Platform Fees', 'Verification Badge', 'Community Spotlight'],
        color: 'emerald',
        buttonText: 'Verify Status — $0',
        link: '/contact'
    }
];

export default function PricingPage() {
    const [activeRole, setActiveRole] = useState<'vendor' | 'customer' | 'creator'>('vendor');

    return (
        <main className="min-h-screen bg-surface-primary">

            
            <section className="bg-teal-950 py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/100/10 rounded-full blur-[100px]" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight italic"
                    >
                        Choose Your <span className="text-accent-400">Island Tier</span>
                    </motion.h1>
                    <p className="text-accent-50/70 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Whether you're selling handcrafted treasures, hunting for the best island deals, or rallying support for a cause — the right plan is waiting for you.
                    </p>
                </div>
            </section>

            
            <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-surface-elevated p-2 rounded-[2rem] shadow-2xl shadow-teal-900/10 flex flex-col md:flex-row gap-2">
                    {[
                        { id: 'vendor', label: 'Sell & Rent', icon: '🛍️' },
                        { id: 'customer', label: 'Shop & Save', icon: '✨' },
                        { id: 'creator', label: 'Raise Funds', icon: '❤️' }
                    ].map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id)}
                            className={`flex-1 py-6 rounded-[1.8rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${activeRole === role.id ? 'bg-accent-500 text-white shadow-xl shadow-accent-500/10 scale-[1.02]' : 'bg-transparent text-ink-tertiary hover:bg-surface-primary'}`}
                        >
                            <span className="text-xl">{role.icon}</span>
                            {role.label}
                        </button>
                    ))}
                </div>
            </section>

            
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
                            className={`p-10 rounded-[3rem] border-4 transition-all relative overflow-hidden flex flex-col ${tier.recommended ? 'bg-surface-elevated border-teal-500 shadow-3xl scale-105 z-10 ring-8 ring-teal-500/5' : 'bg-surface-elevated/50 border-border-primary'}`}
                        >
                            {tier.recommended && (
                                <div className="absolute top-0 right-0 bg-accent-500/100 px-8 py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-bl-3xl">Best Value</div>
                            )}

                            <h3 className="text-2xl font-black text-ink-primary mb-1">{tier.name}</h3>
                            {tier.sensoryTagline && (
                                <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-4">{tier.sensoryTagline}</p>
                            )}
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-5xl font-black ${tier.color === 'amber' ? 'text-sand-500' : tier.color === 'indigo' ? 'text-[#14b8a6]' : 'text-accent-400'}`}>
                                    {tier.price !== 'Custom' ? `$${tier.price}` : tier.price}
                                </span>
                                {tier.price !== 'Custom' && tier.price !== '0' && (
                                    <span className="text-ink-tertiary text-sm font-bold"> /mo</span>
                                )}
                            </div>
                            {tier.sensoryDesc && (
                                <p className="text-sm text-ink-tertiary font-medium italic mb-6">{tier.sensoryDesc}</p>
                            )}

                            <div className="space-y-6 mb-12 flex-1">
                                {activeRole === 'vendor' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-surface-primary p-4 rounded-2xl border border-border-primary">
                                            <p className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest mb-1">Commission</p>
                                            <p className="font-black text-ink-primary">{tier.commission}</p>
                                        </div>
                                        <div className="bg-surface-primary p-4 rounded-2xl border border-border-primary">
                                            <p className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest mb-1">Listings</p>
                                            <p className="font-black text-ink-primary">{tier.listings}</p>
                                        </div>
                                    </div>
                                )}

                                {activeRole === 'customer' && tier.discount !== '0%' && (
                                    <div className="bg-sand-500/5 p-6 rounded-2xl border border-sand-500/20">
                                        <p className="text-sand-700 font-black flex items-center gap-2">
                                            <EmojiIcon emoji="🎁" size={16} /> {tier.discount} Discount on All Orders
                                        </p>
                                    </div>
                                )}

                                <ul className="space-y-4">
                                    {tier.features.map((f: string) => (
                                        <li key={f} className="flex items-center gap-3 text-ink-secondary font-medium">
                                            <EmojiIcon emoji="✓" size={16} /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={tier.link || '/register'}
                                className={`w-full py-6 rounded-2xl font-black text-center transition-all ${tier.recommended ? 'bg-accent-500 text-white shadow-2xl shadow-accent-500/10 hover:scale-105 active:scale-95' : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'}`}
                            >
                                {tier.buttonText || 'Get Started'}
                            </Link>
                        </div>
                    ))}
                </motion.div>
            </section>

            
            <section className="max-w-5xl mx-auto px-4 py-24 border-t border-border-primary">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-ink-primary mb-4 tracking-tight italic">Compare All Features</h2>
                    <p className="text-ink-tertiary font-medium">Deep dive into exactly what each tier offers.</p>
                </div>

                <div className="bg-surface-elevated rounded-[3rem] shadow-2xl shadow-black/10 overflow-hidden border border-border-primary">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-primary/50">
                                <th className="p-8 font-black text-xs uppercase tracking-widest text-ink-tertiary">Feature</th>
                                <th className="p-8 font-black text-sm text-ink-primary text-center">Basic</th>
                                <th className="p-8 font-black text-sm text-accent-400 text-center">Premium</th>
                                <th className="p-8 font-black text-sm text-[#14b8a6] text-center">Enterprise</th>
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
                                <tr key={row.name} className="hover:bg-surface-primary/30 transition-colors">
                                    <td className="p-8 font-bold text-ink-secondary">{row.name}</td>
                                    <td className="p-8 text-center text-ink-tertiary font-medium">{row.basic}</td>
                                    <td className="p-8 text-center text-accent-500 font-bold">{row.premium}</td>
                                    <td className="p-8 text-center text-[#14b8a6] font-black">{row.enterprise}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            
            <section className="bg-accent-500 py-24 text-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Have more questions?</h2>
                <p className="text-accent-50 text-xl font-medium mb-12 max-w-2xl mx-auto opacity-90">
                    Our team is here to help you choose the right path for your island journey.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/contact" className="px-12 py-5 bg-surface-elevated text-accent-700 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
                        Talk to Sales
                    </Link>
                    <Link href="/how-it-works" className="px-12 py-5 bg-accent-700 text-white rounded-2xl font-black text-lg hover:bg-accent-800 transition-all border border-teal-500/30">
                        Read FAQ
                    </Link>
                </div>
            </section>
        </main>
    );
}
