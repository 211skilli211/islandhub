'use client';

import Link from 'next/link';

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🚫</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Account Suspended</h1>
                <p className="text-slate-600 mb-6">
                    Your account has been suspended by an administrator due to a violation of our terms or suspicious activity.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm text-slate-500">
                    If you believe this is a mistake, please contact our support team.
                </div>
                <Link
                    href="/contact"
                    className="block w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Contact Support
                </Link>
                <Link
                    href="/"
                    className="block mt-4 text-sm text-slate-400 hover:text-slate-600 font-bold"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
