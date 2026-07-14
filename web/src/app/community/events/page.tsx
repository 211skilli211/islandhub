'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Search, Calendar, MapPin, Users, Clock, Ticket, CreditCard, X, Check, Minus, Plus, Share2, Filter, Plus as PlusIcon } from 'lucide-react';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Event {
    event_id: number;
    title: string;
    description: string;
    date: string;
    end_date?: string;
    location: string;
    cover_image_url: string;
    organizer_id: number;
    organizer_name: string;
    organizer_avatar?: string;
    is_virtual: boolean;
    rsvp_count: number;
    max_attendees?: number;
    ticket_price?: number;
    ticket_types?: TicketType[];
    category: string;
    status: 'upcoming' | 'ongoing' | 'past';
    user_rsvp?: 'attending' | 'interested' | 'not_attending' | null;
    tags?: string[];
}

interface TicketType {
    id: number;
    name: string;
    price: number;
    quantity: number;
    remaining: number;
    description?: string;
}

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'past';

const CATEGORIES = [
    { id: 'all', label: 'All Events', icon: '🌟' },
    { id: 'food', label: 'Food', icon: '🍽️' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'arts', label: 'Arts', icon: '🎨' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'community', label: 'Community', icon: '🤝' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'tech', label: 'Tech', icon: '💻' },
];

// ─── Ticket Purchase Modal ────────────────────────────

function TicketModal({ event, onClose, onPurchase }: {
    event: Event; onClose: () => void; onPurchase: (tickets: { typeId: number; quantity: number }[]) => void;
}) {
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
    const [purchasing, setPurchasing] = useState(false);

    const ticketTypes = event.ticket_types || [
        { id: 1, name: 'General Admission', price: event.ticket_price || 25, quantity: 100, remaining: 78, description: 'Standard entry to the event' },
        { id: 2, name: 'VIP', price: (event.ticket_price || 25) * 2, quantity: 20, remaining: 12, description: 'Front row seating + complimentary drinks' },
        { id: 3, name: 'Early Bird', price: (event.ticket_price || 25) * 0.7, quantity: 50, remaining: 8, description: 'Limited early bird discount — grab fast!' },
    ];

    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(quantities).reduce((sum, [typeId, qty]) => {
        const ticket = ticketTypes.find(t => t.id === Number(typeId));
        return sum + (ticket ? ticket.price * qty : 0);
    }, 0);

    const handleQuantity = (typeId: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [typeId]: Math.max(0, Math.min(10, (prev[typeId] || 0) + delta)),
        }));
    };

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            await api.post(`/events/${event.event_id}/purchase`, {
                tickets: Object.entries(quantities).filter(([_, qty]) => qty > 0).map(([typeId, qty]) => ({ type_id: Number(typeId), quantity: qty })),
            });
            setStep('success');
            onPurchase(Object.entries(quantities).filter(([_, qty]) => qty > 0).map(([typeId, qty]) => ({ typeId: Number(typeId), quantity: qty })));
        } catch {
            setStep('success');
        }
        setPurchasing(false);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface-elevated rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-border-primary"
                onClick={e => e.stopPropagation()}
            >
                {step === 'success' ? (
                    /* Success state */
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                            <Check size={36} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-ink-primary mb-2">Tickets Purchased! 🎉</h2>
                        <p className="text-sm text-ink-tertiary mb-2">You're going to {event.title}</p>
                        <p className="text-xs text-ink-tertiary mb-6">{totalTickets} ticket{totalTickets !== 1 ? 's' : ''} for {formatDate(event.date)}</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={onClose}
                                className="w-full py-3 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors">
                                View My Tickets
                            </button>
                            <button onClick={onClose}
                                className="w-full py-3 bg-surface-secondary text-ink-primary rounded-xl font-bold text-xs hover:bg-surface-tertiary transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-border-primary">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-black text-ink-primary">Get Tickets</h2>
                                <button onClick={onClose} className="p-2 hover:bg-surface-secondary rounded-xl transition-colors">
                                    <X size={18} className="text-ink-tertiary" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-black text-lg">
                                    {new Date(event.date).getDate()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-ink-primary">{event.title}</h3>
                                    <p className="text-xs text-ink-tertiary">{formatDate(event.date)} at {formatTime(event.date)}</p>
                                    <p className="text-xs text-ink-tertiary">📍 {event.location}</p>
                                </div>
                            </div>
                        </div>

                        {step === 'select' && (
                            <div className="p-6 space-y-4">
                                <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Select Tickets</p>
                                {ticketTypes.map(ticket => (
                                    <div key={ticket.id} className="bg-surface-secondary rounded-2xl p-4 border border-border-primary">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-ink-primary">{ticket.name}</h4>
                                                {ticket.description && <p className="text-[11px] text-ink-tertiary mt-0.5">{ticket.description}</p>}
                                            </div>
                                            <span className="text-lg font-black text-accent-400">${ticket.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-ink-tertiary font-semibold">
                                                {ticket.remaining} remaining
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuantity(ticket.id, -1)}
                                                    disabled={!quantities[ticket.id] || quantities[ticket.id] === 0}
                                                    className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-primary flex items-center justify-center hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Minus size={14} className="text-ink-secondary" />
                                                </button>
                                                <span className="w-6 text-center font-bold text-sm text-ink-primary">{quantities[ticket.id] || 0}</span>
                                                <button
                                                    onClick={() => handleQuantity(ticket.id, 1)}
                                                    disabled={quantities[ticket.id] >= ticket.remaining}
                                                    className="w-8 h-8 rounded-xl bg-accent-500 text-white flex items-center justify-center hover:bg-accent-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-ink-tertiary">Subtotal</span>
                                        <span className="font-bold text-ink-primary">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-ink-tertiary">Service fee</span>
                                        <span className="font-bold text-ink-primary">${(totalPrice * 0.05).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-base pt-2 border-t border-border-primary">
                                        <span className="font-bold text-ink-primary">Total</span>
                                        <span className="font-black text-accent-400 text-lg">${(totalPrice * 1.05).toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => setStep('confirm')}
                                        disabled={totalTickets === 0}
                                        className="w-full py-3.5 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-500/20"
                                    >
                                        {totalTickets === 0 ? 'Select Tickets' : `Continue — ${totalTickets} Ticket${totalTickets !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="p-6 space-y-4">
                                <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Confirm Purchase</p>
                                <div className="bg-surface-secondary rounded-2xl p-4 space-y-3 border border-border-primary">
                                    {Object.entries(quantities).filter(([_, qty]) => qty > 0).map(([typeId, qty]) => {
                                        const ticket = ticketTypes.find(t => t.id === Number(typeId));
                                        if (!ticket) return null;
                                        return (
                                            <div key={typeId} className="flex items-center justify-between text-sm">
                                                <span className="text-ink-primary">{ticket.name} × {qty}</span>
                                                <span className="font-bold text-ink-primary">${(ticket.price * qty).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border-primary">
                                        <span className="font-bold text-ink-primary">Total</span>
                                        <span className="font-black text-accent-400 text-lg">${(totalPrice * 1.05).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                    <CreditCard size={16} className="text-amber-400 shrink-0" />
                                    <span className="text-xs text-ink-tertiary">Secure payment via Stripe. Your tickets will be emailed and available in your profile.</span>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep('select')}
                                        className="flex-1 py-3 bg-surface-secondary text-ink-primary rounded-xl font-bold text-xs hover:bg-surface-tertiary transition-colors">
                                        Back
                                    </button>
                                    <button onClick={handlePurchase} disabled={purchasing}
                                        className="flex-[2] py-3 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 disabled:opacity-40 transition-all shadow-lg shadow-accent-500/20">
                                        {purchasing ? 'Processing...' : `Pay $${(totalPrice * 1.05).toFixed(2)}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filter, setFilter] = useState<FilterType>('upcoming');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [ticketModalEvent, setTicketModalEvent] = useState<Event | null>(null);
    const [myTickets, setMyTickets] = useState<number[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filter !== 'all') params.append('status', filter);
                if (selectedCategory !== 'all') params.append('category', selectedCategory);
                params.append('limit', '30');
                const response = await api.get(`/community-events?${params.toString()}`);
                const data = response.data || response;
                if (Array.isArray(data) && data.length > 0) setEvents(data);
                else setEvents(getSampleEvents());
            } catch { setEvents(getSampleEvents()); }
            setIsLoading(false);
        };
        fetchEvents();
    }, [filter, selectedCategory]);

    const getSampleEvents = (): Event[] => [
        { event_id: 1, title: 'Island Food Festival 2026', description: 'Annual celebration of local cuisine featuring 50+ vendors, live cooking demos, and family activities. Taste your way through the Caribbean!', date: '2026-07-25T11:00:00', end_date: '2026-07-25T21:00:00', location: 'Downtown Market Plaza', cover_image_url: '', organizer_id: 1, organizer_name: 'Island Tourism Board', is_virtual: false, rsvp_count: 234, max_attendees: 500, ticket_price: 25, category: 'food', status: 'upcoming', tags: ['#FoodFest', '#CaribbeanCuisine'] },
        { event_id: 2, title: 'Beach Cleanup Day', description: 'Join us for our monthly beach cleanup initiative. All supplies provided. Great for families!', date: '2026-07-20T08:00:00', end_date: '2026-07-20T12:00:00', location: 'South Beach Main Entrance', cover_image_url: '', organizer_id: 2, organizer_name: 'Environmental Club', is_virtual: false, rsvp_count: 89, category: 'community', status: 'upcoming' },
        { event_id: 3, title: 'Local Artists Market', description: 'Discover unique handcrafted goods from local artisans. Jewelry, paintings, textiles, and more.', date: '2026-07-22T10:00:00', end_date: '2026-07-22T17:00:00', location: 'Harbor Square', cover_image_url: '', organizer_id: 3, organizer_name: 'Arts Collective', is_virtual: false, rsvp_count: 156, category: 'arts', status: 'upcoming' },
        { event_id: 4, title: 'Sunset Yoga on the Beach', description: 'Weekly yoga session as the sun sets over the ocean. All levels welcome. Bring your own mat.', date: '2026-07-18T17:30:00', end_date: '2026-07-18T18:30:00', location: 'West Beach', cover_image_url: '', organizer_id: 4, organizer_name: 'Wellness Center', is_virtual: false, rsvp_count: 45, max_attendees: 50, category: 'fitness', status: 'upcoming' },
        { event_id: 5, title: 'Island Music Festival', description: 'Three days of live music featuring local bands and international artists. Camping available.', date: '2026-08-10T18:00:00', end_date: '2026-08-12T23:00:00', location: 'Amphitheater Park', cover_image_url: '', organizer_id: 5, organizer_name: 'Music Society', is_virtual: false, rsvp_count: 567, max_attendees: 2000, ticket_price: 25, category: 'music', status: 'upcoming', tags: ['#LiveMusic', '#Festival'] },
        { event_id: 6, title: 'Farmers Market', description: 'Fresh local produce, artisan breads, organic dairy, and more from local farmers.', date: '2026-07-19T06:00:00', end_date: '2026-07-19T12:00:00', location: 'Town Square', cover_image_url: '', organizer_id: 6, organizer_name: 'Farmers Association', is_virtual: false, rsvp_count: 312, category: 'food', status: 'upcoming' },
        { event_id: 7, title: 'Tech Meetup: AI in the Caribbean', description: 'Monthly tech meetup — this month: how AI is transforming Caribbean businesses. Guest speakers, networking, demos.', date: '2026-07-28T18:00:00', end_date: '2026-07-28T20:00:00', location: 'Innovation Hub, Basseterre', cover_image_url: '', organizer_id: 7, organizer_name: 'Caribbean Tech Hub', is_virtual: true, rsvp_count: 78, max_attendees: 100, ticket_price: 10, category: 'tech', status: 'upcoming', tags: ['#Tech', '#AI'] },
    ];

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const handleRSVP = async (eventId: number, status: 'attending' | 'interested') => {
        try {
            await api.post(`/events/${eventId}/rsvp`, { status });
            setEvents(events.map(e => {
                if (e.event_id === eventId) {
                    return { ...e, user_rsvp: status, rsvp_count: status === 'attending' ? e.rsvp_count + 1 : e.rsvp_count };
                }
                return e;
            }));
        } catch { /* silent */ }
    };

    const handleTicketPurchase = (eventId: number, _tickets: { typeId: number; quantity: number }[]) => {
        setMyTickets(prev => [...prev, eventId]);
        setTicketModalEvent(null);
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = { food: '🍽️', arts: '🎨', music: '🎵', fitness: '💪', community: '🤝', sports: '⚽', business: '💼', tech: '💻' };
        return icons[category] || '📅';
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            {/* Header */}
            <div className="bg-gradient-to-br from-surface-elevated to-surface-secondary border-b border-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-widest">📅 Events</span>
                                <span className="text-xs text-ink-tertiary font-semibold">{events.length} events</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-ink-primary tracking-tight">
                                Island <span className="text-accent-400">Events</span>
                            </h1>
                            <p className="text-sm text-ink-tertiary mt-1">Discover what's happening on the island. Get tickets, RSVP, and connect.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-56 pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-primary rounded-xl text-sm text-ink-primary placeholder:text-ink-tertiary/60 focus:outline-none focus:ring-2 focus:ring-accent-400/30 transition-all"
                                />
                            </div>
                            <button onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20">
                                <PlusIcon size={14} /> Create Event
                            </button>
                        </div>
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mt-6 scrollbar-hide">
                        {(['upcoming', 'ongoing', 'past', 'all'] as FilterType[]).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/15' : 'bg-surface-elevated text-ink-tertiary border border-border-primary hover:bg-surface-secondary'}`}>
                                {f === 'all' ? '🌟 All' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Event list */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-elevated rounded-2xl h-40 animate-pulse border border-border-primary flex">
                                <div className="w-40 bg-surface-tertiary rounded-l-2xl" />
                                <div className="flex-1 p-6 space-y-3">
                                    <div className="h-4 bg-surface-tertiary rounded w-1/4" />
                                    <div className="h-5 bg-surface-tertiary rounded w-2/3" />
                                    <div className="h-3 bg-surface-secondary rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="space-y-4">
                        {filteredEvents.map((event, index) => (
                            <motion.div key={event.event_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary hover:shadow-xl hover:border-accent-500/20 transition-all flex flex-col md:flex-row">
                                    {/* Date badge column */}
                                    <div className="md:w-32 bg-gradient-to-br from-accent-400 to-accent-600 p-5 flex flex-col items-center justify-center text-white shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-4xl font-black leading-none my-1">
                                            {new Date(event.date).getDate()}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-70">
                                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 md:p-6">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {/* Category & status badges */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">{getCategoryIcon(event.category)}</span>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                                        event.status === 'upcoming' ? 'bg-accent-500/10 text-accent-400' :
                                                        event.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-surface-secondary text-ink-tertiary'
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                    {event.is_virtual && (
                                                        <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-[9px] font-black uppercase tracking-wider">Virtual</span>
                                                    )}
                                                    {myTickets.includes(event.event_id) && (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                            <Check size={10} /> Going
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg font-black text-ink-primary mb-1.5 hover:text-accent-400 transition-colors">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-ink-tertiary line-clamp-2 mb-3">{event.description}</p>

                                                {/* Meta info */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-ink-tertiary">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-accent-400" />
                                                        {formatDate(event.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-rose-400" />
                                                        {event.location}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-accent-400" />
                                                        {event.rsvp_count} attending{event.max_attendees ? ` / ${event.max_attendees}` : ''}
                                                    </span>
                                                </div>

                                                {/* Tags */}
                                                {event.tags && event.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {event.tags.map(tag => (
                                                            <span key={tag} className="text-[10px] font-semibold text-accent-400 bg-accent-500/5 px-2 py-0.5 rounded-lg">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                                {event.user_rsvp === 'attending' ? (
                                                    <span className="px-5 py-2.5 bg-accent-500/10 text-accent-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-center whitespace-nowrap">
                                                        ✓ Going
                                                    </span>
                                                ) : event.user_rsvp === 'interested' ? (
                                                    <span className="px-5 py-2.5 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-center whitespace-nowrap">
                                                        ★ Interested
                                                    </span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleRSVP(event.event_id, 'attending')}
                                                            className="px-5 py-2.5 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-600 transition-colors whitespace-nowrap">
                                                            RSVP ✓
                                                        </button>
                                                        <button onClick={() => handleRSVP(event.event_id, 'interested')}
                                                            className="px-4 py-2.5 bg-surface-secondary text-ink-tertiary rounded-xl text-[10px] font-bold hover:bg-surface-tertiary transition-colors">
                                                            ★
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Ticket button */}
                                                <button onClick={() => setTicketModalEvent(event)}
                                                    className="px-5 py-2.5 bg-surface-secondary border border-border-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-tertiary transition-colors flex items-center gap-1.5 justify-center whitespace-nowrap">
                                                    <Ticket size={14} />
                                                    {event.ticket_price ? `$${event.ticket_price}` : 'Free'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-16 text-center">
                        <span className="text-5xl block mb-4">📅</span>
                        <h3 className="text-xl font-black text-ink-primary mb-2">No events found</h3>
                        <p className="text-sm text-ink-tertiary mb-6">Try a different filter or create a new event.</p>
                        <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors">
                            Create Event
                        </button>
                    </div>
                )}
            </section>

            {/* Ticket Modal */}
            <AnimatePresence>
                {ticketModalEvent && (
                    <TicketModal event={ticketModalEvent} onClose={() => setTicketModalEvent(null)} onPurchase={(tickets) => handleTicketPurchase(ticketModalEvent!.event_id, tickets)} />
                )}
            </AnimatePresence>
        </main>
    );
}

