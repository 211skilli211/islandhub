'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

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
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Invalid Link</h2>
                    <p className="mt-2 text-sm text-slate-600">This password reset link is invalid or has expired.</p>
                    <div className="mt-6">
                        <a href="/forgot-password" className="text-teal-600 hover:text-teal-500 font-medium">
                            Request a new reset link
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Enter your new password below
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                    Confirm New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>

                            <div className="text-center">
                                <a href="/login" className="text-sm text-teal-600 hover:text-teal-500">
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}