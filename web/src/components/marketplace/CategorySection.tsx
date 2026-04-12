'use client';

import ListingCard from '../ListingCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CategorySectionProps {
    id: string;
    title: string;
    icon: string;
    listings: any[];
    loading: boolean;
    viewAllHref: string;
}

export default function CategorySection({ id, title, icon, listings, loading, viewAllHref }: CategorySectionProps) {
    if (!loading && listings.length === 0) return null;

    return (
        <section id={id} className="py-20 border-b border-slate-100 last:border-0 scroll-mt-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <span className="text-4xl">{icon}</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 font-medium max-w-xl"
                    >
                        Handpicked featured {title.toLowerCase()} from our verified local vendors.
                        Support the island economy by choosing local.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <Link
                        href={viewAllHref}
                        className="px-8 py-4 bg-white border-2 border-slate-100 hover:border-teal-500 hover:text-teal-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-sm"
                    >
                        Explore All {title} <span>→</span>
                    </Link>
                </motion.div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[400px] bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.slice(0, 3).map((listing, index) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ListingCard listing={listing} />
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}
