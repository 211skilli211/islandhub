import React from 'react';
import Link from 'next/link';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="bg-teal-900 py-24 px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    How <span className="text-teal-400">IslandHub</span> Works
                </h1>
                <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                    The simplest way to buy, sell, rent, and fundraise in the Caribbean.
                </p>
            </div>

            {/* Steps */}
            <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
                    {[
                        { icon: '🔍', title: 'Browse', desc: 'Explore products, rentals, and services from vetted island vendors.' },
                        { icon: '❤️', title: 'Support', desc: 'Back campaigns that matter. Fund community projects directly.' },
                        { icon: '💳', title: 'Secure Pay', desc: 'Pay safely using Stripe, PayPal, or WiPay.' },
                        { icon: '🚀', title: 'Track Impact', desc: 'Get updates on your orders and the impact of your donations.' },
                    ].map((step, idx) => (
                        <div key={idx} className="relative group p-6 rounded-3xl hover:bg-slate-50 transition-colors">
                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12">Trusted by the Community</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <div className="h-12 bg-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-500">Stripe</div>
                        <div className="h-12 bg-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-500">PayPal</div>
                        <div className="h-12 bg-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-500">WiPay</div>
                        <div className="h-12 bg-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-500">Verified Vendors</div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 py-24 text-center">
                <h2 className="text-3xl font-black text-white mb-8">Ready to get started?</h2>
                <div className="flex justify-center gap-4">
                    <Link href="/register" className="px-8 py-4 bg-white text-teal-800 rounded-xl font-bold shadow-xl hover:bg-teal-50 transition-all">
                        Join Now
                    </Link>
                    <Link href="/listings" className="px-8 py-4 bg-teal-800 text-white rounded-xl font-bold shadow-xl hover:bg-teal-900 transition-all">
                        Browse Listings
                    </Link>
                </div>
            </div>
        </div>
    );
}
