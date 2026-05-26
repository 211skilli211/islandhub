'use client';

import Link from 'next/link';

interface Silo {
    id: string;
    title: string;
    icon: string;
    href: string;
}

interface SiloSubNavProps {
    current: string;
    silos: Silo[];
}

export default function SiloSubNav({ current, silos }: SiloSubNavProps) {
    return (
        <div className="sticky top-0 z-40 bg-surface-elevated/95 backdrop-blur-xl border-b border-border-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3">
                    <Link href="/rental-hub" className="text-ink-primary font-black text-sm tracking-tight hover:text-accent-400 transition-colors">
                        ← Rental Hub
                    </Link>
                    <div className="flex items-center gap-1 md:gap-2">
                        {silos.map((s) => (
                            <Link
                                key={s.id}
                                href={s.href}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                    s.id === current
                                        ? 'bg-accent-400 text-brand-950'
                                        : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-tertiary'
                                }`}
                            >
                                <span className="hidden md:inline">{s.icon} </span>
                                {s.title.split(' ')[0]}
                            </Link>
                        ))}
                    </div>
                    <Link
                        href="/listings?category=rental"
                        className="px-4 py-1.5 bg-accent-400/10 text-accent-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-400/20 transition-all"
                    >
                        All Rentals
                    </Link>
                </div>
            </div>
        </div>
    );
}
