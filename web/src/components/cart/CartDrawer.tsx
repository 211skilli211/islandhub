'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
    const { cart, loading, itemCount, totalAmount, updateQuantity, removeItem } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    const getImageUrl = (path?: string) => {
        if (!path) return '/placeholder-product.jpg';
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-white shadow-2xl">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                            <Dialog.Title className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <ShoppingCartIcon className="w-6 h-6 text-teal-600" />
                                                Cart ({itemCount})
                                            </Dialog.Title>
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                onClick={onClose}
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        {/* Cart Items */}
                                        <div className="flex-1 overflow-y-auto px-6 py-4">
                                            {loading && !cart ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                                </div>
                                            ) : cart && cart.items.length > 0 ? (
                                                <div className="space-y-4">
                                                    {cart.items.map((item) => (
                                                        <div key={item.item_id}>
                                                            <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                                {/* Image */}
                                                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                                                    <Image
                                                                        src={getImageUrl(item.image_url)}
                                                                        alt={item.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                    {item.donation_suggested && (
                                                                        <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                                                                            <span className="text-2xl">🎁</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className={`font-black uppercase tracking-tight truncate ${item.donation_suggested ? 'text-amber-600' : 'text-slate-900'}`}>{item.title}</h3>
                                                                        {item.donation_suggested && <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Donation</span>}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.store_name}</p>

                                                                    {/* Restaurant Selections */}
                                                                    {item.selected_variant && typeof item.selected_variant === 'object' && (
                                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                                            {Object.entries(item.selected_variant).map(([key, val]) => (
                                                                                <span key={key} className="text-[9px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-lg font-black uppercase tracking-tight">
                                                                                    {key}: {String(val)}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {item.selected_addons && Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                            {item.selected_addons.map((addon: any) => (
                                                                                <span key={addon.name} className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-black uppercase tracking-tight">
                                                                                    + {addon.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {item.selected_sides && Array.isArray(item.selected_sides) && item.selected_sides.length > 0 && (
                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                            {item.selected_sides.map((side: any) => (
                                                                                <span key={side.name} className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-black uppercase tracking-tight">
                                                                                    Side: {side.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Category-specific info */}
                                                                    {item.rental_start_date && (
                                                                        <p className="text-xs text-teal-600 mt-1">
                                                                            {new Date(item.rental_start_date).toLocaleDateString()} - {new Date(item.rental_end_date!).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                    {item.appointment_slot && (
                                                                        <p className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                                                                            <ClockIcon className="w-3 h-3" /> {item.appointment_slot}
                                                                        </p>
                                                                    )}
                                                                    {item.service_package && (
                                                                        <p className="text-xs text-teal-600 mt-1">Package: {item.service_package}</p>
                                                                    )}

                                                                    <div className="flex items-center justify-between mt-2">
                                                                        {/* Quantity Controls */}
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => updateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
                                                                                className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                                                                disabled={loading}
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                                            <button
                                                                                onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                                                                className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                                                                disabled={loading}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>

                                                                        {/* Price */}
                                                                        <span className="font-bold text-slate-900">
                                                                            ${(item.price_snapshot * item.quantity).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Remove Button */}
                                                                <button
                                                                    onClick={() => removeItem(item.item_id)}
                                                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                                    disabled={loading}
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>

                                                            {/* Side Suggestions */}
                                                            {item.side_ids && item.side_ids.length > 0 && (!item.selected_sides || item.selected_sides.length === 0) && (
                                                                <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Complete your meal?</p>
                                                                        <Link
                                                                            href={`/store/${item.store_slug}`}
                                                                            onClick={onClose}
                                                                            className="text-[9px] font-black uppercase text-indigo-500 hover:underline"
                                                                        >
                                                                            Add Sides +
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center">
                                                    <ShoppingCartIcon className="w-16 h-16 text-slate-300 mb-4" />
                                                    <p className="text-slate-600 font-medium">Your cart is empty</p>
                                                    <p className="text-sm text-slate-500 mt-1">Add items to get started</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {cart && cart.items.length > 0 && (
                                            <div className="border-t border-slate-200 px-6 py-4 space-y-4">
                                                {/* Total */}
                                                <div className="flex items-center justify-between text-lg font-bold">
                                                    <span className="text-slate-700">Total</span>
                                                    <span className="text-slate-900">${totalAmount.toFixed(2)} XCD</span>
                                                </div>

                                                {/* Checkout Button */}
                                                <button
                                                    onClick={handleCheckout}
                                                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                                                    disabled={loading}
                                                >
                                                    Proceed to Checkout
                                                </button>

                                                <button
                                                    onClick={onClose}
                                                    className="w-full py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                                                >
                                                    Continue Shopping
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root >
    );
}
