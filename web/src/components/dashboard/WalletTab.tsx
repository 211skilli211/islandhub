'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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

    if (loading) return <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mx-auto" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Hub</h2>
                    <p className="text-slate-500 font-medium">Manage your earnings and payouts</p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-100"
                >
                    <Send size={16} /> Request Payout
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Balance</p>
                    <p className="text-3xl font-black text-slate-900">${parseFloat(wallet?.balance || '0').toFixed(2)}</p>
                </div>
                <div className="bg-emerald-50 p-8 rounded-4xl border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Withdrawable</p>
                    <p className="text-3xl font-black text-emerald-700">${parseFloat(wallet?.withdrawable_balance || '0').toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 p-8 rounded-4xl border border-amber-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Pending</p>
                    <p className="text-3xl font-black text-amber-700">${parseFloat(wallet?.pending_payouts || '0').toFixed(2)}</p>
                </div>
                <div className="bg-indigo-50 p-8 rounded-4xl border border-indigo-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">Lifetime</p>
                    <p className="text-3xl font-black text-indigo-700">${parseFloat(wallet?.lifetime_earnings || '0').toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction History */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><History size={20} /> Revenue Ledger</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {transactions.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 italic">No transactions yet</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {transactions.map((tx) => (
                                    <div key={tx.transaction_id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${parseFloat(tx.amount) > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                {parseFloat(tx.amount) > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black ${parseFloat(tx.amount) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {parseFloat(tx.amount) > 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-medium">{tx.notes || tx.reference_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payout History */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CreditCard size={20} /> Withdrawal Requests</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {payouts.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 italic">No payout requests yet</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {payouts.map((pr) => (
                                    <div key={pr.request_id} className="p-6 flex justify-between items-center bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">${parseFloat(pr.amount).toFixed(2)}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(pr.created_at).toLocaleDateString()} • {pr.payout_method.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${pr.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                            pr.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                pr.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-slate-100 text-slate-600'
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
                    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Withdraw Funds</h3>
                                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    X
                                </button>
                            </div>
                            <form onSubmit={handleWithdraw} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount to Withdraw</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                                        <input
                                            type="number"
                                            required
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            step="0.01"
                                            max={wallet?.withdrawable_balance}
                                            className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-black text-2xl"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-right">Available: ${parseFloat(wallet?.withdrawable_balance || '0').toFixed(2)}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payout Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['bank_transfer', 'paypal', 'crypto', 'wipay'].map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPayoutMethod(method)}
                                                className={`p-4 rounded-2xl border-2 font-bold text-xs capitalize transition-all ${payoutMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                {method.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-all"
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
