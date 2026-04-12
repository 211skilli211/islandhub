'use client';

import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-slate-900 flex flex-col">
            <HeroBackground
                pageKey="404"
                fallbackTitle="404: Lost at Sea?"
                className="flex-1 min-h-screen"
                align="center"
                overrideData={{
                    title: "Lost at Sea?",
                    subtitle: "The page you are looking for seems to have drifted away with the tide.",
                    cta_text: "Return to Shore",
                    cta_link: "/",
                    cta2_text: "Browse Marketplace",
                    cta2_link: "/listings",
                    icon_url: "🏝️",
                    style_config: {
                        bgColor: "#0f172a",
                        overlay_opacity: 0.6,
                        useGradient: true,
                        gradientStart: "#0f172a",
                        gradientEnd: "#1e293b"
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-6"
                >
                    {[
                        { icon: '🏠', label: 'Home', href: '/' },
                        { icon: '🛒', label: 'Marketplace', href: '/listings' },
                        { icon: '🗺️', label: 'Tours', href: '/tours' },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2.5rem] backdrop-blur-md transition-all hover:scale-105 hover:shadow-2xl group text-center"
                        >
                            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-white font-bold uppercase tracking-widest text-xs">{item.label}</span>
                        </Link>
                    ))}
                </motion.div>
            </HeroBackground>
        </main>
    );
}
