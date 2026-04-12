'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

export default function DriverHubOnboarding() {
    const { isAuthenticated } = useAuthStore();

    const services = [
        {
            title: 'Taxi & Rideshare',
            description: 'Fast and reliable transport across the island. Professional drivers ready when you are.',
            image: '/assets/vehicles/car.png',
            link: '/request-ride?type=taxi',
            color: 'bg-teal-50',
            textColor: 'text-teal-600',
            buttonColor: 'bg-teal-600'
        },
        {
            title: 'Delivery & Courier',
            description: 'Send parcels, food, or documents across the island with real-time tracking.',
            image: '/assets/vehicles/scooter.png',
            link: '/request-ride?type=delivery',
            color: 'bg-orange-50',
            textColor: 'text-orange-600',
            buttonColor: 'bg-orange-600'
        },
        {
            title: 'Heavy Pickup & Freight',
            description: 'Need to move furniture or large items? Our truck network is at your service.',
            image: '/assets/vehicles/truck.png',
            link: '/request-ride?type=pickup',
            color: 'bg-blue-50',
            textColor: 'text-blue-600',
            buttonColor: 'bg-blue-600'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16 px-4">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                        Island <span className="text-teal-600">Mobility</span> Hub
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        The heartbeat of island logistics. Request a ride, send a parcel, or move heavy freight with just a few clicks.
                    </p>
                </div>

                {/* Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {services.map((service, i) => (
                        <div key={i} className={`group relative rounded-[3rem] overflow-hidden border border-white shadow-2xl hover:shadow-emerald-100/20 transition-all duration-700 hover:-translate-y-4 ${service.color}`}>
                            {/* Image Container */}
                            <div className="aspect-[5/4] p-8 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full translate-y-12 scale-150"></div>
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-contain relative z-10 transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-10 bg-white/80 backdrop-blur-xl border-t border-white/50 relative z-20">
                                <h3 className={`text-2xl font-black mb-3 ${service.textColor}`}>{service.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                    {service.description}
                                </p>
                                <Link
                                    href={service.link}
                                    className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 ${service.buttonColor} hover:brightness-110`}
                                >
                                    Request Now →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Driver Onboarding Section */}
                <div className="bg-slate-900 rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">Want to drive with us?</h2>
                            <p className="text-slate-400 text-lg mb-10 font-medium">
                                Join our network of professional drivers and start earning on your own schedule. From taxis to commercial trucks, we have opportunities for everyone.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/register?role=driver"
                                    className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-teal-500/20"
                                >
                                    Become a Driver
                                </Link>
                                <Link
                                    href="/driver/dashboard"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/10"
                                >
                                    Driver Dashboard
                                </Link>
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] border border-white/10 flex items-center justify-center text-8xl shadow-inner">
                            👨‍✈️
                        </div>
                    </div>
                </div>

                {/* Trust Footer */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Verified', value: '100% Secure', icon: '🛡️' },
                        { label: 'Support', value: '24/7 Island Wide', icon: '🏝️' },
                        { label: 'Tracking', value: 'Real-time GPS', icon: '🎯' },
                        { label: 'Earnings', value: 'Premium Rates', icon: '💰' }
                    ].map((item, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl mb-3">{item.icon}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{item.label}</div>
                            <div className="text-sm font-bold text-slate-700">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
