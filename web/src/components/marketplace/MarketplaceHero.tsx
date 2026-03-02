'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface MarketplaceHeroProps {
    onSearch: (query: string) => void;
}

export default function MarketplaceHero({ onSearch }: MarketplaceHeroProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [banner, setBanner] = useState<any>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await api.get('/promotions/active?location=marketplace_hero');
                if (res.data && res.data.length > 0) {
                    setBanner(res.data[0]);
                }
            } catch (e) {
                console.error('Failed to fetch banner');
            }
        };
        fetchBanner();
    }, []);

    // Color Maps
    const colorMap: any = {
        teal: { bg: 'from-teal-500/10 to-emerald-500/10', text: 'text-teal-400', btn: 'hover:bg-teal-400' },
        indigo: { bg: 'from-indigo-500/10 to-violet-500/10', text: 'text-indigo-400', btn: 'hover:bg-indigo-400' },
        rose: { bg: 'from-rose-500/10 to-pink-500/10', text: 'text-rose-400', btn: 'hover:bg-rose-400' },
        amber: { bg: 'from-amber-500/10 to-orange-500/10', text: 'text-amber-400', btn: 'hover:bg-amber-400' },
        blue: { bg: 'from-blue-500/10 to-sky-500/10', text: 'text-blue-400', btn: 'hover:bg-blue-400' },
        emerald: { bg: 'from-emerald-500/10 to-teal-500/10', text: 'text-emerald-400', btn: 'hover:bg-emerald-400' },
    };

    const theme = banner?.color_theme && colorMap[banner.color_theme] ? colorMap[banner.color_theme] : colorMap.teal;

    // Safety check for color split
    const themeColorName = theme.text.split('-')[1] || 'teal';
    const bgGradient = theme.bg.replace('/10', '/50');

    return (
        <HeroBackground
            pageKey="marketplace"
            className="w-full"
        >
            <div className="relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`inline-block px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full ${theme.text} text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-lg`}
                >
                    {banner?.subtitle || '🏝 Discover Local Treasures'}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]"
                >
                    {banner?.title ? (
                        <span dangerouslySetInnerHTML={{ __html: banner.title.replace(/\*(.*?)\*/g, `<span class="${theme.text} italic">$1</span>`) }} />
                    ) : (
                        <>Island <span className={`${theme.text} italic`}>Marketplace</span></>
                    )}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
                >
                    {banner?.description || 'The curated hub for authentic island commerce. Shop products, book services, and support local entrepreneurs.'}
                </motion.p>

                {/* Search Bar - Epic Version */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onSubmit={handleSearchSubmit}
                    className="max-w-2xl mx-auto mb-20 relative group"
                >
                    <div className={`absolute -inset-1 bg-linear-to-r ${bgGradient} rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="What are you looking for today?..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full px-10 py-7 bg-slate-800/80 backdrop-blur-2xl border-2 border-white/10 rounded-[2.2rem] text-white text-lg placeholder-slate-500 focus:outline-none focus:border-${themeColorName}-400/50 transition-all font-medium`}
                        />
                        <button
                            type="submit"
                            className={`absolute right-4 top-4 bottom-4 px-10 bg-white text-slate-950 rounded-[1.8rem] font-black text-sm uppercase tracking-widest ${theme.btn} hover:text-white transition-all shadow-xl shadow-black/40 active:scale-95`}
                        >
                            Explore
                        </button>
                    </div>
                </motion.form>
            </div>
        </HeroBackground>
    );
}
