'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

export default function GuestWelcomeModal() {
    const { isAuthenticated } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show modal if not authenticated and haven't seen it in this session
        if (!isAuthenticated && !sessionStorage.getItem('guest_welcome_seen')) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1000); // 1.5s delay
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('guest_welcome_seen', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 p-8 text-center relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    ✕
                </button>

                <div className="mb-6 flex justify-center text-4xl">
                    👋
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4">
                    Welcome to IslandHub!
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                    Islands funds' premier marketplace. Browse unique products, book local experiences, or rent gear.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/register"
                        className="block w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-teal-600/20"
                    >
                        Join the Community
                    </Link>

                    <Link
                        href="/register?type=vendor"
                        className="block w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-teal-600 text-slate-700 hover:text-teal-600 font-bold rounded-xl transition-colors"
                    >
                        Become a Vendor
                    </Link>

                    <button
                        onClick={handleClose}
                        className="block w-full py-3 px-4 text-slate-500 font-medium hover:text-slate-700 underline text-sm mt-4"
                    >
                        Wait, I'll just keep shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
