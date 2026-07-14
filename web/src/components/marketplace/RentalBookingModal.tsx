'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface RentalBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rental: any;
    storeId: number;
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function parseDate(str: string): Date {
    return new Date(str + 'T00:00:00');
}

function getDaysBetween(start: Date, end: Date): number {
    const ms = end.getTime() - start.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export const RentalBookingModal = ({ isOpen, onClose, rental, storeId }: RentalBookingModalProps) => {
    const [checkIn, setCheckIn] = useState<string>('');
    const [checkOut, setCheckOut] = useState<string>('');
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    const pricePerDay = rental.price || rental.price_per_day || 0;
    const pricePerWeek = rental.price_per_week || 0;
    const days = checkIn && checkOut ? getDaysBetween(parseDate(checkIn), parseDate(checkOut)) : 0;
    
    // Calculate price with weekly discount if 7+ days
    const totalPrice = () => {
        if (days <= 0) return 0;
        if (days >= 7 && pricePerWeek > 0) {
            const weeks = Math.floor(days / 7);
            const remainingDays = days % 7;
            return weeks * pricePerWeek + remainingDays * pricePerDay;
        }
        return days * pricePerDay;
    };

    const total = totalPrice();

    // Min dates
    const minCheckIn = formatDate(new Date());
    const minCheckOut = checkIn ? formatDate(new Date(parseDate(checkIn).getTime() + 86400000)) : minCheckIn;

    const handleBooking = async () => {
        if (!checkIn || !checkOut || days <= 0) {
            setError('Please select valid check-in and check-out dates');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/orders', {
                store_id: storeId,
                items: [{
                    listing_id: rental.id,
                    quantity: days,
                    check_in: checkIn,
                    check_out: checkOut,
                    guests,
                    rental_period: 'day'
                }],
                total: total
            });
            onClose();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = (month: Date) => {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        return lastDay.getDate();
    };

    const firstDayOfMonth = (month: Date) => {
        return new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    };

    const getCalendarDays = (month: Date) => {
        const days = [];
        const totalDays = daysInMonth(month);
        const startDay = firstDayOfMonth(month);
        
        // Previous month days
        const prevMonth = new Date(month.getFullYear(), month.getMonth(), 0);
        for (let i = startDay - 1; i >= 0; i--) {
            const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
            days.push({ date, isCurrentMonth: false, isPast: date < new Date() });
        }
        
        // Current month days
        for (let d = 1; d <= totalDays; d++) {
            const date = new Date(month.getFullYear(), month.getMonth(), d);
            days.push({ date, isCurrentMonth: true, isPast: date < new Date() });
        }
        
        // Next month days to fill grid
        const nextMonthStart = 42 - days.length;
        for (let d = 1; d <= nextMonthStart; d++) {
            const date = new Date(month.getFullYear(), month.getMonth() + 1, d);
            days.push({ date, isCurrentMonth: false, isPast: date < new Date() });
        }
        
        return days;
    };

    const isDateSelected = (date: Date) => {
        if (!checkIn || !checkOut) return false;
        const d = date.getTime();
        return d >= parseDate(checkIn).getTime() && d <= parseDate(checkOut).getTime();
    };

    const isDateRangeEdge = (date: Date) => {
        if (!checkIn || !checkOut) return false;
        const d = date.getTime();
        return d === parseDate(checkIn).getTime() || d === parseDate(checkOut).getTime();
    };

    const selectDate = (date: Date) => {
        if (date < new Date()) return;
        const dateStr = formatDate(date);
        
        if (!checkIn || (checkIn && checkOut)) {
            // New selection
            setCheckIn(dateStr);
            setCheckOut('');
        } else if (dateStr >= checkIn) {
            setCheckOut(dateStr);
        } else {
            // Earlier than check-in, swap
            setCheckIn(dateStr);
            setCheckOut('');
        }
    };

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const calendarDays = getCalendarDays(currentMonth);

    if (!isOpen) return null;

    return (
        <Transition.Root show={isOpen} as={Dialog} onClose={onClose}>
            <Dialog.Panel className="relative z-50 max-w-lg mx-auto">
                <Transition.Child
                    as={motion.div}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 } as const}
                    className="bg-surface-elevated dark:bg-ink-primary rounded-3xl shadow-2xl border border-border-primary overflow-hidden"
                >
                    <div className="flex items-center justify-between p-5 border-b border-border-primary bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-t-3xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <EmojiIcon emoji="🏠" size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-white text-lg">{rental.title || rental.name}</h2>
                                <p className="text-white/70 text-xs">${pricePerDay}/day</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Date Selection */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-tertiary mb-3">Select Dates</label>
                            
                            {/* Check-in / Check-out Summary */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className={`bg-surface-secondary rounded-xl p-3 border ${checkIn ? 'border-teal-500/50' : 'border-border-primary'}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary">CHECK-IN</p>
                                    <p className="font-semibold text-primary">{checkIn ? new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select date'}</p>
                                </div>
                                <div className={`bg-surface-secondary rounded-xl p-3 border ${checkOut ? 'border-teal-500/50' : 'border-border-primary'}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary">CHECK-OUT</p>
                                    <p className="font-semibold text-primary">{checkOut ? new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select date'}</p>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="bg-surface-secondary rounded-xl p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 rounded hover:bg-surface-tertiary">
                                        <ChevronLeft size={20} className="text-primary" />
                                    </button>
                                    <span className="font-semibold text-primary">{monthName}</span>
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 rounded hover:bg-surface-tertiary">
                                        <ChevronRight size={20} className="text-primary" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-7 gap-0.5">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-center text-[10px] font-bold uppercase text-tertiary py-1">{d}</div>
                                    ))}
                                    {calendarDays.map((day, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectDate(day.date)}
                                            disabled={day.isPast || !day.isCurrentMonth}
                                            className={`aspect-square text-xs font-medium rounded-lg transition-all relative ${
                                                day.isPast || !day.isCurrentMonth ? 'text-tertiary/30 cursor-not-allowed' : 'text-primary hover:bg-teal-100 dark:hover:bg-teal-900/30'
                                            } ${isDateSelected(day.date) ? 'bg-teal-500 text-white' : ''} ${isDateRangeEdge(day.date) ? 'ring-2 ring-teal-500' : ''}`}
                                        >
                                            {day.date.getDate()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Guests */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-tertiary mb-2">Guests</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    disabled={guests <= 1}
                                    className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-primary hover:bg-teal-100 dark:hover:bg-teal-900/30 disabled:opacity-30"
                                >
                                    <span className="text-xl">−</span>
                                </button>
                                <span className="text-xl font-black text-primary w-12 text-center">{guests}</span>
                                <button
                                    onClick={() => setGuests(guests + 1)}
                                    className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-primary hover:bg-teal-100 dark:hover:bg-teal-900/30"
                                >
                                    <span className="text-xl">+</span>
                                </button>
                                <span className="text-sm text-tertiary flex-1 text-right">{guests} Guest{guests !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-teal-500/10 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-500/20">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-tertiary">${pricePerDay}/day × {days} day{days !== 1 ? 's' : ''}</span>
                                <span className="font-semibold">${days * pricePerDay}</span>
                            </div>
                            {pricePerWeek > 0 && days >= 7 && (
                                <div className="flex justify-between text-sm mb-2 text-emerald-600 dark:text-emerald-400">
                                    <span className="text-[10px] font-bold">Weekly discount applied!</span>
                                    <span className="font-semibold">−${(days * pricePerDay) - total}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-teal-500/20">
                                <span className="text-xs font-black uppercase tracking-widest text-tertiary">Total</span>
                                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs font-medium text-center bg-red-500/10 p-2 rounded-lg"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={loading || !checkIn || !checkOut || days <= 0}
                            className="w-full py-4 bg-teal-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-teal-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Booking...' : `Book Now — $${total.toFixed(2)}`}
                        </button>

                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-tertiary/60 italic">
                            IslandHub Secure Rental Protocol • Deposit held in escrow
                        </p>
                    </div>
                </Transition.Child>
            </Dialog.Panel>

            <Transition.Child
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />
        </Transition.Root>
    );
};

export default RentalBookingModal;