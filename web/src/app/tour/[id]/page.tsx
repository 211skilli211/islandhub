'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function TourDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const tourId = params.id;

    const [tour, setTour] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [expandDescription, setExpandDescription] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['included']);

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await api.get(`/api/listings/${tourId}`);
                setTour(res.data);
            } catch (error) {
                console.error('Failed to fetch tour details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [tourId]);

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleBookTour = async () => {
        if (!selectedDate) {
            toast.error('Please select a date for your tour');
            return;
        }

        try {
            await addToCart(tour.id, {
                quantity: 1,
                appointmentSlot: selectedDate,
            });
            toast.success('Tour added to cart!');
            router.push('/checkout');
        } catch (error) {
            console.error('Failed to book tour:', error);
            toast.error('Failed to add tour to cart');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
    );

    if (!tour) return <div className="p-24 text-center">Experience not found.</div>;

    const mainImage = tour.images?.[0] || null;

    return (
        <main className="min-h-screen bg-white">
            {/* Immersive Header */}
            <section className="relative h-[60vh] flex items-end overflow-hidden bg-slate-900 px-6">
                <HeroBackground
                    pageKey={`tour-detail-${tourId}`}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-0" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-orange-900/20">
                            {tour.sub_category} Silo
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4 italic uppercase">
                            {tour.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/70 font-bold uppercase tracking-widest text-xs">
                            <span className="flex items-center gap-2">📍 {tour.location}</span>
                            <span className="flex items-center gap-2">⏳ {tour.duration}</span>
                            <span className="flex items-center gap-2">👥 Max {tour.capacity} Spots</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Content Column */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About Section */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-6">About the Experience</h2>
                        <div className={`prose prose-slate max-w-none text-slate-500 font-medium leading-relaxed italic ${!expandDescription ? 'line-clamp-4' : ''}`}>
                            {tour.description}
                        </div>
                        <button
                            onClick={() => setExpandDescription(!expandDescription)}
                            className="mt-4 text-orange-600 font-bold text-xs uppercase tracking-widest hover:underline"
                        >
                            {expandDescription ? 'Show Less' : 'Read Full Description'}
                        </button>
                    </section>

                    {/* Expandable Meta Sections */}
                    <div className="space-y-4">
                        {/* What's Included */}
                        <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50">
                            <button
                                onClick={() => toggleSection('included')}
                                className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-all focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🎁</span>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">What's Included</h3>
                                </div>
                                <span className={`transform transition-transform duration-300 font-black text-slate-400 ${expandedSections.includes('included') ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            <AnimatePresence>
                                {expandedSections.includes('included') && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(tour.addons || []).map((addon: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
                                                    <span className="text-emerald-500">✓</span>
                                                    <span className="text-sm font-bold text-slate-600 italic">{addon.name}</span>
                                                </div>
                                            ))}
                                            {(!tour.addons || tour.addons.length === 0) && (
                                                <p className="text-sm text-slate-400 font-medium italic">Standard equipment and guide provided.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Trip Requirements & Details */}
                        <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50">
                            <button
                                onClick={() => toggleSection('details')}
                                className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-all focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">📋</span>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">Important Info</h3>
                                </div>
                                <span className={`transform transition-transform duration-300 font-black text-slate-400 ${expandedSections.includes('details') ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            <AnimatePresence>
                                {expandedSections.includes('details') && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Operator / Vendor</h4>
                                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg">🛡️</div>
                                                    <div>
                                                        <div className="font-black text-slate-900 uppercase text-sm tracking-tight">{tour.vendor_name || 'Signature Tours'}</div>
                                                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Verified Multi-Silo Operator</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Meeting Point</h4>
                                                <p className="text-sm font-bold text-slate-600 italic">{tour.location}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Media Gallery (Compact for now) */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-6">Experience Gallery</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {tour.images?.map((img: string, i: number) => (
                                <div key={i} className="aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 group">
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Booking Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60">
                        <div className="mb-8">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2">Price Per Person</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">${tour.price}</span>
                                <span className="text-slate-400 font-bold italic tracking-tight uppercase text-xs">Full Access</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 ml-1">Select Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-orange-500 transition-all shadow-inner"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100/50 flex items-center gap-3">
                                <span className="text-xl">💳</span>
                                <div className="text-[10px] font-black uppercase tracking-widest text-orange-800">
                                    Only <span className="text-lg block tracking-tight">${(tour.price * 0.3).toFixed(2)} Deposit</span> required today
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBookTour}
                            disabled={!selectedDate}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Book Experience ➔
                        </button>
                        <p className="text-center text-[10px] text-slate-400 font-medium italic">Instant confirmation • Mobile tickets accepted</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
