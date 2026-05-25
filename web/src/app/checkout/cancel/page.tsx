'use client';

import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Cancelled</h1>
                <p className="text-slate-600 mb-8">
                    Your payment was not completed. Your cart items are still saved.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/checkout')}
                        className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/cart')}
                        className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
