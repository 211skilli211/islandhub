'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from '@/lib/toast';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        const orderId = searchParams.get('order_id');

        if (paymentIntentId) {
            verifyPayment(paymentIntentId);
        } else if (orderId) {
            // Direct order ID passed, redirect to confirmation
            router.replace(`/orders/${orderId}/confirmation`);
        } else {
            // No params, check localStorage for pending order
            const pending = localStorage.getItem('pendingOrderRetry');
            if (pending) {
                try {
                    const { orderId: pendingOrderId } = JSON.parse(pending);
                    localStorage.removeItem('pendingOrderRetry');
                    router.replace(`/orders/${pendingOrderId}/confirmation`);
                } catch {
                    setVerifying(false);
                }
            } else {
                setVerifying(false);
            }
        }
    }, [searchParams, router]);

    const verifyPayment = async (paymentIntentId: string) => {
        try {
            // The webhook should have already processed the payment
            // Just redirect to order confirmation
            const orderId = searchParams.get('order_id');
            if (orderId) {
                router.replace(`/orders/${orderId}/confirmation`);
            } else {
                // Try to find the order by payment intent
                router.replace('/dashboard/orders');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please check your orders.');
            router.replace('/dashboard/orders');
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Confirming your order...</h1>
                    <p className="text-slate-600">Please wait while we verify your payment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
                <p className="text-slate-600 mb-8">Your order has been confirmed. You'll receive a confirmation email shortly.</p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/dashboard/orders')}
                        className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => router.push('/listings')}
                        className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
