'use client';

import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-3xl font-bold text-ink-primary mb-4">Payment Cancelled</h1>
                <p className="text-ink-secondary mb-8">
                    Your payment was not completed. Your cart items are still saved.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/checkout')}
                        className="w-full py-4 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/cart')}
                        className="w-full py-4 bg-surface-elevated border-2 border-border-primary text-ink-secondary font-bold rounded-xl hover:bg-surface-primary transition-all"
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
