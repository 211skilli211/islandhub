'use client';

import { useState } from 'react';
import Link from 'next/link';

const sections = [
    {
        id: 'intro',
        title: 'Introduction',
        content: `IslandHub respects your privacy. This policy explains how we collect, use, and protect your personal information. By using our platform, you consent to the practices described herein.`
    },
    {
        id: 'collect',
        title: 'What We Collect',
        content: `We collect: Account information (name, email, phone), Payment details (processed securely via third parties), Profile data (photos, business info), Usage data (pages visited, interactions), and Device data (IP address, browser type).`
    },
    {
        id: 'use',
        title: 'How We Use Data',
        content: `Your data enables: Platform functionality and account management, Processing transactions and payments, Communication about orders and updates, Personalized recommendations, Analytics to improve our service, and Legal compliance.`
    },
    {
        id: 'share',
        title: 'Data Sharing',
        content: `We share data with: Payment processors (Stripe, PayPal, WiPay) for transaction processing, Vendors for order fulfillment, Service providers for platform operations, and Legal authorities when required. We never sell your personal data.`
    },
    {
        id: 'cookies',
        title: 'Cookies & Tracking',
        content: `We use cookies to: Keep you logged in, Remember preferences, Analyze traffic, and Improve user experience. You can disable cookies in browser settings, though some features may not work properly.`
    },
    {
        id: 'security',
        title: 'Security',
        content: `We implement: 256-bit SSL encryption, Secure payment processing (PCI-DSS compliant), Regular security audits, Access controls and monitoring, and Data backup procedures. While we strive for security, no system is 100% impenetrable.`
    },
    {
        id: 'rights',
        title: 'Your Rights',
        content: `You can: Access your data, Correct inaccuracies, Request deletion, Object to processing, Export your data, and Withdraw consent. Contact privacy@islandhub.co to exercise these rights.`
    },
    {
        id: 'retention',
        title: 'Data Retention',
        content: `We retain data: As long as your account is active, As needed for transactions and disputes, For legal/compliance requirements (up to 7 years), and As otherwise disclosed.`
    },
    {
        id: 'children',
        title: 'Children',
        content: `IslandHub is not intended for children under 13. We do not knowingly collect data from children. If we learn of such collection, we will delete it immediately.`
    },
    {
        id: 'changes',
        title: 'Changes',
        content: `We may update this policy periodically. We will notify users of material changes via email and platform notice. Continued use after changes constitutes acceptance.`
    },
    {
        id: 'contact',
        title: 'Contact',
        content: `Questions? Contact our Privacy Team at privacy@islandhub.co or visit /contact.`
    }
];

export default function PrivacyPage() {
    const [activeSection, setActiveSection] = useState('intro');

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-teal-900 py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Privacy Policy</h1>
                    <p className="text-teal-100 text-lg">How we protect and use your data</p>
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
                                    For questions about this policy, contact <Link href="/contact" className="text-teal-600 hover:underline">privacy@islandhub.co</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
