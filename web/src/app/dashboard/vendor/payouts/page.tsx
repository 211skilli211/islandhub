'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Wallet {
    wallet_id: number;
    balance: string;
    withdrawable_balance: string;
    pending_payouts: string;
    lifetime_earnings: string;
    currency: string;
    partner_type: string;
    store_id?: number;
}

interface WalletTransaction {
    transaction_id: number;
    amount: string;
    transaction_type: string;
    reference_type?: string;
    notes?: string;
    created_at: string;
    balance_before?: string;
    balance_after?: string;
}

interface PayoutRequest {
    request_id: number;
    amount: string;
    payout_method: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
    created_at: string;
    processed_at?: string;
    rejection_reason?: string;
    notes?: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-600',
};

const txnTypeLabel: Record<string, string> = {
    sale: '💰 Sale',
    delivery_fee: '🚗 Delivery Fee',
    commission: '📊 Commission',
    payout: '💸 Payout',
    refund: '↩️  Refund',
    adjustment: '⚖️  Adjustment',
    subscription_reward: '🎁 Subscription Reward',
    tip: '🙏 Tip',
};

function formatCurrency(amount: string | number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function VendorPayoutsPage() {
    const { token, user } = useAuthStore();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Payout request modal state
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
    const [payoutDetails, setPayoutDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        if (!token) return;
        Promise.all([
            fetch(`${API_URL}/api/financials/wallet`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/api/financials/transactions?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/api/financials/payouts/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(async ([wRes, tRes, pRes]) => {
            if (wRes.ok) setWallet(await wRes.json());
            if (tRes.ok) setTransactions(await tRes.json());
            if (pRes.ok) setPayoutRequests(await pRes.json());
        }).catch(() => {
            setError('Failed to load financial data. Please try again.');
        }).finally(() => setLoading(false));
    }, [token]);

    const handleRequestPayout = async () => {
        if (!wallet || !payoutAmount || Number(payoutAmount) <= 0) return;
        setSubmitting(true);
        setSubmitError(null);

        let parsedDetails: Record<string, string> = {};
        try {
            parsedDetails = payoutDetails ? JSON.parse(payoutDetails) : {};
        } catch {
            setSubmitError('Payout details must be valid JSON (e.g. {"bank": "RBC", "account": "123456"})');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/financials/payouts/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    wallet_id: wallet.wallet_id,
                    amount: Number(payoutAmount),
                    payout_method: payoutMethod,
                    payout_details: parsedDetails,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setSubmitError(data.message || 'Failed to submit payout request');
            } else {
                setSubmitSuccess(true);
                setPayoutRequests(prev => [data, ...prev]);
                // Refresh wallet
                const wRes = await fetch(`${API_URL}/api/financials/wallet`, { headers: { Authorization: `Bearer ${token}` } });
                if (wRes.ok) setWallet(await wRes.json());
                setTimeout(() => {
                    setShowPayoutModal(false);
                    setSubmitSuccess(false);
                    setPayoutAmount('');
                    setPayoutDetails('');
                }, 1500);
            }
        } catch {
            setSubmitError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Payouts & Wallet</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your earnings and payout requests</p>
                </div>
                <Link href="/dashboard" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                    ← Back to Dashboard
                </Link>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-rose-700 text-sm font-bold">
                    {error}
                </div>
            )}

            {/* Wallet Card */}
            {wallet ? (
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-teal-200 text-xs font-black uppercase tracking-widest">Total Balance</p>
                            <p className="text-4xl font-black mt-1">{formatCurrency(wallet.balance, wallet.currency)}</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl">💰</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-teal-200 text-[10px] font-black uppercase tracking-wider">Withdrawable</p>
                            <p className="text-white font-black text-lg mt-0.5">{formatCurrency(wallet.withdrawable_balance, wallet.currency)}</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-teal-200 text-[10px] font-black uppercase tracking-wider">Pending Payouts</p>
                            <p className="text-white font-black text-lg mt-0.5">{formatCurrency(wallet.pending_payouts, wallet.currency)}</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-teal-200 text-[10px] font-black uppercase tracking-wider">Lifetime Earned</p>
                            <p className="text-white font-black text-lg mt-0.5">{formatCurrency(wallet.lifetime_earnings, wallet.currency)}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => setShowPayoutModal(true)}
                            disabled={Number(wallet.withdrawable_balance) <= 0}
                            className="bg-white text-teal-700 font-black px-6 py-3 rounded-2xl hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            Request Payout →
                        </button>
                        {Number(wallet.withdrawable_balance) <= 0 && (
                            <p className="text-teal-200 text-xs mt-2">No withdrawable balance yet. Complete sales to earn.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 rounded-3xl p-8 text-center">
                    <p className="text-4xl mb-3">💳</p>
                    <p className="font-black text-slate-700">No wallet found</p>
                    <p className="text-slate-500 text-sm mt-1">Your wallet will be created automatically once you start making sales.</p>
                </div>
            )}

            {/* Payout Requests */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-black text-slate-900">Payout Requests</h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{payoutRequests.length} requests</span>
                </div>
                {payoutRequests.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="text-sm text-slate-500 font-bold">No payout requests yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {payoutRequests.map(req => (
                            <div key={req.request_id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-900">{formatCurrency(req.amount)}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        via <span className="font-bold">{req.payout_method.replace('_', ' ')}</span> · {timeAgo(req.created_at)}
                                    </p>
                                    {req.rejection_reason && (
                                        <p className="text-xs text-rose-500 mt-0.5">Reason: {req.rejection_reason}</p>
                                    )}
                                </div>
                                {req.processed_at && (
                                    <p className="text-xs text-slate-400">
                                        Processed {timeAgo(req.processed_at)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-black text-slate-900">Transaction History</h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Last 20</span>
                </div>
                {transactions.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <p className="text-3xl mb-2">💳</p>
                        <p className="text-sm text-slate-500 font-bold">No transactions yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {transactions.map(txn => {
                            const isPositive = Number(txn.amount) > 0;
                            return (
                                <div key={txn.transaction_id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            {txnTypeLabel[txn.transaction_type] || txn.transaction_type}
                                        </p>
                                        {txn.notes && <p className="text-xs text-slate-400 mt-0.5">{txn.notes}</p>}
                                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(txn.created_at)}</p>
                                    </div>
                                    <p className={`font-black text-base ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {isPositive ? '+' : ''}{formatCurrency(txn.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Request Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => { setShowPayoutModal(false); setSubmitError(null); }}
                    />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900">Request Payout</h3>
                            <button
                                onClick={() => { setShowPayoutModal(false); setSubmitError(null); }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {submitSuccess ? (
                            <div className="text-center py-6">
                                <p className="text-5xl mb-3">✅</p>
                                <p className="font-black text-emerald-700 text-lg">Payout requested!</p>
                                <p className="text-slate-500 text-sm mt-1">Your request is being reviewed.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                                        Amount ({wallet?.currency || 'USD'})
                                    </label>
                                    <input
                                        id="payout-amount"
                                        type="number"
                                        min="1"
                                        max={wallet?.withdrawable_balance}
                                        step="0.01"
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Available: <span className="font-bold text-teal-600">{formatCurrency(wallet?.withdrawable_balance || 0, wallet?.currency)}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                                        Payout Method
                                    </label>
                                    <select
                                        id="payout-method"
                                        value={payoutMethod}
                                        onChange={e => setPayoutMethod(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                                    >
                                        <option value="bank_transfer">🏦 Bank Transfer</option>
                                        <option value="paypal">💙 PayPal</option>
                                        <option value="wipay">🌴 WiPay</option>
                                        <option value="crypto">₿ Crypto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                                        Payout Details (JSON)
                                    </label>
                                    <textarea
                                        id="payout-details"
                                        value={payoutDetails}
                                        onChange={e => setPayoutDetails(e.target.value)}
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 resize-none"
                                        placeholder={'{\n  "bank": "RBC",\n  "account": "123456"\n}'}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Provide the account details for your chosen method as JSON.</p>
                                </div>

                                {submitError && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm font-bold">
                                        {submitError}
                                    </div>
                                )}

                                <button
                                    id="submit-payout"
                                    onClick={handleRequestPayout}
                                    disabled={submitting || !payoutAmount || Number(payoutAmount) <= 0}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3.5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Payout Request →'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
