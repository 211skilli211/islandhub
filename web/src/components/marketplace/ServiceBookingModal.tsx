'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';

interface ServiceBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: any;
    storeId: number;
}

export default function ServiceBookingModal({ isOpen, onClose, service, storeId }: ServiceBookingModalProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [bookingDate, setBookingDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    if (!service) return null;

    const toggleAddon = (addon: any) => {
        setSelectedAddons(prev =>
            prev.find(a => a.name === addon.name)
                ? prev.filter(a => a.name !== addon.name)
                : [...prev, addon]
        );
    };

    const calculateTotal = () => {
        const base = parseFloat(service.price);
        const addonsTotal = selectedAddons.reduce((acc, a) => acc + (parseFloat(a.price) || 0), 0);
        return base + addonsTotal;
    };

    const handleBooking = async () => {
        if (!bookingDate) {
            toast.error('Please select a date');
            return;
        }
        if (!selectedSlot) {
            toast.error('Please select a time slot');
            return;
        }

        setLoading(true);
        try {
            await addToCart(service.listing_id || 0, {
                itemId: service.service_id,
                quantity: 1,
                appointmentSlot: `${bookingDate} ${selectedSlot}`,
                selectedAddons: selectedAddons,
            });
            toast.success('Added to booking cart');
            onClose();
            router.push('/checkout');
        } catch (error) {
            console.error('Booking failed:', error);
            toast.error('Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    const slots = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                                <div className="absolute top-6 right-6 z-10">
                                    <button
                                        onClick={onClose}
                                        className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-8 md:p-12">
                                    <div className="mb-10">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            {service.image_url && (
                                                <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden flex-shrink-0 border-4 border-slate-50 shadow-xl">
                                                    <img src={getImageUrl(service.image_url)} className="w-full h-full object-cover" alt={service.service_name} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Service Booking</span>
                                                    <span className="text-slate-400 font-medium text-sm">⏱️ {service.duration}</span>
                                                </div>
                                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{service.service_name}</h2>
                                                <p className="mt-4 text-slate-500 font-medium text-lg leading-relaxed">{service.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Left Column: Date & Time + FAQs */}
                                        <div className="space-y-12">
                                            <div className="space-y-8">
                                                <div>
                                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                                                        <CalendarIcon className="w-4 h-4" /> Pick a Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={bookingDate}
                                                        onChange={(e) => setBookingDate(e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                                                        <ClockIcon className="w-4 h-4" /> Select Time Slot
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {slots.map(slot => (
                                                            <button
                                                                key={slot}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSlot === slot
                                                                    ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]'
                                                                    : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-indigo-200'
                                                                    }`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Service FAQs */}
                                            {service.faqs && service.faqs.length > 0 && (
                                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1 block">
                                                        Frequently Asked Questions
                                                    </label>
                                                    <div className="space-y-4">
                                                        {service.faqs.map((faq: any, idx: number) => (
                                                            <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                                                <p className="text-[10px] font-black uppercase text-slate-900 mb-2">Q: {faq.question}</p>
                                                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                                                    {faq.answer}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Addons Selection */}
                                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 h-fit">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 block">
                                                Recommended Addons
                                            </label>
                                            <div className="space-y-3">
                                                {(service.addons || []).map((addon: any) => {
                                                    const isSelected = selectedAddons.find(a => a.name === addon.name);
                                                    return (
                                                        <button
                                                            key={addon.name}
                                                            onClick={() => toggleAddon(addon)}
                                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isSelected
                                                                ? 'bg-indigo-600 text-white shadow-md'
                                                                : 'bg-white text-slate-700 hover:bg-white hover:shadow-sm'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isSelected ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4 text-slate-300" />}
                                                                <span className="font-bold text-[11px] uppercase tracking-tight">{addon.name}</span>
                                                            </div>
                                                            <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                                +${addon.price}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-slate-200/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</span>
                                                    <span className="font-bold text-slate-900">${service.price}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Due</span>
                                                    <span className="text-2xl font-black text-slate-900">${calculateTotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12">
                                        <button
                                            onClick={handleBooking}
                                            disabled={loading}
                                            className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-sm rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Adding to Cart...' : 'Confirm & Add Booking'}
                                        </button>
                                        <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                                            IslandHub Secure Booking Protocol Enabled
                                        </p>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
