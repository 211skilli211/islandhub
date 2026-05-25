'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from '@/lib/toast';

interface CryptoPayment {
    payment_id: string;
    coin: string;
    coin_name: string;
    amount_xcd: number;
    crypto_amount: string;
    exchange_rate: number;
    payment_address: string;
    qr_data: string;
    status: string;
    expires_at: string;
    network: string;
    confirmations_required: number;
}

export default function CryptoCheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment');

    const [payment, setPayment] = useState<CryptoPayment | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState('USDT');
    const [supportedCoins, setSupportedCoins] = useState<any[]>([]);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        fetchSupportedCoins();
        if (paymentId) {
            fetchPaymentStatus();
        }
    }, [paymentId]);

    const fetchSupportedCoins = async () => {
        try {
            const { data } = await api.get('/payments/crypto/supported-coins');
            setSupportedCoins(data.coins || []);
        } catch (error) {
            console.error('Failed to fetch supported coins:', error);
        }
    };

    const fetchPaymentStatus = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/payments/crypto/status/${paymentId}`);
            if (data.status === 'completed') {
                toast.success('Payment confirmed!');
                router.push(`/orders/${data.order_id}/confirmation`);
                return;
            }
            if (data.status === 'expired') {
                toast.error('Payment expired. Please try again.');
                router.push('/checkout');
                return;
            }
            setPayment(data);
        } catch (error) {
            console.error('Failed to fetch payment:', error);
            toast.error('Failed to load payment details');
        } finally {
            setLoading(false);
        }
    };

    const handleCoinChange = async (coin: string) => {
        setSelectedCoin(coin);
        // Recalculate crypto amount
        try {
            const { data } = await api.post('/payments/crypto/convert', {
                amount_xcd: payment?.amount_xcd || 0,
                coin,
            });
            if (payment) {
                setPayment({
                    ...payment,
                    coin,
                    crypto_amount: data.crypto_amount,
                    exchange_rate: data.exchange_rate,
                });
            }
        } catch (error) {
            console.error('Failed to convert:', error);
        }
    };

    const handleVerifyPayment = async () => {
        if (!payment) return;
        try {
            setChecking(true);
            const { data } = await api.post('/payments/crypto/verify', {
                payment_id: payment.payment_id,
            });
            if (data.status === 'completed') {
                toast.success('Payment confirmed!');
                router.push(`/orders/${data.order_id}/confirmation`);
            } else {
                toast.info('Payment not yet confirmed. Please wait for blockchain confirmations.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Verification failed');
        } finally {
            setChecking(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading payment...</h1>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Payment not found</h1>
                    <button onClick={() => router.push('/checkout')} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl">
                        Back to Checkout
                    </button>
                </div>
            </div>
        );
    }

    const timeLeft = new Date(payment.expires_at).getTime() - Date.now();
    const minutesLeft = Math.max(0, Math.floor(timeLeft / 60000));

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">₿</div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Pay with Cryptocurrency</h1>
                    <p className="text-slate-600">Send the exact amount to the address below</p>
                </div>

                {/* Timer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                    <p className="text-amber-700 font-bold">
                        ⏱ Payment expires in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Coin Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Select Cryptocurrency</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {supportedCoins.map((coin) => (
                            <button
                                key={coin.symbol}
                                onClick={() => handleCoinChange(coin.symbol)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                    selectedCoin === coin.symbol
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                <div className="text-2xl mb-1">
                                    {coin.symbol === 'BTC' ? '₿' : coin.symbol === 'ETH' ? 'Ξ' : coin.symbol === 'USDT' ? '₮' : coin.symbol === 'USDC' ? 'Ⓤ' : '◎'}
                                </div>
                                <div className="font-bold text-slate-900 text-sm">{coin.symbol}</div>
                                <div className="text-xs text-slate-500">{coin.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Details</h2>

                    <div className="space-y-4">
                        {/* Amount */}
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-sm text-slate-500">Amount (XCD)</p>
                                <p className="text-xl font-bold text-slate-900">${payment.amount_xcd.toFixed(2)} XCD</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Crypto Amount</p>
                                <p className="text-xl font-bold text-teal-600">{payment.crypto_amount} {payment.coin}</p>
                            </div>
                        </div>

                        {/* Exchange Rate */}
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Exchange Rate</span>
                            <span>1 XCD = {payment.exchange_rate} {payment.coin}</span>
                        </div>

                        {/* Network */}
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Network</span>
                            <span>{payment.network}</span>
                        </div>

                        {/* Payment Address */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-2">Send to this address</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm font-mono text-slate-900 break-all bg-white p-3 rounded-lg border border-slate-200">
                                    {payment.payment_address}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(payment.payment_address)}
                                    className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shrink-0"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        {/* QR Code placeholder */}
                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-sm text-slate-500 mb-2">Scan QR Code</p>
                            <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📱</div>
                                    <p className="text-xs text-slate-400">QR Code</p>
                                    <p className="text-xs text-slate-400">{payment.coin} Network</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-blue-900 mb-2">📋 Payment Instructions</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Open your {payment.coin} wallet</li>
                        <li>Send <strong>exactly {payment.crypto_amount} {payment.coin}</strong> to the address above</li>
                        <li>Wait for {payment.confirmations_required} blockchain confirmations</li>
                        <li>Click "Verify Payment" below once sent</li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleVerifyPayment}
                        disabled={checking}
                        className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50"
                    >
                        {checking ? 'Verifying...' : '✓ I Have Sent the Payment'}
                    </button>
                    <button
                        onClick={() => router.push('/checkout')}
                        className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Choose Different Payment Method
                    </button>
                </div>
            </div>
        </div>
    );
}
