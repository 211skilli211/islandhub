'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '@/lib/toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard, DollarSign, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

interface WalletData {
    wallet_id: number;
    balance: string;
    withdrawable_balance: string;
    pending_payouts: string;
    lifetime_earnings: string;
    currency: string;
}

interface Transaction {
    transaction_id: number;
    amount: string;
    transaction_type: string;
    reference_type: string;
    notes: string;
    created_at: string;
}

interface PayoutRequest {
    request_id: number;
    amount: string;
    status: string;
    payout_method: string;
    created_at: string;
}

interface WalletTabProps {
    storeId?: number;
}

export default function WalletTab({ storeId }: WalletTabProps) {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('bank_transfer');

    const fetchData = async () => {
        try {
            const [walletRes, transRes, payoutsRes] = await Promise.all([
                api.get(`/financials/wallet${storeId ? `?store_id=${storeId}` : ''}`),
                api.get(`/financials/transactions${storeId ? `?store_id=${storeId}` : ''}`),
                api.get('/financials/payouts/my')
            ]);
            setWallet(walletRes.data);
            setTransactions(transRes.data);
            setPayouts(payoutsRes.data);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            toast.error('Could not load financial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [storeId]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wallet) return;

        if (parseFloat(withdrawAmount) > parseFloat(wallet.withdrawable_balance)) {
            toast.error('Insufficient withdrawable balance');
            return;
        }

        try {
            await api.post('/financials/payouts/request', {
                wallet_id: wallet.wallet_id,
                amount: parseFloat(withdrawAmount),
                payout_method: payoutMethod,
                payout_details: { method: payoutMethod, account: 'Island Bank ****4321' } // Mock details for now
            });
            toast.success('Payout request submitted!');
            setIsWithdrawModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Withdrawal failed');
        }
    };

    if (loading) return <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-border-primary border-t-indigo-600 mx-auto" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary tracking-tight">Financial Hub</h2>
                    <p className="text-ink-tertiary0 font-medium">Manage your earnings and payouts</p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-6 py-3 bg-[#818cf8] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-100"
                >
                    <Send size={16} /> Request Payout
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface-elevated p-8 rounded-4xl border border-border-primary shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Total Balance</p>
                    <p className="text-3xl font-black text-ink-primary">${parseFloat(wallet?.balance || '0').toFixed(2)}</p>
                </div>
                <div className="bg-emerald-500/10 p-8 rounded-4xl border border-emerald-500/20 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Withdrawable</p>
                    <p className="text-3xl font-black text-emerald-500">${parseFloat(wallet?.withdrawable_balance || '0').toFixed(2)}</p>
                </div>
                <div className="bg-sand-500/5 p-8 rounded-4xl border border-sand-500/20 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-sand-500 mb-2">Pending</p>
                    <p className="text-3xl font-black text-sand-500">${parseFloat(wallet?.pending_payouts || '0').toFixed(2)}</p>
                </div>
                <div className="bg-[#818cf8]/10 p-8 rounded-4xl border border-[#818cf8]/20 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#818cf8] mb-2">Lifetime</p>
                    <p className="text-3xl font-black text-[#6366f1]">${parseFloat(wallet?.lifetime_earnings || '0').toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction History */}
                <div className="bg-surface-elevated rounded-[2.5rem] border border-border-primary shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-border-primary flex justify-between items-center">
                        <h3 className="text-lg font-black text-ink-primary flex items-center gap-2"><History size={20} /> Revenue Ledger</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {transactions.length === 0 ? (
                            <div className="p-20 text-center text-ink-tertiary italic">No transactions yet</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {transactions.map((tx) => (
                                    <div key={tx.transaction_id} className="p-6 flex justify-between items-center hover:bg-surface-secondary transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${parseFloat(tx.amount) > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#e11d48]/10 text-[#e11d48]'
                                                }`}>
                                                {parseFloat(tx.amount) > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink-primary capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                                                <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black ${parseFloat(tx.amount) > 0 ? 'text-emerald-400' : 'text-[#e11d48]'}`}>
                                                {parseFloat(tx.amount) > 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)}
                                            </p>
                                            <p className="text-[9px] text-ink-tertiary font-medium">{tx.notes || tx.reference_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payout History */}
                <div className="bg-surface-elevated rounded-[2.5rem] border border-border-primary shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-border-primary">
                        <h3 className="text-lg font-black text-ink-primary flex items-center gap-2"><CreditCard size={20} /> Withdrawal Requests</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {payouts.length === 0 ? (
                            <div className="p-20 text-center text-ink-tertiary italic">No payout requests yet</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {payouts.map((pr) => (
                                    <div key={pr.request_id} className="p-6 flex justify-between items-center bg-surface-secondary/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-surface-secondary rounded-xl flex items-center justify-center text-ink-tertiary0">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink-primary">${parseFloat(pr.amount).toFixed(2)}</p>
                                                <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest">{new Date(pr.created_at).toLocaleDateString()} • {pr.payout_method.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${pr.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                                            pr.status === 'pending' ? 'bg-sand-500/10 text-sand-500' :
                                                pr.status === 'rejected' ? 'bg-[#e11d48]/10 text-[#e11d48]' :
                                                    'bg-surface-secondary text-ink-secondary'
                                            }`}>
                                            {pr.status === 'completed' ? <CheckCircle size={10} /> : pr.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                                            {pr.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            <AnimatePresence>
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface-elevated w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-border-primary flex justify-between items-center bg-surface-secondary">
                                <h3 className="text-2xl font-black text-ink-primary uppercase italic">Withdraw Funds</h3>
                                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-ink-tertiary hover:text-ink-secondary">
                                    X
                                </button>
                            </div>
                            <form onSubmit={handleWithdraw} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Amount to Withdraw</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-ink-tertiary">$</span>
                                        <input
                                            type="number"
                                            required
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            step="0.01"
                                            max={wallet?.withdrawable_balance}
                                            className="w-full pl-12 pr-6 py-5 bg-surface-secondary rounded-2xl border-2 border-transparent focus:border-[#818cf8] outline-none transition-all font-black text-2xl"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-ink-tertiary text-right">Available: ${parseFloat(wallet?.withdrawable_balance || '0').toFixed(2)}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Payout Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['bank_transfer', 'paypal', 'crypto', 'wipay'].map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPayoutMethod(method)}
                                                className={`p-4 rounded-2xl border-2 font-bold text-xs capitalize transition-all ${payoutMethod === method ? 'border-[#818cf8] bg-[#818cf8]/10 text-[#6366f1]' : 'border-border-primary hover:border-border-primary'
                                                    }`}
                                            >
                                                {method.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-ink-primary text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-black/10 hover:scale-[1.02] transition-all"
                                >
                                    Confirm Withdrawal
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
