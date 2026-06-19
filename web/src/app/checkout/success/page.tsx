'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        const orderId = searchParams.get('order_id');

        if (paymentIntentId) {
            verifyPayment(paymentIntentId);
        } else if (orderId) {
            router.replace(`/orders/${orderId}/confirmation`);
        } else {
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
            const orderId = searchParams.get('order_id');
            if (orderId) {
                router.replace(`/orders/${orderId}/confirmation`);
            } else {
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
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-ink-primary mb-2">Confirming your order...</h1>
                    <p className="text-ink-secondary">Please wait while we verify your payment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                <EmojiIcon emoji="✅" size={48} className="text-6xl mb-4" />
                <h1 className="text-3xl font-bold text-ink-primary mb-4">Payment Successful!</h1>
                <p className="text-ink-secondary mb-8">Your order has been confirmed. You'll receive a confirmation email shortly.</p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/dashboard/orders')}
                        className="w-full py-4 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => router.push('/listings')}
                        className="w-full py-4 bg-surface-elevated border-2 border-border-primary text-ink-secondary font-bold rounded-xl hover:bg-surface-primary transition-all"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-ink-primary mb-2">Loading...</h1>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
