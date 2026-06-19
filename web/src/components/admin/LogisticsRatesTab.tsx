'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

export default function LogisticsRatesTab() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRule, setEditingRule] = useState<any>(null);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await api.get('/logistics/pricing');
            setRules(res.data.rules || []);
        } catch (error) {
            console.error('Failed to fetch pricing rules', error);
            toast.error('Failed to load pricing configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/logistics/pricing/${editingRule.id}`, editingRule);
            toast.success('Rates updated successfully!');
            setEditingRule(null);
            fetchRules();
        } catch (error) {
            toast.error('Failed to update rates');
        }
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center bg-surface-elevated p-6 rounded-[2rem] border border-border-primary shadow-xl shadow-black/10/40">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary tracking-tight">Logistics Rate Controls</h2>
                    <p className="text-ink-tertiary font-medium text-sm">Configure fares, surcharges, and multipliers across service types</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchRules} className="p-3 bg-surface-secondary text-ink-secondary rounded-xl hover:bg-surface-secondary transition-all font-bold">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-border-primary border-t-teal-600 mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rules.map((rule) => (
                        <motion.div
                            key={rule.id}
                            whileHover={{ y: -5 }}
                            className="bg-surface-elevated rounded-[2.5rem] border border-border-primary shadow-xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 bg-ink-primary text-white relative h-32 flex items-center justify-between">
                                <div>
                                    <span className="px-2 py-0.5 bg-accent-500/100 text-white rounded text-[8px] font-black uppercase tracking-widest mb-1 inline-block">
                                        Service Type
                                    </span>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{rule.service_type}</h3>
                                </div>
                                <div className="text-4xl opacity-40">
                                    {rule.service_type === 'taxi' ? '🚖' : rule.service_type === 'pickup' ? '📦' : '<EmojiIcon emoji="🚚" size={16} />'}
                                </div>
                            </div>

                            <div className="p-8 space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface-secondary p-4 rounded-2xl border border-border-primary">
                                        <p className="text-[9px] font-black text-ink-tertiary uppercase tracking-widest mb-1">Base Fare</p>
                                        <p className="text-lg font-black text-ink-primary">${rule.base_fare}</p>
                                    </div>
                                    <div className="bg-surface-secondary p-4 rounded-2xl border border-border-primary">
                                        <p className="text-[9px] font-black text-ink-tertiary uppercase tracking-widest mb-1">Per KM</p>
                                        <p className="text-lg font-black text-accent-400">${rule.per_km_rate}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-ink-tertiary">Min. Fare</span>
                                        <span className="font-black text-ink-primary">${rule.minimum_fare}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-ink-tertiary">Surge Multiplier</span>
                                        <span className="font-black text-sand-500">x{rule.surge_multiplier}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-ink-tertiary">Extra Pax Fee</span>
                                        <span className="font-black text-[#14b8a6]">${rule.extra_passenger_fee}</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-[#14b8a6]/10/50 rounded-2xl border border-[#14b8a6]/20/50">
                                    <p className="text-[9px] font-black text-[#14b8a6] uppercase tracking-widest mb-2">Item Multipliers</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {rule.item_size_multipliers && Object.entries(rule.item_size_multipliers).map(([size, mult]: any) => (
                                            <div key={size} className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-ink-secondary">{size.replace('_', ' ')}:</span>
                                                <span className="font-black text-[#14b8a6]">x{mult}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-surface-secondary border-t border-border-primary">
                                <button
                                    onClick={() => setEditingRule(rule)}
                                    className="w-full py-3 bg-surface-elevated border-2 border-border-primary text-ink-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-teal-500 hover:text-accent-400 transition-all shadow-sm"
                                >
                                    Modify Rates ➔
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            
            <AnimatePresence>
                {editingRule && (
                    <div className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface-elevated w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <form onSubmit={handleUpdate} className="flex flex-col h-full">
                                <div className="p-10 bg-ink-primary text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Edit {editingRule.service_type} Rates</h3>
                                        <p className="text-accent-400 font-bold text-xs uppercase tracking-widest mt-1">Pricing Configuration v2.0</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingRule(null)}
                                        className="w-12 h-12 bg-surface-elevated/10 rounded-full flex items-center justify-center hover:bg-surface-elevated/20 transition-all font-black"
                                    ><EmojiIcon emoji="✕" size={16} /></button>
                                </div>

                                <div className="p-10 space-y-10 overflow-y-auto no-scrollbar">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest block ml-2">Base Fare ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.base_fare}
                                                onChange={(e) => setEditingRule({ ...editingRule, base_fare: e.target.value })}
                                                className="w-full bg-surface-secondary border-2 border-border-primary rounded-2xl py-4 px-6 font-black text-ink-primary outline-none focus:border-teal-500 transition-all text-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest block ml-2">Per KM Rate ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.per_km_rate}
                                                onChange={(e) => setEditingRule({ ...editingRule, per_km_rate: e.target.value })}
                                                className="w-full bg-surface-secondary border-2 border-border-primary rounded-2xl py-4 px-6 font-black text-ink-primary outline-none focus:border-teal-500 transition-all text-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest block ml-2">Min. Fare ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.minimum_fare}
                                                onChange={(e) => setEditingRule({ ...editingRule, minimum_fare: e.target.value })}
                                                className="w-full bg-surface-secondary border-2 border-border-primary rounded-2xl py-3 px-4 font-bold text-ink-primary outline-none focus:border-[#14b8a6] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest block ml-2">Surge Mult.</label>
                                            <input
                                                step="0.1"
                                                type="number"
                                                value={editingRule.surge_multiplier}
                                                onChange={(e) => setEditingRule({ ...editingRule, surge_multiplier: e.target.value })}
                                                className="w-full bg-surface-secondary border-2 border-border-primary rounded-2xl py-3 px-4 font-bold text-ink-primary outline-none focus:border-[#14b8a6] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest block ml-2">Extra Pax ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.extra_passenger_fee}
                                                onChange={(e) => setEditingRule({ ...editingRule, extra_passenger_fee: e.target.value })}
                                                className="w-full bg-surface-secondary border-2 border-border-primary rounded-2xl py-3 px-4 font-bold text-ink-primary outline-none focus:border-[#14b8a6] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest ml-2">Item Size Multipliers</p>
                                        <div className="bg-surface-secondary p-6 rounded-[2rem] border border-border-primary grid grid-cols-2 gap-x-8 gap-y-4">
                                            {editingRule.item_size_multipliers && Object.entries(editingRule.item_size_multipliers).map(([size, mult]: any) => (
                                                <div key={size} className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">{size.replace('_', ' ')}</span>
                                                    <input
                                                        step="0.1"
                                                        type="number"
                                                        value={mult}
                                                        onChange={(e) => {
                                                            const newMults = { ...editingRule.item_size_multipliers, [size]: parseFloat(e.target.value) };
                                                            setEditingRule({ ...editingRule, item_size_multipliers: newMults });
                                                        }}
                                                        className="w-20 bg-surface-elevated border border-border-primary rounded-xl py-2 px-3 text-right font-black text-[#14b8a6] focus:border-[#14b8a6]"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-surface-secondary border-t border-border-primary flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 bg-accent-500 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-accent-500/15 hover:scale-[1.02] transition-all"
                                    >
                                        Commit Changes ➔
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
