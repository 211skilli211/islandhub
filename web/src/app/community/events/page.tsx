'use client';
// refresh

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    end_date?: string;
    location: string;
    cover_image_url: string;
    organizer_id: number;
    organizer_name: string;
    is_virtual: boolean;
    rsvp_count: number;
    max_attendees?: number;
    ticket_price?: number;
    category: string;
    status: 'upcoming' | 'ongoing' | 'past';
    user_rsvp?: 'attending' | 'interested' | 'not_attending' | null;
}

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'past';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filter, setFilter] = useState<FilterType>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filter !== 'all') params.append('status', filter);
                params.append('limit', '20');

                const response = await api.get(`/community-events?${params.toString()}`);
                setEvents(response.data || response || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
                setEvents(getSampleEvents());
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [filter]);

    const getSampleEvents = (): Event[] => [
        {
            id: 1,
            title: 'Island Food Festival 2026',
            description: 'Annual celebration of local cuisine featuring 50+ vendors, live cooking demos, and family activities.',
            date: '2026-03-15T11:00:00',
            end_date: '2026-03-15T21:00:00',
            location: 'Downtown Market Plaza',
            cover_image_url: '',
            organizer_id: 1,
            organizer_name: 'Island Tourism Board',
            is_virtual: false,
            rsvp_count: 234,
            max_attendees: 500,
            category: 'food',
            status: 'upcoming'
        },
        {
            id: 2,
            title: 'Beach Cleanup Day',
            description: 'Join us for our monthly beach cleanup initiative. All supplies provided. Great for families!',
            date: '2026-03-20T08:00:00',
            end_date: '2026-03-20T12:00:00',
            location: 'South Beach Main Entrance',
            cover_image_url: '',
            organizer_id: 2,
            organizer_name: 'Environmental Club',
            is_virtual: false,
            rsvp_count: 89,
            category: 'community',
            status: 'upcoming'
        },
        {
            id: 3,
            title: 'Local Artists Market',
            description: 'Discover unique handcrafted goods from local artisans. Jewelry, paintings, textiles, and more.',
            date: '2026-03-22T10:00:00',
            end_date: '2026-03-22T17:00:00',
            location: 'Harbor Square',
            cover_image_url: '',
            organizer_id: 3,
            organizer_name: 'Arts Collective',
            is_virtual: false,
            rsvp_count: 156,
            category: 'arts',
            status: 'upcoming'
        },
        {
            id: 4,
            title: 'Sunset Yoga on the Beach',
            description: 'Weekly yoga session as the sun sets over the ocean. All levels welcome. Bring your own mat.',
            date: '2026-03-07T17:30:00',
            end_date: '2026-03-07T18:30:00',
            location: 'West Beach',
            cover_image_url: '',
            organizer_id: 4,
            organizer_name: 'Wellness Center',
            is_virtual: false,
            rsvp_count: 45,
            max_attendees: 50,
            category: 'fitness',
            status: 'upcoming'
        },
        {
            id: 5,
            title: 'Island Music Festival',
            description: 'Three days of live music featuring local bands and international artists.',
            date: '2026-04-10T18:00:00',
            end_date: '2026-04-12T23:00:00',
            location: 'Amphitheater Park',
            cover_image_url: '',
            organizer_id: 5,
            organizer_name: 'Music Society',
            is_virtual: false,
            rsvp_count: 567,
            max_attendees: 2000,
            ticket_price: 25,
            category: 'music',
            status: 'upcoming'
        },
        {
            id: 6,
            title: 'Farmers Market',
            description: 'Fresh local produce, artisan breads, organic dairy, and more from local farmers.',
            date: '2026-03-08T06:00:00',
            end_date: '2026-03-08T12:00:00',
            location: 'Town Square',
            cover_image_url: '',
            organizer_id: 6,
            organizer_name: 'Farmers Association',
            is_virtual: false,
            rsvp_count: 312,
            category: 'food',
            status: 'upcoming'
        }
    ];

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const handleRSVP = async (eventId: number, status: 'attending' | 'interested') => {
        try {
            await api.post(`/events/${eventId}/rsvp`, { status });
            setEvents(events.map(e => {
                if (e.id === eventId) {
                    return {
                        ...e,
                        user_rsvp: status,
                        rsvp_count: status === 'attending' ? e.rsvp_count + 1 : e.rsvp_count
                    };
                }
                return e;
            }));
        } catch (error) {
            console.error('Failed to RSVP:', error);
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            food: '🍽️',
            arts: '🎨',
            music: '🎵',
            fitness: '💪',
            community: '🤝',
            sports: '⚽',
            business: '💼'
        };
        return icons[category] || '📅';
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <HeroBackground pageKey="community" className="py-16">
                <div className="max-w-7xl mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10"
                    >
                        Community Events 🌴
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                    >
                        Discover Island Events
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-teal-50 text-xl max-w-2xl mx-auto mb-12 font-medium opacity-80 leading-relaxed"
                    >
                        From food festivals to yoga sessions, find your next adventure
                    </motion.p>
                </div>
            </HeroBackground>

            <section className="max-w-7xl mx-auto px-4 py-12">
                {/* Search and Create */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-white rounded-2xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        + Create Event
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 mb-8">
                    {(['upcoming', 'ongoing', 'past', 'all'] as FilterType[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {f === 'all' && '🌟'} {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Events List */}
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[3rem] h-48 animate-pulse flex">
                                <div className="w-48 bg-slate-200 rounded-l-[3rem]"></div>
                                <div className="flex-1 p-8">
                                    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-teal-500/10 transition-all flex flex-col md:flex-row"
                            >
                                {/* Date Box */}
                                <div className="md:w-48 bg-linear-to-br from-teal-400 to-teal-600 p-6 flex flex-col items-center justify-center text-white">
                                    <span className="text-4xl mb-2">{getCategoryIcon(event.category)}</span>
                                    <span className="font-black text-lg uppercase tracking-wider">
                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-4xl font-black">
                                        {new Date(event.date).getDate()}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-8">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.status === 'upcoming' ? 'bg-teal-50 text-teal-600' :
                                                    event.status === 'ongoing' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                                {event.is_virtual && (
                                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        📺 Virtual
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2 hover:text-teal-600 transition-colors">
                                                {event.title}
                                            </h3>
                                            <p className="text-slate-500 font-medium mb-4 line-clamp-2">
                                                {event.description}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-400">
                                                <span>📅 {formatDate(event.date)}</span>
                                                <span>📍 {event.location}</span>
                                                <span>👥 {event.rsvp_count} attending</span>
                                                {event.max_attendees && (
                                                    <span>🎫 {event.max_attendees - event.rsvp_count} spots left</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3">
                                            {event.user_rsvp ? (
                                                <div className="text-center">
                                                    <span className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${event.user_rsvp === 'attending' ? 'bg-teal-100 text-teal-700' :
                                                        'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {event.user_rsvp === 'attending' ? '✓ Going' : '★ Interested'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRSVP(event.id, 'attending')}
                                                        className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-colors"
                                                    >
                                                        RSVP ✓
                                                    </button>
                                                    <button
                                                        onClick={() => handleRSVP(event.id, 'interested')}
                                                        className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-colors"
                                                    >
                                                        Interested
                                                    </button>
                                                </div>
                                            )}
                                            {event.ticket_price && (
                                                <span className="text-center font-black text-teal-600">
                                                    ${event.ticket_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {filteredEvents.length === 0 && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-medium text-lg">No events found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-teal-600 font-black text-sm uppercase tracking-widest hover:underline"
                        >
                            Create the first event →
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
