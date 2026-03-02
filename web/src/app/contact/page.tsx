import React from 'react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Contact Us</h1>
                <p className="text-slate-500 mb-8">Have questions? We're here to help.</p>

                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0" placeholder="Your name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                        <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0" placeholder="How can we help?" />
                    </div>
                    <button className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-100 transition-all">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}
