'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqCategories = [
    {
        id: 'general',
        label: 'General',
        icon: '🏝️',
        questions: [
            {
                q: 'What is IslandHub?',
                a: 'IslandHub is the premier marketplace for the Caribbean, connecting local vendors, customers, and causes. We provide a platform for buying and selling goods, renting properties and equipment, fundraising for causes, and building community.'
            },
            {
                q: 'Which islands do you serve?',
                a: 'We currently serve vendors and customers across the Caribbean including Barbados, Jamaica, Trinidad & Tobago, Bahamas, St. Lucia, Antigua, and many more islands. Our platform is expanding to serve all Caribbean communities.'
            },
            {
                q: 'Is IslandHub free to use?',
                a: 'Yes! IslandHub is free to join as a buyer. Vendors can start with our Basic plan (free) or upgrade to Premium for lower commissions and more features. Visit our Pricing page for details.'
            },
            {
                q: 'How do I get started?',
                a: 'Simply create an account at /register, verify your email, and you can start browsing immediately. To sell or rent, complete your vendor profile and set up your store.'
            }
        ]
    },
    {
        id: 'vendors',
        label: 'Vendors',
        icon: '🛍️',
        questions: [
            {
                q: 'How do I become a vendor?',
                a: 'Click "Become a Vendor" in the navigation, choose your plan, complete your profile, and start listing! We verify all vendors to ensure a safe marketplace.'
            },
            {
                q: 'What are the fees?',
                a: 'Our Basic plan is free with 5% commission on sales. Premium ($99/mo) has 3% commission, and Enterprise ($299/mo) has 2%. View our Pricing page for full details.'
            },
            {
                q: 'How do I receive payments?',
                a: 'We support Stripe, PayPal, and WiPay. Connect your preferred payment method in your vendor dashboard to receive payouts directly to your bank account.'
            },
            {
                q: 'Can I sell internationally?',
                a: 'Yes! IslandHub connects Caribbean vendors with customers worldwide. You can set shipping destinations and preferences for each listing.'
            }
        ]
    },
    {
        id: 'buyers',
        label: 'Buyers',
        icon: '🛒',
        questions: [
            {
                q: 'How do I purchase items?',
                a: 'Browse listings, add items to your cart, and checkout securely. We accept major credit cards, PayPal, and mobile money through WiPay.'
            },
            {
                q: 'Is my payment secure?',
                a: 'Absolutely. All payments are processed through secure, PCI-compliant payment processors. Funds are held in escrow until delivery is confirmed.'
            },
            {
                q: 'What is the VIP program?',
                a: 'Island VIP is our loyalty program. For $15/month, members get 10% off every order, double reward points, and early access to deals.'
            },
            {
                q: 'How do I track my order?',
                a: 'Visit your dashboard to see all order statuses. Vendors provide tracking numbers when shipped. You\'ll receive notifications at each step.'
            }
        ]
    },
    {
        id: 'campaigns',
        label: 'Fundraising',
        icon: '❤️',
        questions: [
            {
                q: 'How do I start a campaign?',
                a: 'Go to /campaigns/new, describe your cause, set a goal, and share! All campaigns are reviewed to ensure authenticity.'
            },
            {
                q: 'Where do the funds go?',
                a: 'Funds go directly to the campaign owner\'s connected account. We deduct a small platform fee (5% for individuals, 3% for organizations).'
            },
            {
                q: 'Are there campaigns for nonprofits?',
                a: 'Yes! Verified nonprofits have 0% platform fees. Apply for nonprofit status through /contact.'
            },
            {
                q: 'How can I donate?',
                a: 'Browse active campaigns, select "Donate," choose your amount, and complete payment. Every contribution makes a difference.'
            }
        ]
    },
    {
        id: 'support',
        label: 'Support',
        icon: '💬',
        questions: [
            {
                q: 'How do I contact support?',
                a: 'Visit /contact to send us a message. We respond within 24-48 hours. For urgent matters, WhatsApp us at +1 (246) 555-0123.'
            },
            {
                q: 'What if something goes wrong?',
                a: 'Open a dispute through your order. Our team will mediate to ensure fair resolution for both buyer and seller.'
            },
            {
                q: 'Can I get a refund?',
                a: 'Refund policies vary by vendor. If an item isn\'t as described, open a dispute within 14 days for a full refund.'
            }
        ]
    }
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('general');
    const [openQuestions, setOpenQuestions] = useState<string[]>([]);

    const toggleQuestion = (qId: string) => {
        setOpenQuestions(prev => 
            prev.includes(qId) 
                ? prev.filter(id => id !== qId)
                : [...prev, qId]
        );
    };

    const activeFaq = faqCategories.find(c => c.id === activeCategory);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10">
                        Help Center
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Frequently Asked Questions</h1>
                    <p className="text-xl text-teal-50/80">Find quick answers to common questions about IslandHub.</p>
                </div>
            </section>

            {/* Search */}
            <section className="max-w-2xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white p-2 rounded-[2rem] shadow-2xl flex items-center gap-4">
                    <span className="pl-6 text-2xl">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search for answers..."
                        className="flex-1 py-4 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                    />
                </div>
            </section>

            {/* FAQ Content */}
            <section className="max-w-6xl mx-auto px-4 py-20">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-[3rem] p-6 shadow-lg border border-slate-100 sticky top-8">
                            <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Categories</h3>
                            <div className="space-y-2">
                                {faqCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full text-left px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 ${
                                            activeCategory === cat.id 
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' 
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{cat.icon}</span> {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-[3rem] p-10 shadow-lg border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="text-3xl">{activeFaq?.icon}</span>
                                {activeFaq?.label} Questions
                            </h2>
                            <div className="space-y-4">
                                {activeFaq?.questions.map((item, idx) => {
                                    const qId = `${activeCategory}-${idx}`;
                                    const isOpen = openQuestions.includes(qId);
                                    return (
                                        <div key={idx} className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-teal-200 bg-teal-50/30' : 'border-slate-100'}`}>
                                            <button
                                                onClick={() => toggleQuestion(qId)}
                                                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                                            >
                                                <span className="font-black text-slate-900">{item.q}</span>
                                                <span className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-6 pt-2">
                                                    <p className="text-slate-600 leading-relaxed">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Still Need Help */}
                        <div className="mt-10 bg-teal-900 rounded-[3rem] p-10 text-center text-white">
                            <h3 className="text-2xl font-black mb-4">Still have questions?</h3>
                            <p className="text-teal-100 mb-8 max-w-lg mx-auto">Our team is here to help you succeed. Reach out and we'll get back to you within 24 hours.</p>
                            <Link href="/contact" className="inline-block px-10 py-5 bg-white text-teal-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl transition-all">
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
