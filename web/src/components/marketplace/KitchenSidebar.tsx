import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface KitchenSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    listingTitle: string;
    storeId?: string | number;
}

export default function KitchenSidebar({ isOpen, onClose, listingTitle, storeId }: KitchenSidebarProps) {
    const [activeTab, setActiveTab] = useState<'prefs' | 'menu' | 'receipt' | 'orders'>('menu');
    const [menu, setMenu] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !storeId) return;

        const fetchMenu = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/menu?storeId=${storeId}`);
                if (res.data?.sections) {
                    setMenu(res.data.sections);
                }
            } catch (e) {
                console.error('Sidebar fetch menu error:', e);
            } finally {
                setLoading(false);
            }
        };

        const fetchCart = async () => {
            try {
                setCartLoading(true);
                const res = await api.get('/cart');
                // Filter cart items by current store if storeId is provided
                const items = res.data?.items || [];
                setCartItems(items.filter((item: any) => item.store_id === storeId || !storeId));
            } catch (e) {
                console.error('Sidebar fetch cart error:', e);
            } finally {
                setCartLoading(false);
            }
        };

        const fetchOrders = async () => {
            try {
                setOrdersLoading(true);
                const res = await api.get('/orders/me');
                setOrders(res.data || []);
            } catch (e) {
                console.error('Sidebar fetch orders error:', e);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchMenu();
        fetchCart();
        fetchOrders();
    }, [isOpen, storeId]);

    const cartTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price_snapshot) * item.quantity), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-ink-primary/40 backdrop-blur-sm z-100 lg:hidden"
                    />

                    
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[350px] bg-surface-elevated shadow-2xl z-101 flex flex-col border-l border-border-primary"
                    >
                        
                        <div className="p-8 border-b border-border-primary flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl text-ink-primary leading-none">Kitchen Hub</h3>
                                <p className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mt-2">{listingTitle}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-surface-secondary rounded-full text-ink-tertiary hover:text-ink-primary transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        
                        <div className="grid grid-cols-4 border-b border-border-primary">
                            {([
                                { id: 'menu', icon: '🍴', label: 'Menu' },
                                { id: 'receipt', icon: '🧾', label: 'Draft' },
                                { id: 'orders', icon: '📦', label: 'Orders' },
                                { id: 'prefs', icon: '⚙️', label: 'Overview' }
                            ] as const).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-6 flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-[#e11d48]/5 border-b-4 border-[#e11d48]' : 'hover:bg-surface-secondary'}`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-[#e11d48]' : 'text-ink-tertiary'}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        
                        <div className="flex-1 overflow-y-auto p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'prefs' && (
                                    <motion.div
                                        key="prefs"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <h4 className="font-black text-sm uppercase tracking-widest text-ink-primary mb-4">User Preferences</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-surface-secondary rounded-2xl">
                                                <span className="text-xs font-bold text-ink-secondary">No Spices</span>
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-border-primary text-[#e11d48] focus:ring-rose-500" />
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-surface-secondary rounded-2xl">
                                                <span className="text-xs font-bold text-ink-secondary">Gluten Free</span>
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-border-primary text-[#e11d48] focus:ring-rose-500" />
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-surface-secondary rounded-2xl">
                                                <span className="text-xs font-bold text-ink-secondary">Extra Coconut</span>
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-border-primary text-[#e11d48] focus:ring-rose-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'receipt' && (
                                    <motion.div
                                        key="receipt"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <h4 className="font-black text-sm uppercase tracking-widest text-ink-primary mb-6">Current Add-ons</h4>
                                        {cartLoading ? (
                                            <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e11d48]" /></div>
                                        ) : cartItems.length > 0 ? (
                                            <>
                                                <div className="space-y-4 mb-8">
                                                    {cartItems.map((item) => (
                                                        <div key={item.cart_item_id || item.item_id} className="flex justify-between items-center text-xs font-bold py-2 border-b border-dashed border-border-primary">
                                                            <span className="text-ink-tertiary">{item.title} x{item.quantity}</span>
                                                            <span className="text-ink-primary">${(parseFloat(item.price_snapshot) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-6 bg-ink-primary rounded-4xl text-white">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Total Add-ons</span>
                                                        <span className="text-2xl font-black italic">${cartTotal.toFixed(2)}</span>
                                                    </div>
                                                    <Link href="/checkout" className="w-full py-3 bg-surface-elevated text-ink-900 dark:text-ink-50 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#e11d48]/50 hover:text-white transition-all flex items-center justify-center">
                                                        Sync to Checkout
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-ink-tertiary text-xs font-bold uppercase tracking-widest italic">Your table is empty</p>
                                                <button onClick={() => setActiveTab('menu')} className="mt-4 text-[10px] font-black text-[#e11d48] uppercase tracking-widest">
                                                    Browse Menu ➔
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'menu' && (
                                    <motion.div
                                        key="menu"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <h4 className="font-black text-sm uppercase tracking-widest text-ink-primary mb-4">Quick Menu</h4>
                                        {loading ? (
                                            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e11d48]" /></div>
                                        ) : menu.length > 0 ? (
                                            menu.map((section: any) => (
                                                <div key={section.id} className="space-y-4">
                                                    <p className="text-[10px] font-black uppercase text-[#e11d48] tracking-widest">{section.name}</p>
                                                    <div className="space-y-3">
                                                        {section.items?.map((item: any) => (
                                                            <div key={item.id} className="p-4 bg-surface-secondary rounded-2xl hover:bg-[#e11d48]/5 transition-colors cursor-pointer group">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="font-black text-ink-primary text-xs uppercase">{item.name}</p>
                                                                    <span className="font-black text-[#e11d48] text-xs">${item.price}</span>
                                                                </div>
                                                                <p className="text-[10px] text-ink-tertiary mt-1 line-clamp-1">{item.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-ink-tertiary text-xs">No menu items found.</p>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'orders' && (
                                    <motion.div
                                        key="orders"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <h4 className="font-black text-sm uppercase tracking-widest text-ink-primary mb-4">Past Sessions</h4>
                                        {ordersLoading ? (
                                            <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e11d48]" /></div>
                                        ) : orders.length > 0 ? (
                                            orders.map((order) => (
                                                <div key={order.order_id} className="p-6 border-2 border-border-primary rounded-3xl hover:border-[#e11d48]/20 transition-colors cursor-pointer group mb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest">Order #{order.order_id}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            order.status === 'pending' ? 'bg-sand-500/5 text-sand-500' :
                                                                'bg-surface-secondary text-ink-secondary'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="font-black text-ink-primary group-hover:text-[#e11d48] transition-colors truncate">
                                                        {order.items?.map((i: any) => i.title).join(', ') || 'N/A'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-ink-tertiary mt-1">
                                                        {new Date(order.created_at).toLocaleDateString()} - ${parseFloat(order.total_amount).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-ink-tertiary text-xs italic">No past orders</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        
                        <div className="p-8 border-t border-border-primary">
                            <button className="w-full py-5 bg-[#e11d48]/50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-rose-100 hover:bg-[#e11d48] hover:-translate-y-1 transition-all active:scale-95">
                                Place Order — {cartItems.reduce((s: number, i: any) => s + (i.price || 0) * (i.qty || 1), 0).toFixed(2)} XCD
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
