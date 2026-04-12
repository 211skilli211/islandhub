'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import Link from 'next/link';
import WiPayButton from '@/components/WiPayButton';
import PayPalButton from '@/components/PayPalButton';
import CryptoPayment from '@/components/CryptoPayment';
import PaymentProvider, { usePayment } from '@/components/payment/PaymentProvider';

const CheckoutForm = ({ campaignId, campaignTitle }: { campaignId: string, campaignTitle: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [amount, setAmount] = useState(50);
    const [paymentMethod, setPaymentMethod] = useState<'wipay' | 'paypal' | 'crypto'>('wipay');
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            const { data } = await api.post('/donations/create-intent', {
                campaign_id: campaignId,
                amount: amount,
                currency: 'usd',
            });

            const { clientSecret } = data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    await api.post('/donations/confirm', {
                        payment_intent_id: result.paymentIntent.id,
                        status: result.paymentIntent.status
                    });

                    setSuccess(true);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6 transition-transform hover:scale-110">
                    <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Thank You!</h2>
                <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
                    Your donation of <span className="text-teal-600 font-bold">${amount}</span> for <span className="font-bold">"{campaignTitle}"</span> was successful.
                </p>
                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="block w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black shadow-xl shadow-teal-100 transition-all"
                    >
                        View My Donations
                    </Link>
                    <Link
                        href="/campaigns"
                        className="block w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                    >
                        Browse More Campaigns
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Select Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[25, 50, 100].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-3 rounded-xl border-2 font-bold transition-all ${amount === val
                                ? 'bg-teal-50 border-teal-500 text-teal-700'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                        >
                            ${val}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all text-lg font-medium"
                        placeholder="Other amount"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Payment Method</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                        { key: 'wipay', label: '💳 Card', icon: '💳' },
                        { key: 'paypal', label: '🅿️ PayPal', icon: '🅿️' },
                        { key: 'crypto', label: '₿ Crypto', icon: '₿' }
                    ].map((method) => (
                        <button
                            key={method.key}
                            type="button"
                            onClick={() => setPaymentMethod(method.key as any)}
                            className={`py-3 rounded-xl border-2 font-bold transition-all ${paymentMethod === method.key
                                ? 'bg-teal-50 border-teal-500 text-teal-700'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Payment Details</label>
                {paymentMethod === 'wipay' && (
                    <>
                        <WiPayButton
                            campaignId={campaignId}
                            amount={amount}
                            onSuccess={() => setSuccess(true)}
                            onError={setError}
                        />
                        <p className="mt-3 text-[10px] text-slate-400 uppercase tracking-tight text-center font-bold">
                            🔒 Secure Payment via WiPay
                        </p>
                    </>
                )}
                {paymentMethod === 'paypal' && (
                    <PayPalButton
                        campaignId={campaignId}
                        amount={amount}
                        onSuccess={() => setSuccess(true)}
                        onError={setError}
                    />
                )}
                {paymentMethod === 'crypto' && (
                    <CryptoPayment
                        campaignId={campaignId}
                        amount={amount}
                        onSuccess={() => setSuccess(true)}
                        onError={setError}
                    />
                )}
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-rose-700 text-sm font-medium">{error}</p>
                </div>
            )}

            {paymentMethod === 'wipay' && (
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="w-full py-5 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {processing ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : `Donate ${amount.toLocaleString()}`}
                </button>
            )}
        </form>
    );
};

const DonationWrapper = ({ campaignId, campaignTitle }: { campaignId: string, campaignTitle: string }) => {
    const { stripe, isLoaded } = usePayment();

    if (!isLoaded) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600" />
            </div>
        );
    }

    return (
        <Elements stripe={stripe}>
            <CheckoutForm campaignId={campaignId} campaignTitle={campaignTitle} />
        </Elements>
    );
};

export default function CheckoutPage() {
    const params = useParams();
    const id = params.id as string;
    const [campaign, setCampaign] = useState<any>(null);

    useEffect(() => {
        api.get(`/campaigns/${id}`).then(res => setCampaign(res.data)).catch(console.error);
    }, [id]);

    return (
        <PaymentProvider>
            <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4">
                <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Secure Donation</h1>
                            {campaign && (
                                <p className="text-slate-500 font-medium">
                                    Supporting <span className="text-teal-600 font-bold">"{campaign.title}"</span>
                                </p>
                            )}
                        </div>

                        <DonationWrapper campaignId={id} campaignTitle={campaign?.title || 'this campaign'} />
                    </div>
                </div>
            </div>
        </PaymentProvider>
    );
}
