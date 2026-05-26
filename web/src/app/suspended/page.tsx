'use client';

import Link from 'next/link';

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-surface-elevated rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🚫</span>
                </div>
                <h1 className="text-2xl font-black text-ink-primary mb-2">Account Suspended</h1>
                <p className="text-ink-secondary mb-6">
                    Your account has been suspended by an administrator due to a violation of our terms or suspicious activity.
                </p>
                <div className="bg-surface-primary rounded-xl p-4 mb-6 text-sm text-ink-tertiary">
                    If you believe this is a mistake, please contact our support team.
                </div>
                <Link
                    href="/contact"
                    className="block w-full py-3 px-4 bg-surface-tertiary text-white font-bold rounded-xl hover:bg-surface-tertiary transition-colors"
                >
                    Contact Support
                </Link>
                <Link
                    href="/"
                    className="block mt-4 text-sm text-ink-tertiary hover:text-ink-secondary font-bold"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
