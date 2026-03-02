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
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] lg:hidden"
                    />

                    {/* Sidebar Content */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[350px] bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl text-slate-900 leading-none">Kitchen Hub</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{listingTitle}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="grid grid-cols-4 border-b border-slate-50">
                            {[
                                { id: 'menu', icon: '🍴', label: 'Menu' },
                                { id: 'receipt', icon: '🧾', label: 'Draft' },
                                { id: 'orders', icon: '📦', label: 'Orders' },
                                { id: 'prefs', icon: '⚙️', label: 'Overview' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-6 flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-rose-50 border-b-4 border-rose-500' : 'hover:bg-slate-50'}`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-rose-600' : 'text-slate-400'}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
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
                                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-4">User Preferences</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-600">No Spices</span>
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-rose-500 focus:ring-rose-500" />
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-600">Gluten Free</span>
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-rose-500 focus:ring-rose-500" />
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-600">Extra Coconut</span>
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-rose-500 focus:ring-rose-500" />
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
                                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-6">Current Add-ons</h4>
                                        {cartLoading ? (
                                            <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500" /></div>
                                        ) : cartItems.length > 0 ? (
                                            <>
                                                <div className="space-y-4 mb-8">
                                                    {cartItems.map((item) => (
                                                        <div key={item.cart_item_id || item.item_id} className="flex justify-between items-center text-xs font-bold py-2 border-b border-dashed border-slate-100">
                                                            <span className="text-slate-500">{item.title} x{item.quantity}</span>
                                                            <span className="text-slate-900">${(parseFloat(item.price_snapshot) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Add-ons</span>
                                                        <span className="text-2xl font-black italic">${cartTotal.toFixed(2)}</span>
                                                    </div>
                                                    <Link href="/checkout" className="w-full py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">
                                                        Sync to Checkout
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Your table is empty</p>
                                                <button onClick={() => setActiveTab('menu')} className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-widest">
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
                                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-4">Quick Menu</h4>
                                        {loading ? (
                                            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" /></div>
                                        ) : menu.length > 0 ? (
                                            menu.map((section: any) => (
                                                <div key={section.id} className="space-y-4">
                                                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">{section.name}</p>
                                                    <div className="space-y-3">
                                                        {section.items?.map((item: any) => (
                                                            <div key={item.id} className="p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 transition-colors cursor-pointer group">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="font-black text-slate-900 text-xs uppercase">{item.name}</p>
                                                                    <span className="font-black text-rose-600 text-xs">${item.price}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-slate-400 text-xs">No menu items found.</p>
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
                                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-4">Past Sessions</h4>
                                        {ordersLoading ? (
                                            <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500" /></div>
                                        ) : orders.length > 0 ? (
                                            orders.map((order) => (
                                                <div key={order.order_id} className="p-6 border-2 border-slate-100 rounded-3xl hover:border-rose-200 transition-colors cursor-pointer group mb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order #{order.order_id}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                            order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-slate-50 text-slate-600'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="font-black text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                                                        {order.items?.map((i: any) => i.title).join(', ') || 'N/A'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                                                        {new Date(order.created_at).toLocaleDateString()} • ${parseFloat(order.total_amount).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-slate-400 text-xs italic">No past orders</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer CTA */}
                        <div className="p-8 border-t border-slate-50">
                            <button className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-rose-100 hover:bg-rose-600 hover:-translate-y-1 transition-all active:scale-95">
                                Finalize Kitchen Order
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
