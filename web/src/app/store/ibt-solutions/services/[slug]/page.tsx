'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const FALLBACK_SERVICES: Record<string, any> = {
    'ai-digital-employees': { title: 'AI Digital Employees', description: 'AI-powered digital employees that handle customer service, data entry, scheduling, and more — 24/7 availability with human-like interaction.', price: 5000, metadata: { pricing_model: 'monthly', features: ['24/7 Availability', 'Natural Language Processing', 'Custom Training', 'API Integration', 'Multi-language Support'] } },
    'web-app-design': { title: 'Web & App Design', description: 'Custom websites and mobile applications built for Caribbean businesses. From e-commerce to booking systems, we create digital experiences that convert.', price: 2000, metadata: { features: ['Responsive Design', 'SEO Optimized', 'CMS Integration', 'Payment Gateway', 'Analytics Dashboard'] } },
    'business-automation': { title: 'Business Automation', description: 'Streamline your operations with automated workflows. Reduce manual tasks, eliminate errors, and free up your team to focus on growth.', price: null, metadata: { features: ['Workflow Design', 'System Integration', 'Process Documentation', 'Training & Support'] } },
    'graphic-design': { title: 'Graphic Design', description: 'Professional branding and design services including logos, marketing materials, social media graphics, and print-on-demand products.', price: 75, metadata: { features: ['Logo Design', 'Brand Guidelines', 'Social Media Kit', 'Print Materials'] } },
    'lead-generation': { title: 'Lead Generation', description: 'Data-driven lead generation strategies to help your Caribbean business find and convert qualified prospects.', price: null, metadata: { features: ['Targeted Campaigns', 'CRM Integration', 'Analytics & Reporting', 'A/B Testing'] } },
    'business-audit': { title: 'Business Audit', description: 'Comprehensive business analysis covering operations, technology, marketing, and financial efficiency. Get actionable insights to grow.', price: 300, metadata: { features: ['Operations Review', 'Tech Stack Assessment', 'Market Analysis', 'Action Plan'] } },
    'consultation': { title: 'Consultation', description: 'Expert business and tech consultation to help you make the right decisions for your Caribbean business.', price: 100, metadata: { features: ['1-on-1 Session', 'Strategic Planning', 'Tech Recommendations', 'Follow-up Report'] } },
};

export default function IBTServiceDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [inquirySent, setInquirySent] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        name: '', email: '', phone: '', company: '', message: '', budget_range: ''
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await api.get('/ibt/services');
                const services = res.data || [];
                const found = services.find((s: any) => s.slug === slug);
                if (found) {
                    setService(found);
                } else {
                    setError(true);
                }
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchService();
    }, [slug]);

    const handleSubmitInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/ibt/inquiry', {
                ...inquiryForm,
                service_type: service?.service_type || slug,
            });
            setInquirySent(true);
        } catch (err) {
            console.error('Failed to submit inquiry:', err);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (error || !service) {
        return (
            <main className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <EmojiIcon emoji="😕" size={48} className="text-6xl mb-4" />
                    <h1 className="text-2xl font-black text-ink-primary mb-2">Service not found</h1>
                    <Link href="/store/ibt-solutions" className="text-accent-400 font-bold hover:underline">
                        ← Back to IBT Solutions
                    </Link>
                </div>
            </main>
        );
    }

    const icons: Record<string, string> = {
        ai_employees: '🤖', web_design: '💻', automation: '⚙️',
        api_integration: '🔌', coop_membership: '🤝',
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            
            <section className="bg-surface-tertiary py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/store/ibt-solutions" className="inline-flex items-center gap-2 text-accent-400 text-sm font-bold mb-6 hover:gap-3 transition-all">
                        ← Back to IBT Solutions
                    </Link>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-5xl mb-4">{icons[service.service_type] || '📦'}</div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
                            {service.title}
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl">{service.description}</p>
                        {service.price && (
                            <div className="mt-6 inline-block px-6 py-3 bg-accent-500/20 text-accent-400 rounded-2xl font-black text-xl">
                                ${Number(service.price).toLocaleString()}{service.metadata?.pricing_model === 'monthly' ? '/mo' : ''}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-8">
                        
                        {service.metadata?.features && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="bg-surface-elevated rounded-2xl border border-border-primary p-8">
                                <h2 className="text-xl font-black text-ink-primary mb-6 italic uppercase">What&apos;s Included</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {service.metadata.features.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-surface-primary rounded-xl">
                                            <EmojiIcon emoji="✓" size={16} className="w-6 h-6 rounded-full bg-accent-500/15 text-accent-400 flex items-center justify-center text-xs font-bold" />
                                            <span className="text-sm font-medium text-ink-secondary">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-surface-elevated rounded-2xl border border-border-primary p-8">
                            <h2 className="text-xl font-black text-ink-primary mb-4 italic uppercase">About This Service</h2>
                            <p className="text-ink-secondary leading-relaxed">{service.description}</p>
                        </motion.div>
                    </div>

                    
                    <div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-surface-elevated rounded-2xl border border-border-primary p-6 sticky top-6">
                            <h3 className="text-lg font-black text-ink-primary mb-4">Request a Quote</h3>

                            {inquirySent ? (
                                <div className="text-center py-8">
                                    <EmojiIcon emoji="✅" size={40} className="text-4xl mb-4" />
                                    <h4 className="text-lg font-black text-ink-primary mb-2">Inquiry Sent!</h4>
                                    <p className="text-ink-tertiary text-sm">We&apos;ll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                                    <input
                                        type="text" placeholder="Your Name *" required
                                        value={inquiryForm.name} onChange={e => setInquiryForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:border-teal-500"
                                    />
                                    <input
                                        type="email" placeholder="Email *" required
                                        value={inquiryForm.email} onChange={e => setInquiryForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:border-teal-500"
                                    />
                                    <input
                                        type="tel" placeholder="Phone"
                                        value={inquiryForm.phone} onChange={e => setInquiryForm(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:border-teal-500"
                                    />
                                    <input
                                        type="text" placeholder="Company"
                                        value={inquiryForm.company} onChange={e => setInquiryForm(p => ({ ...p, company: e.target.value }))}
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:border-teal-500"
                                    />
                                    <select
                                        value={inquiryForm.budget_range} onChange={e => setInquiryForm(p => ({ ...p, budget_range: e.target.value }))}
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="">Budget Range</option>
                                        <option value="< $1,000">Under $1,000</option>
                                        <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                                        <option value="$10,000+">$10,000+</option>
                                    </select>
                                    <textarea
                                        placeholder="Tell us about your project..."
                                        rows={4}
                                        value={inquiryForm.message} onChange={e => setInquiryForm(p => ({ ...p, message: e.target.value }))}
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:border-teal-500 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-6 py-4 bg-accent-500 text-white rounded-xl font-bold text-sm hover:bg-accent-600 transition-colors"
                                    >
                                        Send Inquiry
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
