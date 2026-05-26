'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import MarketplaceTopBar from '@/components/marketplace/MarketplaceTopBar';
import { MapPin, Plus, User, LogOut, ChevronRight } from 'lucide-react';

const SIDEBAR_CATEGORIES = [
    { id: 'all', label: 'Browse All', icon: '🏠' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { id: 'property', label: 'Property Rentals', icon: '🏡' },
    { id: 'apparel', label: 'Apparel', icon: '👕' },
    { id: 'classifieds', label: 'Classifieds', icon: '📋' },
    { id: 'electronics', label: 'Electronics', icon: '📱' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'services', label: 'Services', icon: '🛠️' },
    { id: 'tours', label: 'Tours', icon: '🗺️' },
];

const LOCATION = 'Kittitian Village, Saint Peter Basseterre, Saint Kitts And Nevis · Within 40 mi';

export default function MarketplaceDiscoveryPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const res = await api.get('/listings?limit=50');
                setListings(Array.isArray(res.data) ? res.data : (res.data.listings || res.data || []));
            } catch (error) {
                console.error('Failed to fetch listings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const filteredListings = useMemo(() => {
        let result = [...listings];
        if (activeCategory !== 'all') {
            result = result.filter(l =>
                l.category?.toLowerCase().includes(activeCategory) ||
                l.type?.toLowerCase().includes(activeCategory)
            );
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(l =>
                (l.title || '').toLowerCase().includes(q) ||
                (l.description || '').toLowerCase().includes(q) ||
                (l.category || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [listings, activeCategory, searchQuery]);

    const getPrice = (listing: any) => {
        if (!listing.price || listing.price === 0) return 'FREE';
        return `EC$${Number(listing.price).toLocaleString()}`;
    };

    const getImage = (listing: any) => {
        if (listing.images && listing.images.length > 0) return getImageUrl(listing.images[0]);
        if (listing.image_url) return getImageUrl(listing.image_url);
        return null;
    };

    return (
        <div className="min-h-screen bg-surface-primary">
            {/* Top Bar */}
            <MarketplaceTopBar
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
            />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-surface-overlay" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-surface-elevated border-r border-border-primary z-50 overflow-y-auto">
                        <SidebarContent
                            activeCategory={activeCategory}
                            onCategoryChange={(cat) => { setActiveCategory(cat); setSidebarOpen(false); }}
                    onClose={() => setSidebarOpen(false)}
                />
            </aside>
                </div>
            )}

            {/* Main layout */}
            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-[280px] shrink-0 bg-surface-elevated border-r border-border-primary sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
                    <SidebarContent
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                        {/* Section title */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-ink-primary tracking-tight">
                                {activeCategory === 'all' ? "Today's picks" : SIDEBAR_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Listings'}
                                <span className="ml-2 text-sm font-bold text-ink-tertiary">({filteredListings.length})</span>
                            </h2>
                        </div>

                        {/* Listings grid — Facebook Marketplace style */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden animate-pulse">
                                        <div className="aspect-square bg-surface-tertiary" />
                                        <div className="p-3 space-y-2">
                                            <div className="w-3/4 h-4 bg-surface-tertiary rounded" />
                                            <div className="w-1/2 h-3 bg-surface-tertiary/50 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredListings.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-5xl mb-4">🏪</div>
                                <h3 className="text-lg font-black text-ink-primary mb-2">No listings found</h3>
                                <p className="text-sm text-ink-tertiary mb-6">Try adjusting your search or browse a different category.</p>
                                <Link href="/listings/create" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors">
                                    <Plus size={16} />
                                    Create a listing
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredListings.map((listing, index) => {
                                    const image = getImage(listing);
                                    const price = getPrice(listing);
                                    const isNew = index < 2; // Mark first few as "new"
                                    return (
                                        <motion.div
                                            key={listing.id || index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.02 }}
                                        >
                                            <Link href={`/listings/${listing.id}`}
                                                className="group block bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:shadow-lg hover:border-accent-200 transition-all">
                                                {/* Image */}
                                                <div className="aspect-square bg-surface-secondary relative overflow-hidden">
                                                    {image ? (
                                                        <img src={image} alt={listing.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-surface-secondary to-surface-tertiary">
                                                            {listing.type === 'food' ? '🍽️' : listing.type === 'service' ? '🛠️' : listing.type === 'rental' ? '🏠' : '📦'}
                                                        </div>
                                                    )}
                                                    {/* Tags */}
                                                    {isNew && (
                                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-accent-500 text-white text-[9px] font-black uppercase rounded-full">
                                                            Just listed
                                                        </span>
                                                    )}
                                                    {listing.price === 0 && (
                                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-success-500 text-white text-[9px] font-black uppercase rounded-full">
                                                            FREE
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="p-3">
                                                    <div className="text-sm font-bold text-ink-primary truncate mb-0.5">{price}</div>
                                                    <div className="text-xs text-ink-secondary truncate mb-1">{listing.title || 'Untitled'}</div>
                                                    <div className="flex items-center gap-1 text-[10px] text-ink-tertiary">
                                                        <MapPin size={10} className="shrink-0" />
                                                        <span className="truncate">{listing.location || 'St. Kitts'}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarContent({ activeCategory, onCategoryChange, onClose }: {
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    onClose?: () => void;
}) {
    return (
        <div className="p-4 space-y-4">
            {/* Create listing button */}
            <Link href="/listings/create" onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors">
                <Plus size={16} />
                Create new listing
            </Link>

            {/* Marketplace menu */}
            <div className="space-y-0.5">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Marketplace</div>
                {[
                    { id: 'browse', label: 'Browse all', icon: '🏠' },
                    { id: 'notifications', label: 'Notifications', icon: '🔔' },
                    { id: 'inbox', label: 'Inbox', icon: '✉️' },
                    { id: 'access', label: 'Marketplace access', icon: '🔑' },
                    { id: 'buying', label: 'Buying', icon: '🛒' },
                    { id: 'selling', label: 'Selling', icon: '💰' },
                ].map(item => (
                    <button key={item.id} onClick={onClose}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors text-left">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-[13px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Location */}
            <div className="pt-3 border-t border-border-primary">
                <div className="flex items-center gap-2 px-3 mb-2">
                    <MapPin size={14} className="text-ink-tertiary" />
                    <span className="text-[11px] text-ink-tertiary font-medium">{LOCATION}</span>
                </div>
            </div>

            {/* Categories */}
            <div className="pt-3 border-t border-border-primary">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Categories</div>
                <div className="space-y-0.5">
                    {SIDEBAR_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const active = activeCategory === cat.id;
                        return (
                            <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                                    active ? 'bg-accent-500/10 text-accent-500' : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
                                }`}>
                                <span className="text-base">{cat.icon}</span>
                                <span className="text-[13px] font-medium">{cat.label}</span>
                                {active && <ChevronRight size={12} className="ml-auto" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border-primary">
                <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 text-[10px] text-ink-tertiary">
                    <Link href="/about" onClick={onClose} className="hover:underline">About</Link>
                    <span>·</span>
                    <Link href="/privacy" onClick={onClose} className="hover:underline">Privacy</Link>
                    <span>·</span>
                    <Link href="/terms" onClick={onClose} className="hover:underline">Terms</Link>
                </div>
            </div>
        </div>
    );
}
