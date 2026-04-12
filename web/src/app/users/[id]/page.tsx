'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ListingCard from '@/components/ListingCard';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'activity' | 'driver' | 'vendor' | 'listings' | 'reviews'>('activity');
    const { user: currentUser, isAuthenticated } = useAuthStore();
    const isOwner = isAuthenticated && (currentUser?.id === Number(id) || currentUser?.id === profile?.user_id);

    const [listings, setListings] = useState<any[]>([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditingDriver, setIsEditingDriver] = useState(false);
    const [driverFormData, setDriverFormData] = useState({
        license_number: '',
        vehicle_type: '',
        vehicle_plate: '',
        vehicle_color: '',
        vehicle_seating: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                setProfile(res.data);
                setDriverFormData({
                    license_number: res.data.license_number || '',
                    vehicle_type: res.data.vehicle_type || '',
                    vehicle_plate: res.data.vehicle_plate || '',
                    vehicle_color: res.data.vehicle_color || '',
                    vehicle_seating: res.data.vehicle_seating || ''
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'listings') {
            fetchListings(page);
        }
    }, [activeTab, page]);

    const fetchListings = async (pageNum = 1) => {
        try {
            setListingsLoading(true);
            const res = await api.get(`/listings?creator_id=${id}&page=${pageNum}&limit=6`);
            if (res.data.listings) {
                setListings(res.data.listings);
                setTotalPages(res.data.totalPages);
            } else {
                setListings(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to fetch listings:', err);
        } finally {
            setListingsLoading(false);
        }
    };

    const handleDriverUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/update', driverFormData);
            setProfile({ ...profile, ...res.data });
            setIsEditingDriver(false);
            toast.success('Driver profile updated!');
        } catch (err) {
            console.error('Update failed:', err);
            toast.error('Failed to update driver info');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">User not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-colors duration-1000"
                    style={{
                        backgroundColor: profile.banner_color || '#0d9488',
                        backgroundImage: profile.banner_image_url ? `url(${getImageUrl(profile.banner_image_url)})` : 'none',
                    }}
                >
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10">
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">

                    {/* Avatar Group */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] p-1.5 bg-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out">
                            <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-slate-100 flex items-center justify-center">
                                {profile.avatar_url || profile.profile_photo_url ? (
                                    <button onClick={() => setLightboxOpen(true)} className="w-full h-full cursor-zoom-in">
                                        <img
                                            src={getImageUrl(profile.avatar_url || profile.profile_photo_url)}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ) : (
                                    <span className="text-4xl font-black text-slate-300">{profile.name?.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 pt-2 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">{profile.name}</h1>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                    {profile.email}
                                    <span className="text-slate-300">•</span>
                                    Joined {new Date(profile.created_at).getFullYear()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <span className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border border-transparent ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                    profile.role === 'moderator' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                        profile.role === 'vendor' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                                            profile.role === 'creator' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                                                profile.role === 'donor' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                    {profile.role}
                                </span>
                                {profile.role === 'vendor' && (
                                    <button
                                        onClick={() => router.push(`/store/${profile.slug}`)}
                                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                    >
                                        Visit Store
                                    </button>
                                )}
                                {isOwner && (
                                    <Link
                                        href="/dashboard?tab=settings"
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                                    >
                                        <span>✏️</span> Edit Profile
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {[
                                { label: 'Reputation', value: 'New', icon: '⭐' },
                                { label: 'Response', value: '100%', icon: '⚡' },
                                { label: 'Orders', value: '0', icon: '📦' },
                                { label: 'Status', value: 'Verified', icon: '✅' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all cursor-default">
                                    <div className="text-xl mb-1">{stat.icon}</div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                                    <div className="font-bold text-slate-900">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <h3 className="font-black text-slate-900 text-lg mb-6">About User</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Email</div>
                                        <div className="truncate max-w-[150px]">{profile.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Joined</div>
                                        <div>{new Date(profile.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Feed / Tabs */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden min-h-[500px] shadow-sm">
                            <div className="border-b border-slate-100 flex overflow-x-auto bg-slate-50/30 scrollbar-hide">
                                <div className="flex min-w-full md:min-w-0">
                                    {[
                                        { id: 'activity', label: 'Activity', icon: '🌊' },
                                        { id: 'driver', label: 'Driver Profile', icon: '🚖', show: profile.role === 'driver' || profile.is_verified_driver || profile.vehicle_type },
                                        { id: 'vendor', label: 'Vendor Shop', icon: '🏪', show: profile.role === 'vendor' },
                                        { id: 'listings', label: 'Listings', icon: '🏷️' },
                                        { id: 'reviews', label: 'Reviews', icon: '⭐' }
                                    ].filter(t => t.show !== false).map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-6 md:px-8 py-4 md:py-5 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                                ? 'text-teal-600 border-teal-500 bg-white'
                                                : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                {activeTab === 'activity' && (
                                    <div className="text-center py-12">
                                        <div className="inline-block p-6 rounded-full bg-slate-50 mb-6 animate-pulse">
                                            <div className="text-5xl opacity-50">🌊</div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Whatever floats your boat</h3>
                                        <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                            {profile.name} hasn't posted any public updates recently. Check back later for community activity.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'driver' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                            {/* Vehicle Card */}
                                            <div className="w-full md:w-64 aspect-square rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 flex items-center justify-center relative overflow-hidden group shadow-inner">
                                                <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                {profile.vehicle_type ? (
                                                    <img
                                                        src={`/assets/vehicles/${profile.vehicle_type}.png`}
                                                        alt={profile.vehicle_type}
                                                        className="w-full h-full object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <span className="text-6xl grayscale opacity-20">🚖</span>
                                                )}
                                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm z-20">
                                                    {profile.vehicle_type || 'No Vehicle'}
                                                </div>
                                            </div>

                                            {/* Driver Details */}
                                            <div className="flex-1 space-y-6 w-full">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 mb-1">Professional Driver</h3>
                                                        <p className="text-slate-500 font-medium">Verified Logistics Partner</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${profile.is_verified_driver ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                            {profile.is_verified_driver ? '✓ Verified' : 'Pending Verification'}
                                                        </div>
                                                        {isOwner && (
                                                            <button
                                                                onClick={() => setIsEditingDriver(true)}
                                                                className="text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest underline underline-offset-4"
                                                            >
                                                                Edit Driver Info
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-teal-200 select-none overflow-hidden">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plate</p>
                                                        <p className="font-bold text-slate-900 truncate">{profile.vehicle_plate || '••••••'}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-teal-200 select-none overflow-hidden">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Color</p>
                                                        <p className="font-bold text-slate-900 capitalize truncate">{profile.vehicle_color || '-'}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-teal-200 select-none overflow-hidden">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seats</p>
                                                        <p className="font-bold text-slate-900 truncate">{profile.vehicle_seating || '-'}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-teal-200 select-none overflow-hidden">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class</p>
                                                        <p className="font-bold text-slate-900 capitalize truncate">{profile.vehicle_type || '-'}</p>
                                                    </div>
                                                </div>

                                                {/* License Number (Visible to owner or admin) */}
                                                {isOwner && (
                                                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl">
                                                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">License Number</p>
                                                        <p className="font-mono font-bold tracking-widest">{profile.license_number || 'NOT PROVIDED'}</p>
                                                    </div>
                                                )}

                                                <div className="p-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl text-white shadow-xl shadow-teal-500/10">
                                                    <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Quick Stats</p>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-2xl font-black">4.92</p>
                                                            <p className="text-[10px] font-bold opacity-80">Rating ⭐</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-black">150+</p>
                                                            <p className="text-[10px] font-bold opacity-80">Trips ✅</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-black">100%</p>
                                                            <p className="text-[10px] font-bold opacity-80">Score ⚡</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'vendor' && (
                                    <div className="text-center py-12">
                                        <div className="inline-block p-6 rounded-full bg-slate-50 mb-6">
                                            <div className="text-5xl">🏪</div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">{profile.name}'s Shop</h3>
                                        <p className="text-slate-400 max-w-sm mx-auto font-medium mb-8">
                                            Check out the amazing products and services offered by this vendor.
                                        </p>
                                        <button
                                            onClick={() => router.push(`/store/${profile.slug}`)}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                        >
                                            View Storefront 🚀
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'listings' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Public Listings</h3>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{listings.length} items found</span>
                                        </div>

                                        {listingsLoading ? (
                                            <div className="py-20 flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                            </div>
                                        ) : listings.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    {listings.map((item) => (
                                                        <ListingCard key={item.id} listing={item} />
                                                    ))}
                                                </div>
                                                {totalPages > 1 && (
                                                    <div className="mt-12 flex justify-center items-center gap-4">
                                                        <button
                                                            disabled={page === 1}
                                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-all text-slate-600"
                                                        >
                                                            ← Prev
                                                        </button>
                                                        <span className="text-xs font-black text-slate-400">Page {page} of {totalPages}</span>
                                                        <button
                                                            disabled={page === totalPages}
                                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-all text-slate-600"
                                                        >
                                                            Next →
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                                <span className="text-4xl mb-4 block">🏷️</span>
                                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No public listings yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="text-center py-12 text-slate-400">
                                        No reviews yet. Be the first to leave one!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Lightbox Modal */}
            {lightboxOpen && (profile.avatar_url || profile.profile_photo_url) && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={getImageUrl(profile.avatar_url || profile.profile_photo_url)}
                            alt={profile.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Edit Driver Modal */}
            {isEditingDriver && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">Edit Driver Details</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Vehicle & License Info</p>
                            <button onClick={() => setIsEditingDriver(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleDriverUpdate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Driver License #</label>
                                <input
                                    type="text"
                                    required
                                    value={driverFormData.license_number}
                                    onChange={(e) => setDriverFormData({ ...driverFormData, license_number: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                                    placeholder="Enter license number"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Color</label>
                                    <input
                                        type="text"
                                        value={driverFormData.vehicle_color}
                                        onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_color: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                                        placeholder="e.g. Silver / Black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Seating</label>
                                    <input
                                        type="number"
                                        value={driverFormData.vehicle_seating}
                                        onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_seating: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                                        placeholder="4"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Plate</label>
                                    <input
                                        type="text"
                                        required
                                        value={driverFormData.vehicle_plate}
                                        onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_plate: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                                        placeholder="P-1234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Category</label>
                                    <select
                                        value={driverFormData.vehicle_type}
                                        onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_type: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold appearance-none"
                                    >
                                        <option value="scooter">Scooter</option>
                                        <option value="car">Car / Sedan</option>
                                        <option value="suv">SUV / Minivan</option>
                                        <option value="truck">Truck / Van</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-teal-200 transition-all active:scale-[0.98]"
                            >
                                Save Changes 💾
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
