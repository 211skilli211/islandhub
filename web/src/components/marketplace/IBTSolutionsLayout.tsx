'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import ReviewSection from '@/components/ReviewSection';
import HeroBackground from '@/components/HeroBackground';
import { getImageUrl } from '@/lib/api';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface IBTStoreProps {
    store: any;
    listings: any[];
}

const COOP_SECTORS = [
    { id: 'trades', title: 'Trades & Construction', icon: '🔧', desc: 'Skilled workers, contractors, repair services', gradient: 'from-amber-500 to-orange-600' },
    { id: 'micro_farms', title: 'Micro-Farms', icon: '🌱', desc: 'Local agriculture, fresh produce, farm-to-table', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'graphic_trends', title: 'Graphic Trends', icon: '🎨', desc: 'Design, branding, digital art, print-on-demand', gradient: 'from-teal-500 to-teal-600' },
    { id: 'logistics', title: 'Logistics', icon: '🚚', desc: 'Delivery, transport, supply chain', gradient: 'from-blue-500 to-accent-400' },
];

const IBT_SERVICES = [
    { title: 'AI Digital Employees', slug: 'ai-digital-employees', price: '$5,000/mo', desc: 'AI-powered digital employees for your business', icon: '🤖' },
    { title: 'Web & App Design', slug: 'web-app-design', price: '$1,000-$3,000', desc: 'Custom websites and mobile applications', icon: '💻' },
    { title: 'Business Automation', slug: 'business-automation', price: 'Custom', desc: 'Streamline operations with automated workflows', icon: '⚙️' },
    { title: 'Graphic Design', slug: 'graphic-design', price: 'From $75', desc: 'Professional branding and design', icon: '🎨' },
    { title: 'Lead Generation', slug: 'lead-generation', price: 'Custom', desc: 'Data-driven lead generation strategies', icon: '📈' },
    { title: 'Business Audit', slug: 'business-audit', price: 'From $300', desc: 'Comprehensive business analysis', icon: '🔍' },
    { title: 'Consultation', slug: 'consultation', price: 'From $100', desc: 'Expert business and tech consultation', icon: '💡' },
];

export const IBTSolutionsLayout = ({ store, listings }: IBTStoreProps) => {
    const [coopMembers, setCoopMembers] = useState<any[]>([]);
    const [ibtServices, setIbtServices] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coopsRes, servicesRes] = await Promise.all([
                    api.get('/ibt/coops'),
                    api.get('/ibt/services'),
                ]);
                setCoopMembers(coopsRes.data || []);
                setIbtServices(servicesRes.data || []);
            } catch (e) {
                // Silently fail — API may not be deployed yet
            }
        };
        fetchData();
    }, []);

    const brandingColor = store?.branding_color || '#14b8a6';

    return (
        <div className="bg-surface-elevated min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-ink-primary">
                <HeroBackground pageKey="ibt-solutions">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto px-6"
                    >
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="text-4xl font-black text-accent-400">IBT</span>
                            <span className="text-2xl text-white/70">Solutions</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 italic uppercase tracking-tighter">
                            Caribbean Business <span className="text-accent-400">Solutions</span>
                        </h1>
                        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                            AI-powered tools, professional services, and a growing co-operative federation — everything your business needs to compete.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="#services" className="px-8 py-4 bg-accent-500 text-white rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-accent-500/100 transition-all">
                                Explore Services
                            </a>
                            <a href="#coops" className="px-8 py-4 bg-surface-elevated/10 text-white rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-surface-elevated/20 transition-all border border-white/20">
                                Join Co-ops
                            </a>
                        </div>
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {[
                                { label: 'API Requests', val: '50K+' },
                                { label: 'Projects', val: '100+' },
                                { label: 'Uptime', val: '99.9%' },
                                { label: 'Rating', val: '4.9/5' },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl text-center">
                                    <div className="text-xl font-black text-accent-400">{stat.val}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </HeroBackground>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 px-6 bg-surface-secondary">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-ink-primary tracking-tight italic uppercase mb-4">
                            Professional <span className="text-accent-400">Services</span>
                        </h2>
                        <p className="text-ink-tertiary text-lg max-w-2xl mx-auto">
                            From AI to web development — comprehensive solutions for modern Caribbean businesses.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(ibtServices.length > 0 ? ibtServices : IBT_SERVICES).map((service: any, i: number) => {
                            const icons: Record<string, string> = {
                                ai_employees: '🤖', web_design: '💻', automation: '⚙️',
                                api_integration: '🔌', coop_membership: '🤝', graphic_design: '🎨',
                                lead_generation: '📈', business_audit: '🔍', consultation: '💡',
                            };
                            const slug = service.slug || service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            const iconKey = service.service_type || '';
                            return (
                                <motion.div
                                    key={service.id || slug}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-surface-elevated rounded-2xl p-8 border border-border-primary hover:shadow-xl hover:-translate-y-1 transition-all group"
                                >
                                    <div className="text-4xl mb-4">{icons[iconKey] || service.icon || '📦'}</div>
                                    <h3 className="text-xl font-black text-ink-primary mb-2 group-hover:text-accent-400 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-accent-400 font-bold text-sm mb-3">
                                        {service.price ? (typeof service.price === 'string' && service.price.startsWith('$') ? service.price : `$${Number(service.price).toLocaleString()}${service.metadata?.pricing_model === 'monthly' ? '/mo' : ''}`) : 'Contact for pricing'}
                                    </p>
                                    <p className="text-ink-tertiary text-sm leading-relaxed mb-6">{service.description}</p>
                                    <Link
                                        href={`/store/ibt-solutions/services/${slug}`}
                                        className="inline-flex items-center gap-2 text-accent-400 font-bold text-sm hover:gap-3 transition-all"
                                    >
                                        Learn More →
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Co-ops Section */}
            <section id="coops" className="py-24 px-6 bg-surface-elevated">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-ink-primary tracking-tight italic uppercase mb-4">
                            IBT Co-operative <span className="text-accent-400">Federation</span>
                        </h2>
                        <p className="text-ink-tertiary text-lg max-w-2xl mx-auto">
                            Join a community of small businesses, skilled workers, and entrepreneurs united in democratically-governed cooperatives.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {COOP_SECTORS.map((sector, i) => (
                            <motion.div
                                key={sector.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group"
                            >
                                <Link href={`/store/ibt-solutions/coops/${sector.id}`} className="block h-full">
                                    <div className={`relative h-full rounded-2xl overflow-hidden bg-gradient-to-br ${sector.gradient} p-8 text-white`}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-elevated/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                        <div className="relative z-10">
                                            <div className="text-5xl mb-4">{sector.icon}</div>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{sector.title}</h3>
                                            <p className="text-white/70 text-sm leading-relaxed">{sector.desc}</p>
                                            <div className="mt-6 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                                                View Members →
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/store/ibt-solutions/coops/apply"
                            className="inline-block px-8 py-4 bg-ink-primary text-white rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-surface-tertiary transition-all"
                        >
                            Apply to Join a Co-op
                        </Link>
                    </div>
                </div>
            </section>

            {/* Listings Section (if any exist in DB) */}
            {listings && listings.length > 0 && (
                <section className="py-24 px-6 bg-surface-secondary">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-black text-ink-primary mb-12 italic uppercase">
                            Featured <span className="text-accent-400">Listings</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {listings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-ink-primary rounded-3xl p-12 md:p-20 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-500 rounded-full blur-[120px] -translate-y-1/2" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 italic uppercase tracking-tighter">
                            Ready to <span className="text-accent-400">Transform</span> Your Business?
                        </h2>
                        <p className="text-ink-tertiary text-lg mb-10 max-w-2xl mx-auto">
                            Let's discuss how IBT Solutions can help your Caribbean business grow.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact" className="px-8 py-4 bg-accent-500 text-white rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-accent-500/100 transition-all">
                                Book Consultation
                            </Link>
                            <a href="https://bquikr-solutions.onrender.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-surface-elevated/10 text-white rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-surface-elevated/20 transition-all border border-white/20">
                                Visit IBT Solutions
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section className="py-16 px-6 bg-surface-secondary">
                <div className="max-w-4xl mx-auto">
                    <ReviewSection vendorId={String(store?.id || store?.user_id)} />
                </div>
            </section>
        </div>
    );
};
