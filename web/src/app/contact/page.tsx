'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-lg w-full bg-white p-12 rounded-[3rem] shadow-lg border border-slate-100 text-center">
                    <div className="text-6xl mb-6">✅</div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Message Sent!</h1>
                    <p className="text-slate-600 mb-8">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
                    <Link href="/" className="text-teal-600 font-black text-sm uppercase tracking-widest hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Get in Touch</h1>
                    <p className="text-xl text-teal-50/80">Questions? Feedback? We're here to help islanders succeed.</p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="max-w-6xl mx-auto px-4 py-20 -mt-10 relative z-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-teal-500 focus:ring-0 bg-slate-50"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-teal-500 focus:ring-0 bg-slate-50"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                                <select 
                                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-teal-500 focus:ring-0 bg-slate-50"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                >
                                    <option value="">Select a topic...</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="vendor">Become a Vendor</option>
                                    <option value="support">Customer Support</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="feedback">Feedback</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Message</label>
                                <textarea 
                                    rows={5} 
                                    required
                                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-teal-500 focus:ring-0 bg-slate-50"
                                    placeholder="How can we help?"
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 transition-all hover:scale-[1.02]">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Other Ways to Reach Us</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl">📧</div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-widest">Email</p>
                                        <a href="mailto:support@islandhub.co" className="text-teal-600 hover:underline">support@islandhub.co</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl">💬</div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-widest">WhatsApp</p>
                                        <a href="https://wa.me/1234567890" className="text-teal-600 hover:underline">+1 (246) 555-0123</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl">📱</div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-widest">Social</p>
                                        <div className="flex gap-3 mt-2">
                                            <a href="#" className="text-slate-400 hover:text-teal-600 text-xl">🐦</a>
                                            <a href="#" className="text-slate-400 hover:text-teal-600 text-xl">📘</a>
                                            <a href="#" className="text-slate-400 hover:text-teal-600 text-xl">📸</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-teal-900 p-10 rounded-[3rem] text-white">
                            <h3 className="text-xl font-black mb-4">Need Immediate Help?</h3>
                            <p className="text-teal-100 mb-6">Check our FAQ or browse help articles for quick answers.</p>
                            <div className="flex flex-col gap-3">
                                <Link href="/how-it-works" className="px-6 py-3 bg-teal-800 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-colors text-center">
                                    How It Works
                                </Link>
                                <Link href="/faq" className="px-6 py-3 bg-transparent border border-teal-600 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-teal-800 transition-colors text-center">
                                    View FAQ
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 mb-4">Office Hours</h3>
                            <div className="space-y-2 text-sm font-medium text-slate-600">
                                <p className="flex justify-between"><span>Monday - Friday</span><span>8:00 AM - 6:00 PM AST</span></p>
                                <p className="flex justify-between"><span>Saturday</span><span>9:00 AM - 2:00 PM AST</span></p>
                                <p className="flex justify-between"><span>Sunday</span><span>Closed</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
