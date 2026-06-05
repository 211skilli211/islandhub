'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser({ email, password });
            login(data.token, data.user, data.refresh_token);
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);

            const details = error.response?.data?.details;
            const message = error.response?.data?.message;

            if (details && Array.isArray(details) && details.length > 0) {
                const firstError = details[0];
                const detailMsg = firstError.field
                    ? `${firstError.field}: ${firstError.message}`
                    : firstError.message;
                toast.error(detailMsg, {
                    duration: 5000,
                    style: { maxWidth: '400px' }
                });
            } else if (message) {
                toast.error(message, {
                    duration: 4000,
                    style: { maxWidth: '400px' }
                });
            } else {
                toast.error('Login failed. Please check your credentials.', {
                    duration: 4000,
                    style: { maxWidth: '400px' }
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-ink-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-ink-primary">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-ink-600">
                        Or{' '}
                        <Link href="/register" className="font-medium text-accent-400 hover:text-accent-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-surface-elevated dark:bg-surface-tertiary py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-xl bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-teal-500 transition-all duration-200 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary">
                                    Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-xl bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-teal-500 transition-all duration-200 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-5 w-5 text-accent-400 focus:ring-accent-400 border-border-primary dark:border-border-primary rounded-lg cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-ink-secondary dark:text-ink-tertiary">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-accent-400 hover:text-accent-500">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 disabled:opacity-50"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>

                                {/* Google Auth temporarily disabled */}
                                {/* Will be re-enabled once OAuth credentials are configured */}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
