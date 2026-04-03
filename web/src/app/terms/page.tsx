'use client';

import { useState } from 'react';
import Link from 'next/link';

const sections = [
    {
        id: 'intro',
        title: 'Introduction',
        content: `Welcome to IslandHub. By accessing our platform, you agree to these terms. IslandHub is a marketplace connecting vendors, customers, and causes across the Caribbean. Our platform enables buying, selling, renting, and fundraising activities.`
    },
    {
        id: 'account',
        title: 'Account Responsibilities',
        content: `You are responsible for maintaining account security. Provide accurate information during registration. You must be 18+ to use IslandHub. Keep your password secure and notify us of unauthorized access immediately.`
    },
    {
        id: 'vendor',
        title: 'Vendor Terms',
        content: `Vendors must verify their identity before selling. All listings must accurately describe products/services. Prohibited items cannot be sold. Vendors must fulfill orders within stated timeframes. Commission fees apply per sale as outlined in your pricing plan.`
    },
    {
        id: 'buyer',
        title: 'Buyer Rights',
        content: `Buyers receive 14-day buyer protection on most orders. Payments are held in escrow until delivery confirmed. Disputes can be opened within 14 days of delivery. refunds are processed per our refund policy.`
    },
    {
        id: 'payments',
        title: 'Payments & Fees',
        content: `All prices are in USD unless stated. We accept major credit cards, PayPal, and WiPay. Platform fees: 5% Basic, 3% Premium, 2% Enterprise. VIP membership is $15/month for 10% off orders. Payment is due at time of purchase.`
    },
    {
        id: 'campaigns',
        title: 'Fundraising Campaigns',
        content: `Campaign owners must use funds for stated purposes. We deduct platform fees from raised amounts. Campaigns violating our community guidelines will be removed. Donors receive updates on campaign progress.`
    },
    {
        id: 'prohibited',
        title: 'Prohibited Activities',
        content: `The following are prohibited: illegal items, weapons, drugs, counterfeit goods, fraud, harassment, spam. Violations result in account termination and potential legal action.`
    },
    {
        id: 'liability',
        title: 'Limitation of Liability',
        content: `IslandHub is not liable for: transactions between users, delivery delays beyond our control, acts of third-party payment processors. Our liability is limited to fees paid in the last 30 days.`
    },
    {
        id: 'contact',
        title: 'Contact',
        content: `Questions about these terms? Contact us at legal@islandhub.co or visit /contact.`
    }
];

export default function TermsPage() {
    const [activeSection, setActiveSection] = useState('intro');

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-slate-900 py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Terms of Service</h1>
                    <p className="text-slate-400 text-lg">Last updated: April 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-6xl mx-auto px-4 py-20">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-[3rem] p-6 shadow-lg border border-slate-100 sticky top-8">
                            <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Contents</h3>
                            <div className="space-y-2">
                                {sections.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                            activeSection === s.id 
                                                ? 'bg-teal-600 text-white' 
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {s.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-[3rem] p-10 shadow-lg border border-slate-100">
                            {sections.filter(s => s.id === activeSection).map(s => (
                                <div key={s.id}>
                                    <h2 className="text-2xl font-black text-slate-900 mb-6">{s.title}</h2>
                                    <p className="text-slate-600 leading-relaxed text-lg">{s.content}</p>
                                </div>
                            ))}
                            
                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <p className="text-slate-500 text-sm">
                                    By using IslandHub, you agree to these terms. For questions, contact <Link href="/contact" className="text-teal-600 hover:underline">support@islandhub.co</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
