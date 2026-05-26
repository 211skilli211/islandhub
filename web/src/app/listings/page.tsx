     1|'use client';
     2|
     3|import { useState, useEffect, useMemo } from 'react';
     4|import Link from 'next/link';
     5|import { motion } from 'framer-motion';
     6|import api, { getImageUrl } from '@/lib/api';
     7|import MarketplaceTopBar from '@/components/marketplace/MarketplaceTopBar';
     8|import { MapPin, Plus, User, LogOut, ChevronRight } from 'lucide-react';
     9|
    10|const SIDEBAR_CATEGORIES = [
    11|    { id: 'all', label: 'Browse All', icon: '🏠' },
    12|    { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
    13|    { id: 'property', label: 'Property Rentals', icon: '🏡' },
    14|    { id: 'apparel', label: 'Apparel', icon: '👕' },
    15|    { id: 'classifieds', label: 'Classifieds', icon: '📋' },
    16|    { id: 'electronics', label: 'Electronics', icon: '📱' },
    17|    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    18|    { id: 'services', label: 'Services', icon: '🛠️' },
    19|    { id: 'tours', label: 'Tours', icon: '🗺️' },
    20|];
    21|
    22|const LOCATION = 'Kittitian Village, Saint Peter Basseterre, Saint Kitts And Nevis · Within 40 mi';
    23|
    24|export default function MarketplaceDiscoveryPage() {
    25|    const [listings, setListings] = useState<any[]>([]);
    26|    const [loading, setLoading] = useState(true);
    27|    const [searchQuery, setSearchQuery] = useState('');
    28|    const [activeCategory, setActiveCategory] = useState('all');
    29|    const [sidebarOpen, setSidebarOpen] = useState(false);
    30|
    31|    useEffect(() => {
    32|        const fetchListings = async () => {
    33|            setLoading(true);
    34|            try {
    35|                const res = await api.get('/listings?limit=50');
    36|                setListings(Array.isArray(res.data) ? res.data : (res.data.listings || res.data || []));
    37|            } catch (error) {
    38|                console.error('Failed to fetch listings', error);
    39|            } finally {
    40|                setLoading(false);
    41|            }
    42|        };
    43|        fetchListings();
    44|    }, []);
    45|
    46|    const handleSearchSubmit = (e: React.FormEvent) => {
    47|        e.preventDefault();
    48|    };
    49|
    50|    const filteredListings = useMemo(() => {
    51|        let result = [...listings];
    52|        if (activeCategory !== 'all') {
    53|            result = result.filter(l =>
    54|                l.category?.toLowerCase().includes(activeCategory) ||
    55|                l.type?.toLowerCase().includes(activeCategory)
    56|            );
    57|        }
    58|        if (searchQuery) {
    59|            const q = searchQuery.toLowerCase();
    60|            result = result.filter(l =>
    61|                (l.title || '').toLowerCase().includes(q) ||
    62|                (l.description || '').toLowerCase().includes(q) ||
    63|                (l.category || '').toLowerCase().includes(q)
    64|            );
    65|        }
    66|        return result;
    67|    }, [listings, activeCategory, searchQuery]);
    68|
    69|    const getPrice = (listing: any) => {
    70|        if (!listing.price || listing.price === 0) return 'FREE';
    71|        return `EC$${Number(listing.price).toLocaleString()}`;
    72|    };
    73|
    74|    const getImage = (listing: any) => {
    75|        if (listing.images && listing.images.length > 0) return getImageUrl(listing.images[0]);
    76|        if (listing.image_url) return getImageUrl(listing.image_url);
    77|        return null;
    78|    };
    79|
    80|    return (
    81|        <div className="min-h-screen bg-surface-primary">
    82|            {/* Top Bar */}
    83|            <MarketplaceTopBar
    84|                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
    85|                searchQuery={searchQuery}
    86|                onSearchChange={setSearchQuery}
    87|                onSearchSubmit={handleSearchSubmit}
    88|            />
    89|
    90|            {/* Mobile sidebar overlay */}
    91|            {sidebarOpen && (
    92|                <div className="fixed inset-0 z-40 lg:hidden">
    93|                    <div className="absolute inset-0 bg-surface-overlay" onClick={() => setSidebarOpen(false)} />
    94|                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-surface-elevated border-r border-border-primary z-50 overflow-y-auto">
    95|                        <SidebarContent
    96|                            activeCategory={activeCategory}
    97|                            onCategoryChange={(cat) => { setActiveCategory(cat); setSidebarOpen(false); }}
    98|                    onClose={() => setSidebarOpen(false)}
    99|                />
   100|            </aside>
   101|                </div>
   102|            )}
   103|
   104|            {/* Main layout */}
   105|            <div className="flex">
   106|                {/* Desktop sidebar */}
   107|                <aside className="hidden lg:block w-[280px] shrink-0 bg-surface-elevated border-r border-border-primary sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
   108|                    <SidebarContent
   109|                        activeCategory={activeCategory}
   110|                        onCategoryChange={setActiveCategory}
   111|                    />
   112|                </aside>
   113|
   114|                {/* Main content */}
   115|                <div className="flex-1 min-w-0">
   116|                    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
   117|                        {/* Section title */}
   118|                        <div className="flex items-center justify-between mb-6">
   119|                            <h2 className="text-xl font-black text-ink-primary tracking-tight">
   120|                                {activeCategory === 'all' ? "Today's picks" : SIDEBAR_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Listings'}
   121|                                <span className="ml-2 text-sm font-bold text-ink-tertiary">({filteredListings.length})</span>
   122|                            </h2>
   123|                        </div>
   124|
   125|                        {/* Listings grid — Facebook Marketplace style */}
   126|                        {loading ? (
   127|                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
   128|                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
   129|                                    <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden animate-pulse">
   130|                                        <div className="aspect-square bg-surface-tertiary" />
   131|                                        <div className="p-3 space-y-2">
   132|                                            <div className="w-3/4 h-4 bg-surface-tertiary rounded" />
   133|                                            <div className="w-1/2 h-3 bg-surface-tertiary/50 rounded" />
   134|                                        </div>
   135|                                    </div>
   136|                                ))}
   137|                            </div>
   138|                        ) : filteredListings.length === 0 ? (
   139|                            <div className="text-center py-20">
   140|                                <div className="text-5xl mb-4">🏪</div>
   141|                                <h3 className="text-lg font-black text-ink-primary mb-2">No listings found</h3>
   142|                                <p className="text-sm text-ink-tertiary mb-6">Try adjusting your search or browse a different category.</p>
   143|                                <Link href="/listings/create" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors">
   144|                                    <Plus size={16} />
   145|                                    Create a listing
   146|                                </Link>
   147|                            </div>
   148|                        ) : (
   149|                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
   150|                                {filteredListings.map((listing, index) => {
   151|                                    const image = getImage(listing);
   152|                                    const price = getPrice(listing);
   153|                                    const isNew = index < 2; // Mark first few as "new"
   154|                                    return (
   155|                                        <motion.div
   156|                                            key={listing.id || index}
   157|                                            initial={{ opacity: 0, scale: 0.95 }}
   158|                                            animate={{ opacity: 1, scale: 1 }}
   159|                                            transition={{ delay: index * 0.02 }}
   160|                                        >
   161|                                            <Link href={`/listings/${listing.id}`}
   162|                                                className="group block bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:shadow-lg hover:border-accent-200 transition-all">
   163|                                                {/* Image */}
   164|                                                <div className="aspect-square bg-surface-secondary relative overflow-hidden">
   165|                                                    {image ? (
   166|                                                        <img src={image} alt={listing.title}
   167|                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
   168|                                                    ) : (
   169|                                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-surface-secondary to-surface-tertiary">
   170|                                                            {listing.type === 'food' ? '🍽️' : listing.type === 'service' ? '🛠️' : listing.type === 'rental' ? '🏠' : '📦'}
   171|                                                        </div>
   172|                                                    )}
   173|                                                    {/* Tags */}
   174|                                                    {isNew && (
   175|                                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-accent-500 text-white text-[9px] font-black uppercase rounded-full">
   176|                                                            Just listed
   177|                                                        </span>
   178|                                                    )}
   179|                                                    {listing.price === 0 && (
   180|                                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-success-500 text-white text-[9px] font-black uppercase rounded-full">
   181|                                                            FREE
   182|                                                        </span>
   183|                                                    )}
   184|                                                </div>
   185|                                                {/* Info */}
   186|                                                <div className="p-3">
   187|                                                    <div className="text-sm font-bold text-ink-primary truncate mb-0.5">{price}</div>
   188|                                                    <div className="text-xs text-ink-secondary truncate mb-1">{listing.title || 'Untitled'}</div>
   189|                                                    <div className="flex items-center gap-1 text-[10px] text-ink-tertiary">
   190|                                                        <MapPin size={10} className="shrink-0" />
   191|                                                        <span className="truncate">{listing.location || 'St. Kitts'}</span>
   192|                                                    </div>
   193|                                                </div>
   194|                                            </Link>
   195|                                        </motion.div>
   196|                                    );
   197|                                })}
   198|                            </div>
   199|                        )}
   200|                    </div>
   201|                </div>
   202|            </div>
   203|        </div>
   204|    );
   205|}
   206|
   207|function SidebarContent({ activeCategory, onCategoryChange, onClose }: {
   208|    activeCategory: string;
   209|    onCategoryChange: (cat: string) => void;
   210|    onClose?: () => void;
   211|}) {
   212|    return (
   213|        <div className="p-4 space-y-4">
   214|            {/* Create listing button */}
   215|            <Link href="/listings/create" onClick={onClose}
   216|                className="flex items-center justify-center gap-2 w-full py-3 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors">
   217|                <Plus size={16} />
   218|                Create new listing
   219|            </Link>
   220|
   221|            {/* Marketplace menu */}
   222|            <div className="space-y-0.5">
   223|                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Marketplace</div>
   224|                {[
   225|                    { id: 'browse', label: 'Browse all', icon: '🏠' },
   226|                    { id: 'notifications', label: 'Notifications', icon: '🔔' },
   227|                    { id: 'inbox', label: 'Inbox', icon: '✉️' },
   228|                    { id: 'access', label: 'Marketplace access', icon: '🔑' },
   229|                    { id: 'buying', label: 'Buying', icon: '🛒' },
   230|                    { id: 'selling', label: 'Selling', icon: '💰' },
   231|                ].map(item => (
   232|                    <button key={item.id} onClick={onClose}
   233|                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors text-left">
   234|                        <span className="text-base">{item.icon}</span>
   235|                        <span className="text-[13px] font-medium">{item.label}</span>
   236|                    </button>
   237|                ))}
   238|            </div>
   239|
   240|            {/* Location */}
   241|            <div className="pt-3 border-t border-border-primary">
   242|                <div className="flex items-center gap-2 px-3 mb-2">
   243|                    <MapPin size={14} className="text-ink-tertiary" />
   244|                    <span className="text-[11px] text-ink-tertiary font-medium">{LOCATION}</span>
   245|                </div>
   246|            </div>
   247|
   248|            {/* Categories */}
   249|            <div className="pt-3 border-t border-border-primary">
   250|                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Categories</div>
   251|                <div className="space-y-0.5">
   252|                    {SIDEBAR_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
   253|                        const active = activeCategory === cat.id;
   254|                        return (
   255|                            <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
   256|                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
   257|                                    active ? 'bg-accent-500/10 text-accent-500' : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
   258|                                }`}>
   259|                                <span className="text-base">{cat.icon}</span>
   260|                                <span className="text-[13px] font-medium">{cat.label}</span>
   261|                                {active && <ChevronRight size={12} className="ml-auto" />}
   262|                            </button>
   263|                        );
   264|                    })}
   265|                </div>
   266|            </div>
   267|
   268|            {/* Footer */}
   269|            <div className="pt-3 border-t border-border-primary">
   270|                <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 text-[10px] text-ink-tertiary">
   271|                    <Link href="/about" onClick={onClose} className="hover:underline">About</Link>
   272|                    <span>·</span>
   273|                    <Link href="/privacy" onClick={onClose} className="hover:underline">Privacy</Link>
   274|                    <span>·</span>
   275|                    <Link href="/terms" onClick={onClose} className="hover:underline">Terms</Link>
   276|                </div>
   277|            </div>
   278|        </div>
   279|    );
   280|}
   281|