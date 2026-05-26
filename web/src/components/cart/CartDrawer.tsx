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
                    <div className="fixed inset-0 bg-ink-primary/50 backdrop-blur-sm transition-opacity" />
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
                                    <div className="flex h-full flex-col bg-surface-elevated shadow-2xl">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-border-primary px-6 py-4">
                                            <Dialog.Title className="text-xl font-bold text-ink-primary flex items-center gap-2">
                                                <ShoppingCartIcon className="w-6 h-6 text-accent-400" />
                                                Cart ({itemCount})
                                            </Dialog.Title>
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-ink-tertiary hover:text-ink-secondary hover:bg-surface-secondary transition-colors"
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
                                                            <div className="flex gap-4 p-4 bg-surface-secondary rounded-xl border border-border-primary">
                                                                {/* Image */}
                                                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-elevated">
                                                                    <Image
                                                                        src={getImageUrl(item.image_url)}
                                                                        alt={item.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                    {item.donation_suggested && (
                                                                        <div className="absolute inset-0 bg-sand-500/50/10 flex items-center justify-center">
                                                                            <span className="text-2xl">🎁</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className={`font-black uppercase tracking-tight truncate ${item.donation_suggested ? 'text-sand-500' : 'text-ink-primary'}`}>{item.title}</h3>
                                                                        {item.donation_suggested && <span className="text-[8px] bg-sand-500/10 text-sand-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Donation</span>}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest truncate">{item.store_name}</p>

                                                                    {/* Restaurant Selections */}
                                                                    {item.selected_variant && typeof item.selected_variant === 'object' && (
                                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                                            {Object.entries(item.selected_variant).map(([key, val]) => (
                                                                                <span key={key} className="text-[9px] bg-surface-elevated border border-border-primary text-ink-tertiary0 px-2 py-0.5 rounded-lg font-black uppercase tracking-tight">
                                                                                    {key}: {String(val)}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {item.selected_addons && Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                            {item.selected_addons.map((addon: any) => (
                                                                                <span key={addon.name} className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg font-black uppercase tracking-tight">
                                                                                    + {addon.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {item.selected_sides && Array.isArray(item.selected_sides) && item.selected_sides.length > 0 && (
                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                            {item.selected_sides.map((side: any) => (
                                                                                <span key={side.name} className="text-[9px] bg-[#818cf8]/10 text-[#818cf8] px-2 py-0.5 rounded-lg font-black uppercase tracking-tight">
                                                                                    Side: {side.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Category-specific info */}
                                                                    {item.rental_start_date && (
                                                                        <p className="text-xs text-accent-400 mt-1">
                                                                            {new Date(item.rental_start_date).toLocaleDateString()} - {new Date(item.rental_end_date!).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                    {item.appointment_slot && (
                                                                        <p className="text-[10px] text-[#818cf8] font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                                                                            <ClockIcon className="w-3 h-3" /> {item.appointment_slot}
                                                                        </p>
                                                                    )}
                                                                    {item.service_package && (
                                                                        <p className="text-xs text-accent-400 mt-1">Package: {item.service_package}</p>
                                                                    )}

                                                                    <div className="flex items-center justify-between mt-2">
                                                                        {/* Quantity Controls */}
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => updateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
                                                                                className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-primary flex items-center justify-center hover:bg-surface-secondary transition-colors"
                                                                                disabled={loading}
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                                            <button
                                                                                onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                                                                className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-primary flex items-center justify-center hover:bg-surface-secondary transition-colors"
                                                                                disabled={loading}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>

                                                                        {/* Price */}
                                                                        <span className="font-bold text-ink-primary">
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
                                                                <div className="mt-3 p-3 bg-[#818cf8]/10/50 rounded-xl border border-[#818cf8]/20/50">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-[10px] font-black uppercase text-[#818cf8] tracking-widest">Complete your meal?</p>
                                                                        <Link
                                                                            href={`/store/${item.store_slug}`}
                                                                            onClick={onClose}
                                                                            className="text-[9px] font-black uppercase text-[#a5b4fc]0 hover:underline"
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
                                                    <ShoppingCartIcon className="w-16 h-16 text-ink-tertiary mb-4" />
                                                    <p className="text-ink-secondary font-medium">Your cart is empty</p>
                                                    <p className="text-sm text-ink-tertiary0 mt-1">Add items to get started</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {cart && cart.items.length > 0 && (
                                            <div className="border-t border-border-primary px-6 py-4 space-y-4">
                                                {/* Total */}
                                                <div className="flex items-center justify-between text-lg font-bold">
                                                    <span className="text-ink-secondary">Total</span>
                                                    <span className="text-ink-primary">${totalAmount.toFixed(2)} XCD</span>
                                                </div>

                                                {/* Checkout Button */}
                                                <button
                                                    onClick={handleCheckout}
                                                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-accent-400 text-white font-bold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                                                    disabled={loading}
                                                >
                                                    Proceed to Checkout
                                                </button>

                                                <button
                                                    onClick={onClose}
                                                    className="w-full py-3 text-ink-secondary font-medium hover:text-ink-primary transition-colors"
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
