'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/auth';
import api, { getImageUrl } from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ListingCard from '@/components/ListingCard';

import RoleSwitcher from '@/components/RoleSwitcher';
import toast from 'react-hot-toast';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import CommunityPosts from '@/components/dashboard/CommunityPosts';
import VendorBranding from '@/components/dashboard/VendorBranding';
import MenuManagement from '@/components/dashboard/MenuManagement';
import DriverPortal from '@/components/dashboard/DriverPortal';
import VendorPromotions from '@/components/dashboard/VendorPromotions';
import VendorOrders from '@/components/dashboard/VendorOrders';
import RatingModal from '@/components/RatingModal';
import DriverOnboarding from '@/components/dashboard/DriverOnboarding';
import MessageCenter from '@/components/dashboard/MessageCenter';
import LogisticsHub from '@/components/dashboard/LogisticsHub';
import WalletTab from '@/components/dashboard/WalletTab';
import VendorReviews from '@/components/dashboard/VendorReviews';
import VendorOverview from '@/components/dashboard/VendorOverview';
import DeliveryDispatch from '@/components/dashboard/DeliveryDispatch';
import ShippingTracking from '@/components/dashboard/ShippingTracking';
import BecomeDriver from '@/components/dashboard/BecomeDriver';
import DriverVerification from '@/components/dashboard/DriverVerification';
import VendorComplianceStatus from '@/components/dashboard/VendorComplianceStatus';

// Dynamic imports for heavy components
const CreateListingModal = dynamic(
    () => import('@/components/CreateListingModal'),
    {
        loading: () => <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center"><div className="bg-white p-8 rounded-2xl">Loading...</div></div>,
        ssr: false
    }
);

const DeliveryChat = dynamic(
    () => import('@/components/DeliveryChat'),
    {
        loading: () => <div className="h-full bg-slate-50 animate-pulse" />,
        ssr: false
    }
);

// Helper for type safety if needed, or reuse types.
// Assuming "Listing" type is similar to what we defined.

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    // Role Mode State
    const [viewMode, setViewMode] = useState<'buyer' | 'vendor' | 'driver'>('buyer');
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'posts' | 'settings' | 'branding' | 'menu' | 'portal' | 'orders' | 'promotions' | 'messages' | 'wallet' | 'reviews' | 'delivery' | 'shipping' | 'become-driver' | 'driver-hub' | 'driver-verification'>('overview');

    // Data State
    const [myListings, setMyListings] = useState<any[]>([]);
    const [donations, setDonations] = useState<any[]>([]);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [stores, setStores] = useState<any[]>([]);
    const [activeStoreId, setActiveStoreId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [chatRequest, setChatRequest] = useState<any>(null);
    const [ratingRequest, setRatingRequest] = useState<any>(null);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (viewMode === 'vendor') {
                    if (user?.id) {
                        try {
                            const [subRes, storesRes] = await Promise.all([
                                api.get('/vendor-subscriptions/'),
                                api.get('/stores/my')
                            ]);
                            setSubscription(subRes.data);
                            const vendorStores = Array.isArray(storesRes.data) ? storesRes.data : [storesRes.data];
                            setStores(vendorStores);

                            // Determine which store to load
                            let targetStoreId = activeStoreId;
                            if (!targetStoreId && vendorStores.length > 0) {
                                targetStoreId = vendorStores[0].store_id || vendorStores[0].id;
                                setActiveStoreId(targetStoreId);
                            }

                            // Fetch Listings Scoped to Store
                            if (targetStoreId) {
                                const listingsRes = await api.get(`/listings?store_id=${targetStoreId}`);
                                const rawListings = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data.listings || []);
                                // Separating shop items from logistics requests
                                setMyListings(rawListings.filter((l: any) => !['taxi', 'delivery', 'pickup'].includes(l.service_type)));
                                setMyRequests(rawListings.filter((l: any) => ['taxi', 'delivery', 'pickup'].includes(l.service_type)));
                            } else {
                                // Fallback to all user listings if no store
                                const listingsRes = await api.get(`/listings?creator_id=${user.id}`);
                                const rawListings = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data.listings || []);
                                setMyListings(rawListings.filter((l: any) => !['taxi', 'delivery', 'pickup'].includes(l.service_type)));
                                setMyRequests(rawListings.filter((l: any) => ['taxi', 'delivery', 'pickup'].includes(l.service_type)));
                            }
                        } catch (err: any) {
                            console.error("Vendor data fetch error", err);
                            if (err.response?.status !== 404) console.error(err);
                        }
                    }
                } else if (viewMode === 'driver') {
                    // Driver specific logic
                } else {
                    const [donationsRes, requestsRes, ordersRes] = await Promise.all([
                        api.get('/donations/me'),
                        api.get(`/listings?creator_id=${user?.id}&service_type=taxi,delivery,pickup`),
                        api.get('/orders/me')
                    ]);
                    setDonations(donationsRes.data);

                    // Filter to only logistics requests
                    const logisticsRequests = (Array.isArray(requestsRes.data) ? requestsRes.data : requestsRes.data?.listings || [])
                        .filter((l: any) => ['taxi', 'delivery', 'pickup'].includes(l.service_type));
                    setMyRequests(logisticsRequests);

                    // Set user orders
                    const userOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
                    setOrders(userOrders);

                    try {
                        const subRes = await api.get('/customer-subscriptions/my');
                        setSubscription(subRes.data);
                    } catch (e) {
                        setSubscription(null);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, viewMode, user?.id, isCreateModalOpen, activeStoreId]); // Added activeStoreId dependency coverage

    useEffect(() => {
        if (viewMode === 'driver') {
            setActiveTab('portal');
        } else if (viewMode === 'vendor') {
            setActiveTab('overview');
        } else {
            setActiveTab('activity');
        }
    }, [viewMode]);

    if (!isMounted || !isAuthenticated) {
        return null;
    }

    const activeStore = stores.find(s => (s.store_id || s.id) === activeStoreId);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <CreateListingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { }}
                storeId={activeStoreId}
            />

            {/* Listing Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedListing && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="relative h-64 bg-slate-900 overflow-hidden">
                                <img
                                    src={getImageUrl(selectedListing.metadata?.image || selectedListing.images?.[0] || '/placeholders/food-hero.jpg')}
                                    className="w-full h-full object-cover opacity-60"
                                    alt="Hero"
                                />
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 transition-all font-black"
                                >✕</button>
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" />
                                <div className="absolute bottom-8 left-8">
                                    <span className="px-3 py-1 bg-teal-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block">
                                        {selectedListing.type}
                                    </span>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{selectedListing.title}</h3>
                                </div>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Value</p>
                                        <p className="text-2xl font-black text-slate-900">${selectedListing.price || selectedListing.goal_amount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedListing.category || 'Uncategorized'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Executive Summary</p>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{selectedListing.description}"</p>
                                </div>

                                {selectedListing.metadata && (
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                                        {Object.entries(selectedListing.metadata).map(([key, val]: [string, any]) => (
                                            key !== 'image' && (
                                                <div key={key}>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{key.replace('_', ' ')}</p>
                                                    <p className="text-[10px] font-bold text-slate-800">{String(val)}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <Link
                                    href={selectedListing.type === 'service' ? '#' : `/listings/${selectedListing.id}/edit`}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-xl shadow-slate-200"
                                >
                                    Refine Listing ➔
                                </Link>
                                <Link
                                    target="_blank"
                                    href={`/listings/${selectedListing.id}`}
                                    className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center"
                                >
                                    Public View
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pt-12 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                                {subscription && subscription.status === 'active' && (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${subscription.tier_name === 'enterprise' ? 'bg-indigo-600 text-white' :
                                        subscription.tier_name === 'premium' ? 'bg-teal-600 text-white' :
                                            subscription.tier_name === 'vip' ? 'bg-amber-500 text-white' :
                                                'bg-slate-200 text-slate-600'
                                        }`}>
                                        {subscription.tier_name}
                                    </span>
                                )}
                                {viewMode === 'vendor' && activeStore && (
                                    <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Vendor ID: {activeStore.store_id || activeStore.id}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
                                <p className="text-slate-500 dark:text-slate-300 font-medium">Welcome back, {user?.name} 👋</p>
                                {viewMode === 'vendor' && stores.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* Store Selector */}
                                        <div className="relative group">
                                            <select
                                                value={activeStoreId || ''}
                                                onChange={(e) => setActiveStoreId(Number(e.target.value))}
                                                className="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 pr-10 text-[10px] font-black uppercase tracking-widest hover:border-teal-500 focus:outline-none transition-all shadow-sm cursor-pointer"
                                            >
                                                {stores.map(s => {
                                                    const sid = s.store_id || s.id;
                                                    return (
                                                        <option key={sid} value={sid}>{s.name}</option>
                                                    );
                                                })}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                ▼
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setActiveTab('settings')}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                                            >
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('branding')}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                                            >
                                                Edit Store
                                            </button>
                                            {activeStoreId && (
                                                <Link href={`/store/${stores.find(s => (s.store_id || s.id) === activeStoreId)?.slug || ''}`}>
                                                    <button className="px-4 py-2 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-all">
                                                        View Storefront
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <RoleSwitcher
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            showDriverView={user?.role === 'driver' || !!user?.is_verified_driver}
                            showVendorView={['vendor', 'admin'].includes(user?.role || '') || user?.role === 'creator'}
                        />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-8">
                {viewMode === 'vendor' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        <Link href="/create?type=product" className="p-6 bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-3 group text-center">
                            <span className="text-3xl p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-all">📦</span>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Add Product</p>
                                <p className="text-[9px] text-slate-400 font-medium">List a new item</p>
                            </div>
                        </Link>
                        <Link href="/create?type=service" className="p-6 bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-3 group text-center">
                            <span className="text-3xl p-3 bg-indigo-50 rounded-2xl group-hover:scale-110 transition-all">🛠️</span>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Post Service</p>
                                <p className="text-[9px] text-slate-400 font-medium">Offer your skills</p>
                            </div>
                        </Link>
                        <Link href="/campaigns/new" className="p-6 bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-3 group text-center">
                            <span className="text-3xl p-3 bg-rose-50 rounded-2xl group-hover:scale-110 transition-all">📣</span>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Start Campaign</p>
                                <p className="text-[9px] text-slate-400 font-medium">Raise island funds</p>
                            </div>
                        </Link>
                        <Link href="/start" className="p-6 bg-slate-900 rounded-4xl shadow-xl shadow-slate-200 border border-slate-800 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group text-center">
                            <span className="text-3xl p-3 bg-slate-800 rounded-2xl group-hover:rotate-12 transition-all">✨</span>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white tracking-widest">Creation Hub</p>
                                <p className="text-[9px] text-slate-400 font-medium">Launch more</p>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Tab Switcher */}
                <div className="flex overflow-x-auto gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 sticky top-20 z-10 max-w-full scrollbar-hide">
                    {[
                        ...(viewMode === 'driver' ? [
                            { id: 'driver-hub', label: 'Driver Hub', icon: '🚖' },
                            { id: 'driver-verification', label: 'Verification', icon: '✅' },
                            { id: 'wallet', label: 'Earnings', icon: '💰' }
                        ] : viewMode === 'vendor' ? [
                            { id: 'overview', label: 'Overview', icon: '📊' },
                            { id: 'activity', label: ['Service', 'Services'].includes(activeStore?.category) ? 'My Profile' : 'My Listings', icon: '💎' },
                            { id: 'delivery', label: 'Delivery Dispatch', icon: '📦' },
                            { id: 'shipping', label: 'Shipping & Tracking', icon: '🌍' },
                            { id: 'branding', label: 'Store Branding', icon: '🎨' },
                            { id: 'menu', label: ['Service', 'Services'].includes(activeStore?.category) ? 'Service Catalogue' : 'Menu Builder', icon: ['Service', 'Services'].includes(activeStore?.category) ? '📋' : '🍴' },
                            { id: 'promotions', label: 'Offers & Promos', icon: '🎟️' },
                            { id: 'orders', label: 'Sales & Bookings', icon: '🔥' },
                            { id: 'reviews', label: 'Reviews', icon: '⭐' },
                            { id: 'wallet', label: 'Financial Hub', icon: '💰' },
                            { id: 'payouts', label: 'Payouts & Wallet', icon: '💸' },
                            { id: 'messages', label: 'Inboxes', icon: '💬' },
                            ...(!user?.is_verified_driver ? [
                                { id: 'become-driver', label: 'Become a Driver', icon: '🚕' }
                            ] : [])
                        ] : [
                            { id: 'activity', label: 'Activity', icon: '💎' },
                            { id: 'shipping', label: 'Shipping & Tracking', icon: '🌍' },
                            { id: 'posts', label: 'Broadcasts', icon: '🚀' },
                            { id: 'settings', label: 'My Profile', icon: '👤' },
                            { id: 'messages', label: 'Inboxes', icon: '💬' },
                            ...(!user?.is_verified_driver ? [
                                { id: 'become-driver', label: 'Become a Driver', icon: '🚕' }
                            ] : [])
                        ])
                    ].map((tab) => (
                        tab.id === 'payouts' ? (
                            <Link
                                key={tab.id}
                                href="/dashboard/vendor/payouts"
                                className="px-6 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap text-slate-400 hover:text-slate-600"
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </Link>
                        ) : (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        )
                    ))}
                </div>

                {/* Subscription Management Banner */}
                {subscription && subscription.status === 'active' && activeTab === 'activity' && (
                    <div className="bg-linear-to-r from-indigo-50 to-teal-50 rounded-4xl border border-indigo-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">🎫</div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">You're on the <span className="text-indigo-600 uppercase tracking-widest">{subscription.tier_name}</span> plan</h3>
                                <p className="text-slate-500 dark:text-slate-300 font-medium">Your next billing date is {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                                {subscription.cancel_at_period_end && (
                                    <p className="text-rose-500 text-xs font-black uppercase mt-1">Pending Cancellation</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {activeStore?.slug && (
                                <Link href={`/store/${activeStore.slug}`} className="px-8 py-5 bg-white text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-slate-50 transition-all">
                                    Preview Storefront
                                </Link>
                            )}
                            {!subscription.cancel_at_period_end && (
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to cancel your subscription? You will keep your benefits until the end of the period.')) {
                                            try {
                                                await api.post(`/${viewMode}-subscriptions/cancel`);
                                                toast.success('Subscription will be cancelled at the end of the period.');
                                                window.location.reload();
                                            } catch (e) {
                                                toast.error('Failed to cancel subscription.');
                                            }
                                        }
                                    }}
                                    className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden min-h-[500px]">
                    <div className="p-6 sm:p-10">
                        {activeTab === 'overview' && viewMode === 'vendor' && (
                            <VendorOverview
                                subscription={subscription}
                                stores={stores}
                                activeStore={activeStore}
                                listingCount={myListings.length}
                                requestCount={myRequests.length}
                                vendorId={activeStore?.id}
                            />
                        )}
                        {activeTab === 'activity' && (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {viewMode === 'vendor' ? 'My Active Listings' : 'Transaction History'}
                                    </h2>
                                    {viewMode === 'vendor' && (
                                        <Link
                                            href="/create"
                                            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-teal-100"
                                        >
                                            <span>+</span> Create New Listing
                                        </Link>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="py-20 text-center">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600" />
                                        <p className="mt-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Hydrating data...</p>
                                    </div>
                                ) : viewMode === 'vendor' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myListings.length > 0 ? (
                                            myListings.map(listing => (
                                                <ListingCard
                                                    key={listing.id}
                                                    listing={listing}
                                                    onClick={() => {
                                                        setSelectedListing(listing);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                <div className="text-5xl mb-4">✨</div>
                                                <h3 className="text-xl font-black text-slate-800 dark:text-white">No Listings Found</h3>
                                                <p className="text-slate-500 dark:text-slate-300 font-medium mb-8">Start your journey by creating your first showcase.</p>
                                                <Link
                                                    href="/create"
                                                    className="px-8 py-4 bg-teal-600 text-white dark:bg-teal-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl dark:shadow-teal-900/20 shadow-teal-100"
                                                >
                                                    Deploy Listing
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* My Logistics Requests Section */}
                                        {myRequests.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest">My Requests</h3>
                                                {myRequests.map((request: any) => {
                                                    const statusConfig: Record<string, { icon: string; color: string; label: string }> = {
                                                        pending: { icon: '⏳', color: 'bg-amber-100 text-amber-700', label: 'Finding Driver' },
                                                        accepted: { icon: '✅', color: 'bg-teal-100 text-teal-700', label: 'Driver Assigned' },
                                                        in_progress: { icon: '🚚', color: 'bg-indigo-100 text-indigo-700', label: 'In Transit' },
                                                        completed: { icon: '🏁', color: 'bg-slate-100 text-slate-700', label: 'Completed' },
                                                        cancelled: { icon: '❌', color: 'bg-rose-100 text-rose-700', label: 'Cancelled' }
                                                    };
                                                    const status = statusConfig[request.transport_status] || statusConfig.pending;
                                                    const serviceIcon = request.service_type === 'taxi' ? '🚖' : request.service_type === 'pickup' ? '🛻' : '📦';

                                                    return (
                                                        <div key={request.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">
                                                                        {serviceIcon}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-black text-slate-800">{request.title}</div>
                                                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                                            {new Date(request.created_at).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-black text-slate-900 dark:text-white text-lg">${Number(request.price || 0).toFixed(2)}</div>
                                                                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-1 ${status.color}`}>
                                                                        {status.icon} {status.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {/* Chat button for active deliveries */}
                                                            {request.driver_id && ['accepted', 'in_progress'].includes(request.transport_status) && (
                                                                <button
                                                                    onClick={() => setChatRequest(request)}
                                                                    className="mt-4 w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    💬 Chat with Driver
                                                                </button>
                                                            )}
                                                            {/* Rating button for completed deliveries */}
                                                            {request.transport_status === 'completed' && !request.is_rated && (
                                                                <button
                                                                    onClick={() => setRatingRequest(request)}
                                                                    className="mt-4 w-full py-3 bg-amber-50 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    ⭐ Rate Driver
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Donations/Orders Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest">Orders & Donations</h3>

                                            {/* Orders Display */}
                                            {orders.length > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Purchases</p>
                                                    {orders.map((order: any) => {
                                                        const statusConfig: Record<string, { icon: string; color: string; label: string }> = {
                                                            pending: { icon: '⏳', color: 'bg-amber-100 text-amber-700', label: 'Pending' },
                                                            paid: { icon: '💰', color: 'bg-green-100 text-green-700', label: 'Paid' },
                                                            preparing: { icon: '👨‍🍳', color: 'bg-blue-100 text-blue-700', label: 'Preparing' },
                                                            ready: { icon: '✅', color: 'bg-teal-100 text-teal-700', label: 'Ready' },
                                                            fulfilled: { icon: '🎉', color: 'bg-purple-100 text-purple-700', label: 'Completed' },
                                                            cancelled: { icon: '❌', color: 'bg-rose-100 text-rose-700', label: 'Cancelled' }
                                                        };
                                                        const status = statusConfig[order.status] || statusConfig.pending;
                                                        const itemCount = order.items ? order.items.length : 0;

                                                        return (
                                                            <Link key={order.order_id} href={`/dashboard/orders/${order.order_id}`} className="block">
                                                                <div className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-center hover:shadow-md transition-all hover:bg-slate-50">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-xl">🛒</div>
                                                                        <div>
                                                                            <div className="font-black text-slate-800">Order #{order.order_id}</div>
                                                                            <div className="text-xs text-slate-500">
                                                                                {itemCount} item{itemCount !== 1 ? 's' : ''} • {new Date(order.created_at).toLocaleDateString()}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-black text-slate-900 dark:text-white text-lg">${Number(order.total_amount || 0).toFixed(2)}</div>
                                                                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-1 ${status.color}`}>
                                                                            {status.icon} {status.label}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Logistics / Bookings Display */}
                                            {myRequests.length > 0 && (
                                                <div className="space-y-3 mt-6">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Bookings & Rides</p>
                                                    {myRequests.map((request: any) => {
                                                        const statusConfig: Record<string, { icon: string; color: string; label: string }> = {
                                                            pending: { icon: '⏳', color: 'bg-amber-100 text-amber-700', label: 'Finding Driver' },
                                                            accepted: { icon: '✅', color: 'bg-teal-100 text-teal-700', label: 'Driver Assigned' },
                                                            in_progress: { icon: '🚚', color: 'bg-indigo-100 text-indigo-700', label: 'In Transit' },
                                                            completed: { icon: '🏁', color: 'bg-slate-100 text-slate-700', label: 'Completed' },
                                                            cancelled: { icon: '❌', color: 'bg-rose-100 text-rose-700', label: 'Cancelled' }
                                                        };
                                                        const status = statusConfig[request.transport_status] || statusConfig.pending;
                                                        const serviceIcon = request.service_type === 'taxi' ? '🚖' : request.service_type === 'pickup' ? '🛻' : '📦';

                                                        return (
                                                            <div key={request.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab('portal')}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-sm">{serviceIcon}</div>
                                                                    <div>
                                                                        <div className="font-black text-slate-800 dark:text-white capitalize">{request.service_type} Request</div>
                                                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">#{request.id} • {new Date(request.created_at).toLocaleDateString()}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-black text-slate-900 dark:text-white text-lg">${Number(request.price || 0).toFixed(2)}</div>
                                                                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-1 ${status.color}`}>
                                                                        {status.icon} {status.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Donations Display */}
                                            {donations.length > 0 && (
                                                <div className="space-y-3 mt-6">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Donations</p>
                                                    {donations.map((donation: any) => (
                                                        <div key={donation.transaction_id || donation.id} className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex justify-between items-center hover:bg-white transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center text-xl">🎁</div>
                                                                <div>
                                                                    <div className="font-black text-slate-800">{donation.campaign_title || 'Community Contribution'}</div>
                                                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date(donation.created_at).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                            <div className="font-black text-teal-600 text-lg">${Number(donation.amount).toLocaleString()}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {orders.length === 0 && donations.length === 0 && myRequests.length === 0 && (
                                                <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <div className="text-5xl mb-4">🏝️</div>
                                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Quiet Waters...</h3>
                                                    <p className="text-slate-500 dark:text-slate-300 font-medium">Support a cause or shop to see your activity history here.</p>
                                                    <Link href="/listings" className="mt-6 inline-block px-8 py-4 bg-teal-600 text-white dark:bg-teal-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl dark:shadow-teal-900/20">
                                                        Browse Hub
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'settings' && <ProfileSettings />}
                        {activeTab === 'posts' && <CommunityPosts />}
                        {activeTab === 'branding' && <VendorBranding storeId={activeStoreId || undefined} />}
                        {activeTab === 'menu' && <MenuManagement storeId={activeStoreId || undefined} />}
                        {activeTab === 'portal' && (
                            viewMode === 'driver' ? <DriverPortal /> : <LogisticsHub />
                        )}
                        {activeTab === 'orders' && activeStoreId && <VendorOrders storeId={activeStoreId} category={activeStore?.category} />}
                        {activeTab === 'promotions' && <VendorPromotions storeId={activeStoreId || undefined} />}
                        {activeTab === 'reviews' && <VendorReviews storeId={activeStoreId || undefined} />}
                        {activeTab === 'wallet' && <WalletTab storeId={viewMode === 'vendor' ? activeStoreId || undefined : undefined} />}
                        {activeTab === 'delivery' && viewMode === 'vendor' && <DeliveryDispatch storeId={activeStoreId ? String(activeStoreId) : undefined} />}
                        {activeTab === 'shipping' && <ShippingTracking />}
                        {activeTab === 'become-driver' && <BecomeDriver />}
                        {activeTab === 'driver-hub' && viewMode === 'driver' && <DriverPortal />}
                        {activeTab === 'driver-verification' && viewMode === 'driver' && <DriverVerification />}
                        {activeTab === 'messages' && (
                            <div className="py-2">
                                <MessageCenter />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logistics Modals */}
            <AnimatePresence>
                {chatRequest && (
                    <DeliveryChat
                        deliveryId={chatRequest.id}
                        otherUserId={chatRequest.driver_id}
                        otherUserName={chatRequest.driver_name || 'Driver'}
                        onClose={() => setChatRequest(null)}
                    />
                )}
                {ratingRequest && (
                    <RatingModal
                        deliveryId={ratingRequest.id}
                        driverName={ratingRequest.driver_name || 'Driver'}
                        onClose={() => setRatingRequest(null)}
                        onSuccess={() => {
                            setRatingRequest(null);
                            // Refresh requests to update is_rated status
                            const fetchData = async () => {
                                try {
                                    const requestsRes = await api.get(`/listings?creator_id=${user?.id}&service_type=taxi,delivery,pickup`);
                                    const logisticsRequests = (Array.isArray(requestsRes.data) ? requestsRes.data : requestsRes.data?.listings || [])
                                        .filter((l: any) => ['taxi', 'delivery', 'pickup'].includes(l.service_type));
                                    setMyRequests(logisticsRequests);
                                } catch (e) { console.error(e); }
                            };
                            fetchData();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

