'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

function ResetPasswordContent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            toast.error('Invalid reset link');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/reset-password', { token, new_password: password });
            toast.success('Password reset successfully');
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-surface-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <EmojiIcon emoji="⚠️" size={28} className="text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-ink-primary">Invalid Link</h2>
                    <p className="mt-2 text-sm text-ink-secondary">This password reset link is invalid or has expired.</p>
                    <div className="mt-6">
                        <a href="/forgot-password" className="text-accent-400 hover:text-accent-500 font-medium">
                            Request a new reset link
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-surface-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-ink-primary">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-ink-secondary">
                        Enter your new password below
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-surface-elevated dark:bg-surface-tertiary py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary">
                                    New Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-xl bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-teal-500 transition-all duration-200 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary">
                                    Confirm New Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-xl bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-teal-500 transition-all duration-200 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>

                            <div className="text-center">
                                <a href="/login" className="text-sm text-accent-400 hover:text-accent-500">
                                    Back to login
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-ink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}