'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Driver {
    user_id: number;
    name: string;
    vehicle_category?: string;
    make?: string;
    model?: string;
}

interface AssignDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    drivers: Driver[];
    onAssign: (driverId: number) => void;
    jobTitle: string;
}

export default function AssignDriverModal({ isOpen, onClose, drivers, onAssign, jobTitle }: AssignDriverModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[6000] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-slate-100">
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic">Assign Driver 🛰️</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">FOR MISSION: {jobTitle}</p>
                        </div>

                        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                            {drivers.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    No online drivers available
                                </div>
                            ) : (
                                drivers.map(driver => (
                                    <button
                                        key={driver.user_id}
                                        onClick={() => onAssign(driver.user_id)}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {driver.vehicle_category === 'scooter' ? '🛵' : driver.vehicle_category === 'van' ? '🚐' : '🚗'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-slate-800 group-hover:text-indigo-900">{driver.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{driver.make} {driver.model}</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                            Select
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-white text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
