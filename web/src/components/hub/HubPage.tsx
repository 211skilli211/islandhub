'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import BrandMarquee from '@/components/BrandMarquee';
import {
    Store, HubPageConfig,
    StoreCard, HubHero, CategoryFilterBar, HubCTA,
    HubLoadingSkeleton, HubEmptyState,
} from '@/components/hub/HubComponents';
import { getHubConfig } from '@/lib/hubConfigs';
import { useSegmentTheme } from '@/components/SegmentThemeProvider';

function categorizeStore(store: Store, config: HubPageConfig): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of config.categories) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return config.categories[1]?.id || 'all';
}

function HubPage({ config }: { config: HubPageConfig }) {
    const { theme: segmentTheme } = useSegmentTheme();
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                const categoryMap: Record<string, string[]> = {
                    food: ['food'],
                    products: ['retail', 'product', 'shop'],
                    services: ['service', 'professional', 'automotive', 'health_beauty', 'marine', 'event'],
                    tours: ['tour', 'tourism'],
                    transport: ['transport', 'ride', 'delivery'],
                    rentals: ['rental', 'stay', 'accommodation'],
                    campaigns: ['campaign', 'charity'],
                    community: ['community', 'social'],
                };
                const cats = categoryMap[config.type] || [config.type];
                const stores: Store[] = rawData
                    .filter((s: any) => {
                        const cat = (s.category || '').toLowerCase();
                        const sub = (s.subtype || '').toLowerCase();
                        return cats.some(c => cat === c || sub.includes(c));
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color,
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                    }));
                setAllStores(stores);
            } catch (error) {
                console.error(`Failed to fetch ${config.type} stores:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, [config.type]);

    const filteredStores = useMemo(() => {
        let stores = allStores;
        if (activeCategory !== 'all') {
            stores = stores.filter(s => categorizeStore(s, config) === activeCategory);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            stores = stores.filter(s =>
                (s.name || s.business_name || '').toLowerCase().includes(q) ||
                (s.description || '').toLowerCase().includes(q) ||
                (s.subtype || '').toLowerCase().includes(q)
            );
        }
        return stores;
    }, [allStores, activeCategory, searchTerm, config]);

    const storesByCategory = useMemo(() => {
        const map: Record<string, Store[]> = {};
        for (const cat of config.categories) map[cat.id] = [];
        for (const store of filteredStores) {
            const catId = categorizeStore(store, config);
            if (map[catId]) map[catId].push(store);
        }
        return map;
    }, [filteredStores, config]);

    return (
        <main className="min-h-screen bg-surface-elevated dark:bg-ocean-900">
            <HubHero config={config} totalStores={filteredStores.length} searchTerm={searchTerm} onSearch={setSearchTerm} />

            <CategoryFilterBar
                categories={config.categories} activeCategory={activeCategory}
                onCategoryChange={setActiveCategory} theme={config.theme}
                totalStores={filteredStores.length} storesByCategory={storesByCategory} loading={loading}
            />

            {!loading && filteredStores.length > 0 && <BrandMarquee type="brand" />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence>
                    {searchTerm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className={`mb-6 flex items-center justify-between ${config.theme.lightBg} px-5 py-3 rounded-2xl ring-1 ${config.theme.ring}`}>
                            <p className="text-sm text-ink-secondary dark:text-ink-tertiary">
                                Showing <span className="font-extrabold text-ink-primary dark:text-sand-50">{filteredStores.length}</span> results for &quot;<span className={`font-extrabold ${config.theme.lightText}`}>{searchTerm}</span>&quot;
                            </p>
                            <button onClick={() => setSearchTerm('')} className={`text-xs font-bold ${config.theme.lightText} hover:underline underline-offset-2`}>Clear</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && filteredStores.length === 0 && (
                    <HubEmptyState emoji="🏪" title="No places found" message="Try adjusting your search or browse all categories." onClear={() => { setSearchTerm(''); setActiveCategory('all'); }} />
                )}

                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && filteredStores.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredStores.map((store, idx) => (
                                <StoreCard key={store.store_id || store.id} store={store} index={idx} theme={config.theme} variant={config.storeCardVariant} hubType={config.type} />
                            ))}
                        </div>
                    )
                ) : (
                    config.categories.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-12">
                                <div className={`flex items-center justify-between mb-5 ${config.theme.lightBg} px-5 py-3 rounded-2xl ring-1 ${config.theme.ring}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{cat.icon}</span>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-ink-primary dark:text-sand-50">{cat.title}</h2>
                                            <p className="text-xs text-ink-tertiary0 dark:text-ink-tertiary font-medium">{cat.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${config.theme.gradient} text-white shadow-md`}>
                                        {loading ? '…' : stores.length} {stores.length === 1 ? 'place' : 'places'}
                                    </span>
                                </div>
                                {loading ? <HubLoadingSkeleton /> : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {stores.map((store, idx) => (
                                            <StoreCard key={store.store_id || store.id} store={store} index={idx} theme={config.theme} variant={config.storeCardVariant} hubType={config.type} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            <HubCTA config={config} />
        </main>
    );
}

// Dynamic hub page — handles /hub/food, /hub/products, etc.
export default function HubTypePage() {
    const params = useParams();
    const type = params?.type as string || 'food';
    const config = getHubConfig(type);

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-secondary dark:bg-ocean-900">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">🏝️</span>
                    <h1 className="text-2xl font-bold text-ink-primary dark:text-sand-50 mb-2">Hub Not Found</h1>
                    <p className="text-ink-tertiary0 dark:text-ink-tertiary">The hub type &quot;{type}&quot; doesn&apos;t exist.</p>
                </div>
            </div>
        );
    }

    return <HubPage config={config} />;
}

// Static hub pages — each existing route renders the same component with its config
export function FoodHubPage() { return <HubPage config={getHubConfig('food')!} />; }
export function ProductsHubPage() { return <HubPage config={getHubConfig('products')!} />; }
export function ServicesHubPage() { return <HubPage config={getHubConfig('services')!} />; }
export function ToursHubPage() { return <HubPage config={getHubConfig('tours')!} />; }
export function TransportHubPage() { return <HubPage config={getHubConfig('transport')!} />; }
export function RentalsHubPage() { return <HubPage config={getHubConfig('rentals')!} />; }
export function CampaignsHubPage() { return <HubPage config={getHubConfig('campaigns')!} />; }
export function CommunityHubPage() { return <HubPage config={getHubConfig('community')!} />; }
