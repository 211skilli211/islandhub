'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, ExternalLink, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface VendorPromotion {
    promo_id: number;
    title: string;
    subtitle?: string;
    promo_type: 'banner' | 'popup' | 'in_store' | 'product_badge';
    media_url?: string;
    media_type?: 'image' | 'video';
    background_color?: string;
    text_color?: string;
    discount_type?: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
    discount_value?: string;
    promo_code?: string;
    target_url?: string;
}

interface PromotionBannerProps {
    storeId: number;
    className?: string;
}

export default function PromotionBanner({ storeId, className = '' }: PromotionBannerProps) {
    const [promotions, setPromotions] = useState<VendorPromotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await api.get(`/advertisements/stores/${storeId}/promotions?placement=banner`);
                setPromotions(response.data || []);
            } catch (error) {
                console.error('Failed to fetch promotions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (storeId) {
            fetchPromotions();
        }
    }, [storeId]);

    const trackClick = async (promoId: number) => {
        try {
            await api.post(`/advertisements/promotions/${promoId}/click`);
        } catch (error) {
            console.error('Failed to track promotion click:', error);
        }
    };

    if (isLoading || promotions.length === 0) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {promotions.map((promo) => (
                <motion.div
                    key={promo.promo_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl shadow-sm border border-slate-100 group"
                    style={{
                        backgroundColor: promo.background_color || '#f8fafc',
                        color: promo.text_color || '#0f172a'
                    }}
                >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                        {/* Media if exists */}
                        {promo.media_url && (
                            <div className="w-full md:w-1/3 aspect-video md:aspect-square relative overflow-hidden rounded-xl">
                                <img
                                    src={promo.media_url}
                                    alt={promo.title}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                                    <Tag size={16} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest opacity-70">
                                    Store Promotion
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                                {promo.title}
                            </h2>

                            {promo.subtitle && (
                                <p className="text-lg opacity-80 mb-4 leading-relaxed">
                                    {promo.subtitle}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mt-auto">
                                {promo.promo_code && (
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                                        <span className="text-xs font-bold uppercase opacity-70">Code:</span>
                                        <span className="font-mono font-bold tracking-wider">{promo.promo_code}</span>
                                    </div>
                                )}

                                {promo.target_url && (
                                    <a
                                        href={promo.target_url}
                                        onClick={() => trackClick(promo.promo_id)}
                                        className="flex items-center gap-2 bg-primary text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 dark:shadow-primary/40"
                                    >
                                        Claim Offer
                                        <ArrowRight size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Ribbon decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
