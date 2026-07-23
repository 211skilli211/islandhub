'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface BrandLogo {
    id: number;
    name: string;
    image_url: string;
    link_url?: string;
    sort_order?: number;
}

interface BrandMarqueeProps {
    speed?: number;
    className?: string;
    title?: string;
}

export default function BrandMarquee({ speed = 25, className = '', title }: BrandMarqueeProps) {
    const [brands, setBrands] = useState<BrandLogo[]>([]);
    const [loading, setLoading] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            setLoading(false);
            return;
        }
        fetch(`${apiUrl}/api/brands`)
            .then(res => {
                if (!res.ok) return null;
                const ct = res.headers.get('content-type');
                if (!ct || !ct.includes('application/json')) return null;
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setBrands(data);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || brands.length === 0) return null;

    const doubled = [...brands, ...brands];

    return (
        <div className={`bg-white py-10 ${className}`}>
            {title && (
                <p className="text-center text-xs text-ink-tertiary uppercase tracking-widest mb-6">
                    {title}
                </p>
            )}
            <div className="overflow-hidden w-full">
                <div
                    className="flex items-center gap-10"
                    style={{
                        animation: shouldReduceMotion ? 'none' : `marquee-scroll ${speed}s linear infinite`,
                        width: 'max-content',
                    }}
                >
                    {doubled.map((brand, i) => (
                        <div
                            key={`${brand.id}-${i}`}
                            className="h-11 flex items-center justify-center shrink-0"
                        >
                            {brand.link_url ? (
                                <a
                                    href={brand.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-full flex items-center"
                                >
                                    <img
                                        src={brand.image_url}
                                        alt={brand.name}
                                        className="h-full w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </a>
                            ) : (
                                <img
                                    src={brand.image_url}
                                    alt={brand.name}
                                    className="h-full w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                        </div>
                        <style>{`
                            @media (prefers-reduced-motion: reduce) {
                                @keyframes marquee-scroll {
                                    0% { transform: translateX(0); }
                                    100% { transform: translateX(0); }
                                }
                            }
                            @media (prefers-reduced-motion: no-preference) {
                                @keyframes marquee-scroll {
                                    0% { transform: translateX(0); }
                                    100% { transform: translateX(-50%); }
                                }
                            }
                        `}</style>
        </div>
    );
}
