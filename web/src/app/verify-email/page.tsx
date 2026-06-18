'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function VerifyEmailInner() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await api.post('/auth/verify-email', { token });
                setStatus('success');
                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error) {
                console.error('Verification failed', error);
                setStatus('error');
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-surface-primary flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-surface-elevated rounded-3xl shadow-xl p-8 text-center">
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-border-primary border-t-teal-500 rounded-full animate-spin mx-auto" />
                        <h2 className="text-xl font-black text-ink-primary">Verifying Email...</h2>
                        <p className="text-ink-tertiary">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                            ✓
                        </div>
                        <h2 className="text-2xl font-black text-ink-primary">Email Verified!</h2>
                        <p className="text-ink-tertiary">Your account has been successfully verified. Redirecting to login...</p>
                        <Link href="/login" className="inline-block mt-4 text-accent-400 font-bold hover:underline">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                            ✕
                        </div>
                        <h2 className="text-2xl font-black text-ink-primary">Verification Failed</h2>
                        <p className="text-ink-tertiary">The link may be invalid or expired. Please try registering again or contact support.</p>
                        <Link href="/register" className="inline-block px-6 py-3 bg-surface-tertiary text-white rounded-xl font-bold mt-4">
                            Back to Register
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailInner />
        </Suspense>
    );
}
