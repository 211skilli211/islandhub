'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';

interface FoodSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    storeId: number;
}

export default function FoodSelectionModal({ isOpen, onClose, item, storeId }: FoodSelectionModalProps) {
    const { addToCart } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<any>({});
    const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(Number(item?.price || 0));

    useEffect(() => {
        if (item) {
            // Set defaults for variants
            const defaults: any = {};
            if (item.variants) {
                Object.entries(item.variants).forEach(([key, values]: [string, any]) => {
                    if (Array.isArray(values) && values.length > 0) {
                        defaults[key] = values[0];
                    }
                });
            }
            setSelectedVariant(defaults);
            setQuantity(1);
            setSelectedAddons([]);
        }
    }, [item]);

    useEffect(() => {
        if (!item) return;
        let price = Number(item.price);

        // Add Variant price offsets
        Object.values(selectedVariant).forEach((val: any) => {
            const match = String(val).match(/\+\s*\$(\d+(\.\d+)?)/);
            if (match) price += parseFloat(match[1]);
        });

        // Add Addons
        selectedAddons.forEach(addon => {
            if (addon.price) price += Number(addon.price);
        });

        setTotalPrice(price * quantity);
    }, [selectedVariant, selectedAddons, quantity, item]);

    const handleAdd = async () => {
        try {
            await addToCart(item.listing_id || storeId, {
                itemId: item.id,
                quantity,
                selectedVariant,
                selectedAddons
            });
            onClose();
        } catch (e) {
            toast.error('Failed to add item');
        }
    };

    const toggleAddon = (addon: any) => {
        if (selectedAddons.find(a => a.name === addon.name)) {
            setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
        } else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="absolute top-6 right-6 z-10">
                            <button onClick={onClose} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-900 hover:bg-white transition-all shadow-sm">✕</button>
                        </div>

                        <div className="overflow-y-auto">
                            <div className="h-64 relative bg-slate-100">
                                {item.image_url ? (
                                    <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl bg-slate-50">🥘</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
                            </div>

                            <div className="px-10 pb-10 space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{item.name}</h2>
                                    <p className="text-slate-500 font-medium mt-2 leading-relaxed">{item.description}</p>
                                </div>

                                {/* Variants */}
                                {item.variants && Object.entries(item.variants).map(([category, options]: [string, any]) => (
                                    <div key={category} className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{category}</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Array.isArray(options) && options.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSelectedVariant({ ...selectedVariant, [category]: opt })}
                                                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 text-left
                                                        ${selectedVariant[category] === opt
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                                            : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Addons */}
                                {item.addons && item.addons.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Addons & Extras</h3>
                                        <div className="space-y-2">
                                            {item.addons.map((addon: any) => (
                                                <button
                                                    key={addon.name}
                                                    onClick={() => toggleAddon(addon)}
                                                    className={`w-full px-6 py-4 rounded-2xl flex items-center justify-between transition-all border-2
                                                        ${selectedAddons.find(a => a.name === addon.name)
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                            : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{addon.name}</span>
                                                    <span className="font-bold text-xs">+${addon.price}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                <div className="pt-4 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">How many?</h3>
                                    <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-2xl">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 bg-white rounded-xl shadow-sm text-slate-900 font-bold hover:bg-slate-100"
                                        >-</button>
                                        <span className="font-black text-xl">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 bg-white rounded-xl shadow-sm text-slate-900 font-bold hover:bg-slate-100"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Sticky Footer */}
                        <div className="p-8 bg-slate-900 text-white flex items-center gap-6">
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Total Amount</p>
                                <p className="text-3xl font-black italic tracking-tighter">${totalPrice.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                            >
                                Add to Selection ➔
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
