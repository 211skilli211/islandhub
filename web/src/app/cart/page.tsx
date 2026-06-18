'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import TypeBadge from '@/components/TypeBadge';
import { getImageUrl } from '@/lib/api';

export default function CartPage() {
    const { cart, removeItem, updateQuantity, totalAmount, itemCount } = useCart();
    const items = cart?.items || [];

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-surface-primary flex flex-col justify-center items-center py-20 px-4">
                <div className="bg-surface-elevated p-12 rounded-[2.5rem] shadow-2xl shadow-black/10/50 border border-white text-center max-w-lg w-full">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-secondary flex items-center justify-center">
                        <svg className="w-10 h-10 text-ink-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    </div>
                    <h1 className="text-3xl font-black text-ink-primary mb-3">Your cart is empty</h1>
                    <p className="text-ink-tertiary text-base mb-8 leading-relaxed">
                        Discover island treasures — fresh food, local products, tours & more from Caribbean vendors.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/listings" className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-base shadow-lg transition-all">
                            Browse Marketplace
                        </Link>
                        <Link href="/food" className="px-8 py-4 bg-surface-secondary hover:bg-surface-tertiary text-ink-primary rounded-xl font-bold text-base border border-border-primary transition-all">
                            Order Food 🍴
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tight">Shopping Cart</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Review your items before checkout ({itemCount} products)</p>
                    </div>
                    <Link
                        href="/listings"
                        className="text-accent-400 font-bold hover:text-accent-500 transition-colors flex items-center gap-2"
                    >
                        <span>←</span> Continue Shopping
                    </Link>
                </div>

                
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
                    <span className="text-xl">⚡</span>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                        Items in your cart are not reserved. Complete checkout to secure your order.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.item_id} className="bg-surface-elevated p-6 rounded-[2rem] shadow-sm border border-border-primary flex gap-6 items-center">
                                
                                <div className="w-24 h-24 rounded-2xl bg-surface-secondary overflow-hidden flex-shrink-0 border border-ink-50 dark:border-ink-800">
                                    {item.image_url ? (
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-ink-300 dark:text-ink-400 font-bold text-xs uppercase">No Image</div>
                                    )}
                                </div>

                                
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <TypeBadge type={item.type as any} />
                                            <h3 className="text-xl font-black text-ink-primary mt-1">{item.title}</h3>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.item_id)}
                                            className="p-2 text-ink-tertiary hover:text-rose-500 transition-colors"
                                            title="Remove item"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-bold text-accent-400">
                                            ${Number(item.price_snapshot || item.price).toLocaleString()}
                                            {item.type === 'rental' && <span className="text-xs text-ink-tertiary font-normal ml-1">/ day</span>}
                                        </div>

                                        
                                        <div className="flex items-center gap-3 bg-surface-primary p-1.5 rounded-xl border border-border-primary">
                                            <button
                                                onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-surface-elevated rounded-lg shadow-sm border border-border-primary text-ink-secondary hover:bg-surface-primary font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-black text-ink-secondary">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-surface-elevated rounded-lg shadow-sm border border-border-primary text-ink-secondary hover:bg-surface-primary font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    
                    <div className="lg:col-span-1">
                        <div className="bg-surface-elevated p-8 rounded-[2.5rem] shadow-xl shadow-black/10/50 border border-white sticky top-24">
                            <h2 className="text-2xl font-black text-ink-primary mb-8">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-ink-tertiary font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-ink-primary">${totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-ink-tertiary font-medium">
                                    <span>Service Fee</span>
                                    <span className="text-ink-primary">$0.00</span>
                                </div>
                                <div className="flex justify-between text-ink-tertiary font-medium">
                                    <span>Estimated Tax</span>
                                    <span className="text-ink-primary">$0.00</span>
                                </div>
                                <div className="pt-4 border-t border-border-primary flex justify-between">
                                    <span className="text-xl font-black text-ink-primary">Total</span>
                                    <span className="text-2xl font-black text-accent-400">${totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-center rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Checkout Now
                            </Link>

                            <p className="text-[11px] text-ink-tertiary mt-6 text-center font-bold uppercase tracking-widest">
                                🔒 Secure SSL Encrypted Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
