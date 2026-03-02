'use client';

import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/api';

interface Sponsor {
    id: number;
    name: string;
    description: string;
    media_url: string;
    media_type: 'image' | 'video';
    cta_link: string;
    cta_text: string;
    color_theme: string;
}

// Mock sponsors will be replaced with real API data
const mockSponsors: any[] = [];

export default function SponsorSection() {
    // Don't render if no sponsors
    if (mockSponsors.length === 0) return null;

    return (
        <section className="py-20">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="text-amber-500 text-4xl">✨</span>
                        Featured Partners
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">Verified local businesses we highly recommend.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockSponsors.map((sponsor: Sponsor, index: number) => (
                    <motion.div
                        key={sponsor.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white"
                    >
                        {sponsor.media_type === 'video' ? (
                            <video
                                src={sponsor.media_url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <img
                                src={sponsor.media_url}
                                alt={sponsor.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        )}

                        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        <div className="absolute inset-0 p-12 flex flex-col justify-end">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white w-fit mb-4">
                                Partner Spotlight
                            </div>
                            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter leading-none italic uppercase">
                                {sponsor.name}
                            </h3>
                            <p className="text-slate-200 font-medium mb-8 max-w-sm line-clamp-2">
                                {sponsor.description}
                            </p>
                            <a
                                href={sponsor.cta_link}
                                className={`px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-xl hover:bg-${sponsor.color_theme}-500 hover:text-white transition-all transform group-hover:-translate-y-1`}
                            >
                                {sponsor.cta_text} →
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
