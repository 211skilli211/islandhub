'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { AdminTable, Column } from './shared/AdminTable';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Driver {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    vehicle_type?: string;
    is_verified_driver: boolean;
    created_at: string;
    total_jobs: number;
    total_earnings: number;
    active_jobs: number;
    // KYC Data
    verification_status?: string;
    license_number?: string;
    license_expiry?: string;
    kyc_documents?: any;
    v_make?: string;
    v_model?: string;
    v_plate?: string;
    v_category?: string;
}

export default function DriversTab() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedKYC, setSelectedKYC] = useState<Driver | null>(null);

    const handleRowAction = async (action: string, driver: Driver) => {
        try {
            if (action === 'suspend' || action === 'activate') {
                const newStatus = action === 'activate';
                await api.patch(`/admin/users/${driver.id}`, { is_active: newStatus });
                toast.success(`Driver ${newStatus ? 'activated' : 'suspended'} successfully`);
            } else if (action === 'verify' || action === 'unverify') {
                const newStatus = action === 'verify';
                await api.patch(`/admin/users/${driver.id}`, { is_verified_driver: newStatus });
                // Also update KYC status if it exists
                if (driver.license_number) {
                    await api.post('/logistics/kyc', {
                        ...driver,
                        verification_status: newStatus ? 'approved' : 'rejected',
                        userId: driver.id // This would need a specialized admin/kyc endpoint ideally
                    });
                }
                toast.success(`Driver ${newStatus ? 'verified' : 'unverified'} successfully`);
            } else if (action === 'view_kyc') {
                setSelectedKYC(driver);
                return;
            } else if (action === 'delete') {
                if (!window.confirm(`⚠️ DANGER: Are you sure you want to permanently DELETE driver "${driver.name}"? This action cannot be undone.`)) {
                    return;
                }
                const doubleCheck = prompt(`To confirm deletion, please type the driver's name: ${driver.name}`);
                if (doubleCheck !== driver.name) {
                    toast.error('Name mismatch. Deletion cancelled.');
                    return;
                }
                await api.delete(`/admin/users/${driver.id}`);
                toast.success('Driver deleted successfully');
            }
            setRefreshKey(prev => prev + 1);
        } catch (error: any) {
            console.error('Row action failed:', error);
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const columns: Column<Driver>[] = [
        {
            header: 'Driver',
            accessor: (driver) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm ${driver.role === 'admin' ? 'bg-gradient-to-br from-teal-500 to-teal-600' : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                        }`}>
                        {driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="font-bold text-theme-primary leading-none">{driver.name}</p>
                            {driver.role === 'admin' && (
                                <span className="text-[8px] font-black bg-accent-primary/15 text-accent-primary px-1 py-0.5 rounded uppercase tracking-tighter">Admin</span>
                            )}
                        </div>
                        <p className="text-xs text-icon-tertiary mt-0.5">{driver.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'KYC Status',
            accessor: (driver) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${driver.is_verified_driver ? 'bg-accent-primary/15 text-accent-primary' : 'bg-theme-tertiary text-icon-tertiary'}`}>
                            {driver.is_verified_driver ? 'Verified' : 'Unverified'}
                        </span>
                        {driver.verification_status && (
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${driver.verification_status === 'pending' ? 'bg-warning-primary/10 text-warning-primary animate-pulse' :
                                    driver.verification_status === 'approved' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-danger-primary/5 text-danger-primary'
                                }`}>
                                KYC: {driver.verification_status}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Machine',
            accessor: (driver) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-theme-tertiary border border-theme-primary flex items-center justify-center text-xl shadow-inner">
                        {driver.v_category === 'scooter' ? '🛵' : driver.v_category === 'van' ? '🚐' : <EmojiIcon emoji="🚗" size={16} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-icon-tertiary tracking-tighter leading-none mb-1">{driver.v_make || 'Generic'}</p>
                        <p className="font-bold text-theme-primary text-xs">{driver.v_model || 'Vehicle'}</p>
                        {driver.v_plate && <p className="text-[9px] font-black text-accent-primary bg-accent-primary/10 px-1 py-0.5 rounded w-fit mt-1">{driver.v_plate}</p>}
                    </div>
                </div>
            )
        },
        {
            header: 'Performance',
            accessor: (driver) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-icon-tertiary font-black uppercase tracking-widest w-12">Jobs:</span>
                        <span className="font-black text-theme-primary text-xs">{driver.total_jobs || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-icon-tertiary font-black uppercase tracking-widest w-12">Earnings:</span>
                        <span className="font-black text-success-primary text-xs">${Number(driver.total_earnings || 0).toLocaleString()}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Legal',
            accessor: (driver) => (
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-icon-secondary truncate max-w-[120px]">
                        ID: <span className="font-black">{driver.license_number || 'N/A'}</span>
                    </p>
                    {driver.license_expiry && (
                        <p className={`text-[9px] font-black uppercase italic ${new Date(driver.license_expiry) < new Date() ? 'text-danger-primary' : 'text-icon-tertiary'}`}>
                            Exp: {new Date(driver.license_expiry).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between bg-card p-8 rounded-[2.5rem] border border-theme-primary shadow-sm gap-6">
                <div>
                    <h2 className="text-4xl font-black text-theme-primary italic uppercase tracking-tighter">Strategic Fleet Intelligence</h2>
                    <p className="text-icon-tertiary font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Global Driver Verification & Performance Monitoring</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-icon-tertiary uppercase tracking-widest mb-1">Fleet Operations</span>
                        <a
                            href="/admin/dispatch"
                            className="px-8 py-4 bg-theme-inverse text-theme-inverse rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-primary transition-all shadow-xl shadow-theme flex items-center gap-2"
                        >
                            <EmojiIcon emoji="🛰️" size={16} className="animate-pulse" /> Live Tracking
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-[3rem] border border-theme-primary shadow-2xl overflow-hidden">
                <AdminTable<Driver>
                    key={`drivers-table-${refreshKey}`}
                    endpoint="/admin/drivers"
                    keyName="drivers"
                    columns={columns}
                    idKey="id"
                    getRowLink={(driver) => `/admin/users/${driver.id}`}
                    onRowAction={handleRowAction}
                    rowActions={[
                        {
                            label: 'KYC Vault',
                            action: 'view_kyc',
                            className: 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/20 hover:bg-[#14b8a6] hover:text-white',
                            condition: (d) => !!d.license_number
                        },
                        {
                            label: 'Verify Driver',
                            action: 'verify',
                            className: 'bg-accent-500/10 text-accent-400 border-teal-100 hover:bg-accent-500 hover:text-white',
                            condition: (d) => !d.is_verified_driver
                        },
                        {
                            label: 'Unverify',
                            action: 'unverify',
                            className: 'bg-sand-500/5 text-sand-500 border-sand-500/20 hover:bg-sand-500 hover:text-white',
                            condition: (d) => !!d.is_verified_driver
                        },
                        {
                            label: 'Suspend',
                            action: 'suspend',
                            className: 'bg-[#e11d48]/5 text-[#e11d48] border-[#e11d48]/20 hover:bg-[#e11d48] hover:text-white',
                            condition: (d) => d.is_active
                        },
                        {
                            label: 'Activate',
                            action: 'activate',
                            className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white',
                            condition: (d) => !d.is_active
                        }
                    ]}
                />
            </div>

            <AnimatePresence>
                            {selectedKYC && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-theme-inverse/60 backdrop-blur-md z-[5000] flex items-center justify-center p-6"
                                    onClick={() => setSelectedKYC(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                        className="bg-card rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="p-10 border-b border-theme-primary flex justify-between items-center bg-theme-tertiary/50">
                                            <div>
                                                <h3 className="text-3xl font-black text-theme-primary italic uppercase tracking-tighter">KYC Document Vault</h3>
                                                <p className="text-[10px] font-black text-icon-tertiary uppercase tracking-widest">Authentication for {selectedKYC.name}</p>
                                            </div>
                                            <button onClick={() => setSelectedKYC(null)} className="w-12 h-12 bg-theme-tertiary rounded-2xl flex items-center justify-center font-black text-sm shadow-xl hover:scale-110 transition-transform"><EmojiIcon emoji="✕" size={16} /></button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                                            <section>
                                                <h4 className="text-[10px] font-black uppercase text-accent-primary tracking-widest mb-6 border-b border-accent-primary/50 pb-2 flex items-center gap-2">
                                                    <EmojiIcon emoji="🛡️" size={16} /> Identity & Legal
                                                </h4>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="p-6 bg-theme-tertiary rounded-3xl">
                                                        <p className="text-[9px] font-black text-icon-tertiary uppercase tracking-widest mb-1">License Number</p>
                                                        <p className="text-xl font-black text-theme-primary">{selectedKYC.license_number}</p>
                                                    </div>
                                                    <div className="p-6 bg-theme-tertiary rounded-3xl">
                                                        <p className="text-[9px] font-black text-icon-tertiary uppercase tracking-widest mb-1">Expiration</p>
                                                        <p className="text-xl font-black text-theme-primary">{selectedKYC.license_expiry}</p>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <h4 className="text-[10px] font-black uppercase text-warning-primary tracking-widest mb-6 border-b border-warning-primary/50 pb-2 flex items-center gap-2">
                                                    <EmojiIcon emoji="⚙️" size={16} /> Vehicle Specification
                                                </h4>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="p-6 border-2 border-theme-primary rounded-3xl">
                                                        <p className="text-[9px] font-black text-icon-tertiary uppercase tracking-widest mb-1">Make & Model</p>
                                                        <p className="font-black text-theme-primary text-lg uppercase italic">{selectedKYC.v_make} {selectedKYC.v_model}</p>
                                                    </div>
                                                    <div className="p-6 border-2 border-theme-primary rounded-3xl">
                                                        <p className="text-[9px] font-black text-icon-tertiary uppercase tracking-widest mb-1">License Plate</p>
                                                        <p className="font-black text-accent-primary text-lg uppercase tracking-widest">{selectedKYC.v_plate}</p>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <h4 className="text-[10px] font-black uppercase text-success-primary tracking-widest mb-6 border-b border-success-primary/50 pb-2 flex items-center gap-2">
                                                    <EmojiIcon emoji="🖼️" size={16} /> Document Evidence
                                                </h4>
                                                <div className="flex items-center justify-center p-20 bg-theme-tertiary rounded-[3rem] border-2 border-dashed border-theme-primary">
                                                    <div className="text-center">
                                                        <EmojiIcon emoji="📸" size={40} className="text-4xl mb-4 block" />
                                                        <p className="text-xs font-bold text-icon-tertiary">Identity document scans appear here upon secondary verification stage.</p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        <div className="p-10 bg-theme-inverse flex gap-4">
                                            <button
                                                onClick={() => handleRowAction('unverify', selectedKYC)}
                                                className="flex-1 py-5 bg-theme-tertiary text-theme-inverse rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-danger-primary transition-colors"
                                            >
                                                Reject Application
                                            </button>
                                            <button
                                                onClick={() => handleRowAction('verify', selectedKYC)}
                                                className="flex-1 py-5 bg-accent-primary/100 text-theme-inverse rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent-secondary shadow-xl shadow-teal-900/40"
                                            >
                                                Approve Driver ➔
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            }
