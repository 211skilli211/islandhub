'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/lib/api';
import { X } from 'lucide-react';

export default function MobileAnnouncement() {
    const [announcement, setAnnouncement] = useState<any>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchMarquee = async () => {
            try {
                // Determine if we are on mobile (rudimentary check or rely on CSS hidden md:block)
                // Actually, we'll render it and hide via CSS classes if needed, 
                // but user asked for "toasts for each page", implying mobile focus.
                if (window.innerWidth >= 768) return;

                const res = await api.get('/marquee');
                if (res.data && res.data.items && res.data.items.length > 0) {
                    // Pick the highest priority active message
                    setAnnouncement(res.data.items[0]);
                    setVisible(true);
                }
            } catch (e) {
                // silent fail
            }
        };

        fetchMarquee();
    }, []);

    if (!visible || !announcement) return null;

    const getTemplateStyles = (type: string) => {
        const styles: Record<string, { bg: string; border: string; iconBg: string; iconColor: string; labelColor: string; icon: string }> = {
            urgency: { bg: 'bg-red-900/95', border: 'border-red-500/50', iconBg: 'bg-red-500/20', iconColor: 'text-red-400', labelColor: 'text-red-400', icon: '🚨' },
            community: { bg: 'bg-blue-900/95', border: 'border-blue-500/50', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400', labelColor: 'text-blue-400', icon: '🫂' },
            promotion: { bg: 'bg-amber-900/95', border: 'border-amber-500/50', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400', labelColor: 'text-amber-400', icon: '🎁' },
            standard: { bg: 'bg-slate-900/95', border: 'border-teal-500/30', iconBg: 'bg-teal-500/20', iconColor: 'text-teal-400', labelColor: 'text-teal-500', icon: '📣' }
        };
        return styles[type] || styles.standard;
    };

    const styles = getTemplateStyles(announcement.template_type || 'standard');

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-40 left-4 right-4 z-[60] md:hidden"
                >
                    <div className={`${styles.bg} backdrop-blur-xl border ${styles.border} p-5 rounded-[2rem] shadow-2xl flex items-start gap-4`}>
                        <div className={`p-3 ${styles.iconBg} rounded-2xl ${styles.iconColor} text-xl animate-bounce`}>
                            {announcement.icon || styles.icon}
                        </div>
                        <div className="flex-1">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.labelColor} mb-1`}>
                                {announcement.user_name || announcement.id || 'Broadcast'}
                            </p>
                            <p className="text-sm font-bold text-white leading-relaxed">
                                {announcement.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setVisible(false)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
