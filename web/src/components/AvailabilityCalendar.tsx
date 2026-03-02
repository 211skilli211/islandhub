import React, { useState, useEffect } from 'react';
import api from '@/lib/api';


interface AvailabilitySlot {
    availability_id: number;
    listing_id: number;
    start_date: string;
    end_date: string;
    is_available: boolean;
}

interface AvailabilityCalendarProps {
    listingId: number;
    onDateSelect?: (date: Date) => void;
    selectedDate?: Date;
}

export default function AvailabilityCalendar({ listingId, onDateSelect, selectedDate }: AvailabilityCalendarProps) {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await api.get(`/api/rentals/${listingId}/availability`);
                setAvailability(res.data);
            } catch (err) {
                console.error("Failed to fetch availability", err);
            } finally {
                setLoading(false);
            }
        };

        if (listingId) {
            fetchAvailability();
        }
    }, [listingId]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Helper to check if a date has specific availability status
    // Default is usually "available", so we look for "blocked" ranges where is_available = false
    const getDateStatus = (day: number) => {
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        checkDate.setHours(0, 0, 0, 0);

        // Find applicable slot
        const slot = availability.find(s => {
            const start = new Date(s.start_date);
            const end = new Date(s.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return checkDate >= start && checkDate <= end;
        });

        if (slot) {
            return slot.is_available ? 'available' : 'blocked';
        }
        return 'unknown'; // Default state, maybe 'available' if we assume open unless blocked
    };

    return (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Availability</h3>
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-colors">
                        <span className="text-lg">←</span>
                    </button>
                    <span className="text-sm font-black text-slate-900">{monthName}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-colors">
                        <span className="text-lg">→</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const status = getDateStatus(day);
                    let bgClass = 'bg-white text-slate-900';

                    if (status === 'blocked') {
                        bgClass = 'bg-slate-200 text-slate-400 line-through cursor-not-allowed';
                    } else if (status === 'available') {
                        bgClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 cursor-pointer';
                    } else {
                        // Unknown/Default - assume available but neutral
                        bgClass = 'bg-white hover:bg-slate-100 cursor-pointer border border-transparent';
                    }

                    return (
                        <div
                            key={day}
                            className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${bgClass}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" /> Booked
                </div>
            </div>
        </div>
    );
}
