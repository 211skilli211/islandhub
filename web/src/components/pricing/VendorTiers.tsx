'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Tier {
    id: string;
    name: string;
    price: number;
    period: 'month' | 'year';
    features: string[];
    highlighted?: boolean;
}

const vendorTiers: Tier[] = [
    {
        id: 'basic',
        name: 'Starter',
        price: 0,
        period: 'month',
        features: [
            'Basic store setup',
            'Up to 20 listings',
            'Standard support',
            'Basic analytics',
            'Mobile app access',
        ],
    },
    {
        id: 'pro',
        name: 'Professional',
        price: 49,
        period: 'month',
        features: [
            'Everything in Starter',
            'Unlimited listings',
            'Priority support',
            'Advanced analytics',
            'Custom domain',
            'Marketing tools',
            'API access',
            'Featured placement',
        ],
        highlighted: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        period: 'month',
        features: [
            'Everything in Professional',
            'Dedicated success manager',
            'White-label options',
            'Multi-store management',
            'Custom integration',
            'Lowest commission rates',
        ],
    },
];

export default function VendorTiers() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
            {vendorTiers.map((tier, idx) => (
                <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all ${tier.highlighted
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10'
                            : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'
                        }`}
                >
                    {tier.highlighted && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-500 text-white text-xs font-black uppercase tracking-widest rounded-full">
                            Most Popular
                        </span>
                    )}

                    <div className="mb-8">
                        <h3 className={`text-xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
                            {tier.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">${tier.price}</span>
                            <span className={`text-sm font-bold ${tier.highlighted ? 'text-slate-400' : 'text-slate-400'}`}>
                                /{tier.period}
                            </span>
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                                <span className={tier.highlighted ? 'text-teal-400' : 'text-teal-600'}>✓</span>
                                <span className={tier.highlighted ? 'text-slate-300' : 'text-slate-600'}>
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href={`/register?tier=${tier.id}`}
                        className={`block w-full py-4 rounded-xl font-black text-center transition-all ${tier.highlighted
                                ? 'bg-teal-500 hover:bg-teal-400 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                            }`}
                    >
                        Choose {tier.name}
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
