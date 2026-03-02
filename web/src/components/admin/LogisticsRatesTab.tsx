'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Logistics Rate Controls</h2>
                    <p className="text-slate-500 font-medium text-sm">Configure fares, surcharges, and multipliers across service types</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchRules} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all font-bold">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-teal-600 mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rules.map((rule) => (
                        <motion.div
                            key={rule.id}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 bg-slate-900 text-white relative h-32 flex items-center justify-between">
                                <div>
                                    <span className="px-2 py-0.5 bg-teal-500 text-white rounded text-[8px] font-black uppercase tracking-widest mb-1 inline-block">
                                        Service Type
                                    </span>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{rule.service_type}</h3>
                                </div>
                                <div className="text-4xl opacity-40">
                                    {rule.service_type === 'taxi' ? '🚖' : rule.service_type === 'pickup' ? '📦' : '🚚'}
                                </div>
                            </div>

                            <div className="p-8 space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Fare</p>
                                        <p className="text-lg font-black text-slate-900">${rule.base_fare}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Per KM</p>
                                        <p className="text-lg font-black text-teal-600">${rule.per_km_rate}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">Min. Fare</span>
                                        <span className="font-black text-slate-800">${rule.minimum_fare}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">Surge Multiplier</span>
                                        <span className="font-black text-amber-600">x{rule.surge_multiplier}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">Extra Pax Fee</span>
                                        <span className="font-black text-indigo-600">${rule.extra_passenger_fee}</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Item Multipliers</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {rule.item_size_multipliers && Object.entries(rule.item_size_multipliers).map(([size, mult]: any) => (
                                            <div key={size} className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-600">{size.replace('_', ' ')}:</span>
                                                <span className="font-black text-indigo-700">x{mult}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                <button
                                    onClick={() => setEditingRule(rule)}
                                    className="w-full py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                                >
                                    Modify Rates ➔
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Editing Modal */}
            <AnimatePresence>
                {editingRule && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <form onSubmit={handleUpdate} className="flex flex-col h-full">
                                <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Edit {editingRule.service_type} Rates</h3>
                                        <p className="text-teal-400 font-bold text-xs uppercase tracking-widest mt-1">Pricing Configuration v2.0</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingRule(null)}
                                        className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all font-black"
                                    >✕</button>
                                </div>

                                <div className="p-10 space-y-10 overflow-y-auto no-scrollbar">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Base Fare ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.base_fare}
                                                onChange={(e) => setEditingRule({ ...editingRule, base_fare: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-black text-slate-900 outline-none focus:border-teal-500 transition-all text-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Per KM Rate ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.per_km_rate}
                                                onChange={(e) => setEditingRule({ ...editingRule, per_km_rate: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-black text-slate-900 outline-none focus:border-teal-500 transition-all text-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Min. Fare ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.minimum_fare}
                                                onChange={(e) => setEditingRule({ ...editingRule, minimum_fare: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Surge Mult.</label>
                                            <input
                                                step="0.1"
                                                type="number"
                                                value={editingRule.surge_multiplier}
                                                onChange={(e) => setEditingRule({ ...editingRule, surge_multiplier: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Extra Pax ($)</label>
                                            <input
                                                step="0.01"
                                                type="number"
                                                value={editingRule.extra_passenger_fee}
                                                onChange={(e) => setEditingRule({ ...editingRule, extra_passenger_fee: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Item Size Multipliers</p>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-x-8 gap-y-4">
                                            {editingRule.item_size_multipliers && Object.entries(editingRule.item_size_multipliers).map(([size, mult]: any) => (
                                                <div key={size} className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{size.replace('_', ' ')}</span>
                                                    <input
                                                        step="0.1"
                                                        type="number"
                                                        value={mult}
                                                        onChange={(e) => {
                                                            const newMults = { ...editingRule.item_size_multipliers, [size]: parseFloat(e.target.value) };
                                                            setEditingRule({ ...editingRule, item_size_multipliers: newMults });
                                                        }}
                                                        className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-3 text-right font-black text-indigo-600 focus:border-indigo-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 bg-teal-600 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-teal-200 hover:scale-[1.02] transition-all"
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
