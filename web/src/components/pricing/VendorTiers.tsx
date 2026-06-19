'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

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
                            ? 'bg-ink-primary text-white border-border-primary shadow-2xl scale-105 z-10'
                            : 'bg-surface-elevated text-ink-primary border-border-primary hover:border-border-primary'
                        }`}
                >
                    {tier.highlighted && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500/100 text-white text-xs font-black uppercase tracking-widest rounded-full">
                            Most Popular
                        </span>
                    )}

                    <div className="mb-8">
                        <h3 className={`text-xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-ink-primary'}`}>
                            {tier.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">${tier.price}</span>
                            <span className={`text-sm font-bold ${tier.highlighted ? 'text-ink-tertiary' : 'text-ink-tertiary'}`}>
                                /{tier.period}
                            </span>
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                                <EmojiIcon emoji="✓" size={16} />
                                <span className={tier.highlighted ? 'text-ink-tertiary' : 'text-ink-secondary'}>
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href={`/register?tier=${tier.id}`}
                        className={`block w-full py-4 rounded-xl font-black text-center transition-all ${tier.highlighted
                                ? 'bg-accent-500/100 hover:bg-accent-400 text-white'
                                : 'bg-surface-secondary hover:bg-surface-tertiary text-ink-primary'
                            }`}
                    >
                        Choose {tier.name}
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
