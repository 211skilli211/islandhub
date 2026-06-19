'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

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
                    className="fixed inset-0 bg-ink-primary/40 backdrop-blur-sm z-[6000] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-surface-elevated rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-border-primary">
                            <h3 className="text-2xl font-black text-ink-primary uppercase italic">Assign Driver <EmojiIcon emoji="🛰️" size=24 /></h3>
                            <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest mt-1">FOR MISSION: {jobTitle}</p>
                        </div>

                        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                            {drivers.length === 0 ? (
                                <div className="py-12 text-center text-ink-tertiary font-bold uppercase text-[10px] tracking-widest">
                                    No online drivers available
                                </div>
                            ) : (
                                drivers.map(driver => (
                                    <button
                                        key={driver.user_id}
                                        onClick={() => onAssign(driver.user_id)}
                                        className="w-full p-4 bg-surface-secondary rounded-2xl border border-border-primary flex items-center justify-between group hover:border-[#14b8a6] hover:bg-[#14b8a6]/10 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-surface-elevated rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#14b8a6] group-hover:text-white transition-colors">
                                                {driver.vehicle_category === 'scooter' ? '🛵' : driver.vehicle_category === 'van' ? '🚐' : '<EmojiIcon emoji="🚗" size=16 />'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-ink-primary group-hover:text-teal-900">{driver.name}</p>
                                                <p className="text-[10px] text-ink-tertiary font-bold uppercase tracking-tight">{driver.make} {driver.model}</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-surface-elevated rounded-xl text-[9px] font-black uppercase text-[#14b8a6] border border-[#14b8a6]/20 group-hover:bg-[#14b8a6] group-hover:text-white group-hover:border-[#14b8a6] transition-all">
                                            Select
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-surface-secondary flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-surface-elevated text-ink-tertiary rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-ink-secondary transition-colors"
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
