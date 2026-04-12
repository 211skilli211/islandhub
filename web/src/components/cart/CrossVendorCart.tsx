'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/lib/api';

interface ShippingOption {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
}

interface VendorGroup {
    vendorId: string;
    vendorName: string;
    items: any[];
    subtotal: number;
    shippingOptions: ShippingOption[];
    selectedShipping: ShippingOption | null;
}

export default function CrossVendorCart() {
    const { cart, updateQuantity, removeItem, itemCount } = useCart();
    // Store selected shipping option ID per vendor (keyed by vendor "group ID" which we simulate)
    const [shippingSelections, setShippingSelections] = useState<Record<string, string>>({});

    // Group items by vendor
    const vendorGroups = useMemo(() => {
        const groups: Record<string, VendorGroup> = {};

        cart?.items?.forEach((item: any) => {
            // Use logic to determine vendor grouping. 
            // Assuming store_name or store_slug is available on items.
            const vName = item.store_name || 'Unknown Vendor';
            // Use store_slug or fallback to name as ID
            const vId = item.store_slug || vName.replace(/\s+/g, '-').toLowerCase();

            if (!groups[vId]) {
                groups[vId] = {
                    vendorId: vId,
                    vendorName: vName,
                    items: [],
                    subtotal: 0,
                    // Mock shipping options - in real app fetch from vendor config
                    shippingOptions: [
                        { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: '3-5 days' },
                        { id: 'express', name: 'Express Delivery', price: 14.99, estimatedDays: '1-2 days' }
                    ],
                    selectedShipping: null,
                };
            }

            groups[vId].items.push(item);
            groups[vId].subtotal += (item.price * item.quantity);
            groups[vId].subtotal = Number(groups[vId].subtotal.toFixed(2));
        });

        // Apply selections
        return Object.values(groups).map(g => {
            const selectedId = shippingSelections[g.vendorId] || 'standard'; // Default to standard
            return {
                ...g,
                selectedShipping: g.shippingOptions.find(o => o.id === selectedId) || null
            };
        });
    }, [cart?.items, shippingSelections]);

    const updateVendorShipping = (vendorId: string, optionId: string) => {
        setShippingSelections(prev => ({ ...prev, [vendorId]: optionId }));
    };

    // Calculate totals
    const { subtotal, shipping, total } = useMemo(() => {
        let subtotal = 0;
        let shipping = 0;

        vendorGroups.forEach(group => {
            subtotal += group.subtotal;
            if (group.selectedShipping) {
                shipping += group.selectedShipping.price;
            }
        });

        return {
            subtotal,
            shipping,
            total: subtotal + shipping,
        };
    }, [vendorGroups]);

    if (!cart?.items?.length) {
        return (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm mx-auto max-w-4xl">
                <span className="text-8xl mb-6 block">🛒</span>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 text-lg mb-8">Add items from multiple vendors to get started!</p>
                <a href="/listings" className="inline-block px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-teal-700 transition-all">
                    Browse Marketplace
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Cart Items */}
            <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Cart</h1>

                <AnimatePresence>
                    {vendorGroups.map((group) => (
                        <motion.div
                            key={group.vendorId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6"
                        >
                            {/* Vendor Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl">🏪</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{group.vendorName}</h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-teal-600 font-bold text-sm hover:text-teal-700 uppercase tracking-wide">
                                    Shop Vendor
                                </button>
                            </div>

                            {/* Vendor Items */}
                            <div className="space-y-6">
                                {group.items.map((item: any) => (
                                    <div key={item.item_id || item.id} className="flex gap-6">
                                        <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                                            <img
                                                src={getImageUrl(item.image_url || item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder-listing.png' }}
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                                                    <p className="text-lg font-black text-teal-600">${item.price}</p>
                                                </div>
                                                {item.type && <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.type}</p>}
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-200">
                                                    <button
                                                        onClick={() => updateQuantity(item.item_id || item.id, Math.max(0, item.quantity - 1))}
                                                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-100 font-bold text-slate-600"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold w-6 text-center text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.item_id || item.id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-100 font-bold text-slate-600"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.item_id || item.id)}
                                                    className="text-red-500 text-sm font-bold hover:text-red-600 underline decoration-red-200 hover:decoration-red-500"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vendor Shipping */}
                            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 -mb-8 p-8 rounded-b-4xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Shipping Method ({group.vendorName})</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {group.shippingOptions.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${group.selectedShipping?.id === option.id
                                                ? 'border-teal-500 bg-white shadow-md shadow-teal-100'
                                                : 'border-slate-200 bg-transparent hover:border-slate-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`shipping-${group.vendorId}`}
                                                value={option.id}
                                                checked={group.selectedShipping?.id === option.id}
                                                onChange={() => updateVendorShipping(group.vendorId, option.id)}
                                                className="text-teal-600 w-5 h-5 border-2 border-slate-300 focus:ring-teal-500"
                                            />
                                            <div className="flex-1">
                                                <p className={`font-bold ${group.selectedShipping?.id === option.id ? 'text-teal-900' : 'text-slate-700'}`}>{option.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{option.estimatedDays}</p>
                                            </div>
                                            <span className="font-black text-slate-900">
                                                {option.price === 0 ? 'FREE' : `$${option.price}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 p-8 sticky top-24">
                    <h2 className="text-2xl font-black text-slate-900 mb-8">Order Summary</h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-slate-600 font-medium">
                            <span>Subtotal ({itemCount} items)</span>
                            <span>${subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'FREE' : `$${shipping?.toFixed(2)}`}</span>
                        </div>
                        <div className="h-px bg-slate-100 my-6" />
                        <div className="flex justify-between text-2xl font-black text-slate-900">
                            <span>Total</span>
                            <span>${total?.toFixed(2)}</span>
                        </div>
                    </div>

                    <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98]">
                        Checkout All
                    </button>

                    <p className="text-center text-xs font-bold text-slate-400 mt-6 flex items-center justify-center gap-2">
                        🔒 Secure checkout powered by Stripe
                    </p>

                    {/* Vendor Count Badge */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Ordering from <span className="font-black text-slate-900">{vendorGroups.length}</span> vendor{vendorGroups.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
