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
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-20 px-4">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white text-center max-w-lg w-full">
                    <div className="text-7xl mb-8 animate-bounce">🛒</div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Your cart is empty</h1>
                    <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                        Looks like you haven't added any island treasures yet. Start exploring our unique offerings!
                    </p>
                    <Link
                        href="/listings"
                        className="inline-block px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                        <p className="text-slate-500 font-medium mt-1">Review your items before checkout ({itemCount} products)</p>
                    </div>
                    <Link
                        href="/listings"
                        className="text-teal-600 font-bold hover:text-teal-700 transition-colors flex items-center gap-2"
                    >
                        <span>←</span> Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.item_id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-6 items-center">
                                {/* Thumbnail */}
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-50">
                                    {item.image_url ? (
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs uppercase">No Image</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <TypeBadge type={item.type as any} />
                                            <h3 className="text-xl font-black text-slate-900 mt-1">{item.title}</h3>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.item_id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                            title="Remove item"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-bold text-teal-600">
                                            ${Number(item.price_snapshot || item.price).toLocaleString()}
                                            {item.type === 'rental' && <span className="text-xs text-slate-400 font-normal ml-1">/ day</span>}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                            <button
                                                onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-black text-slate-700">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white sticky top-24">
                            <h2 className="text-2xl font-black text-slate-900 mb-8">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">${totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 font-medium">
                                    <span>Service Fee</span>
                                    <span className="text-slate-900">$0.00</span>
                                </div>
                                <div className="flex justify-between text-slate-500 font-medium">
                                    <span>Estimated Tax</span>
                                    <span className="text-slate-900">$0.00</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between">
                                    <span className="text-xl font-black text-slate-900">Total</span>
                                    <span className="text-2xl font-black text-teal-600">${totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-center rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Checkout Now
                            </Link>

                            <p className="text-[11px] text-slate-400 mt-6 text-center font-bold uppercase tracking-widest">
                                🔒 Secure SSL Encrypted Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
