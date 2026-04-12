'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RequestServicesSection() {
    const router = useRouter();

    const services = [
        {
            id: 'taxi',
            title: 'Request a Ride',
            subtitle: 'Taxi & Transportation',
            image: '/assets/services/taxi.png',
            gradient: 'from-blue-600/40 to-blue-950/80',
            link: '/request-ride?type=taxi',
            description: 'Get a ride anywhere on the island'
        },
        {
            id: 'food',
            title: 'Order Food',
            subtitle: 'Restaurant Delivery',
            image: '/assets/services/food.png',
            gradient: 'from-orange-600/40 to-red-950/80',
            link: '/stores?category=food',
            description: 'Delicious meals delivered to you'
        },
        {
            id: 'delivery',
            title: 'Pickup & Delivery',
            subtitle: 'Package Services',
            image: '/assets/services/caribbean_scooter_delivery.png',
            gradient: 'from-teal-600/40 to-emerald-950/80',
            link: '/request-ride?type=delivery',
            description: 'Send or receive packages fast'
        }
    ];

    return (
        <section className="py-12 md:py-20 px-4 bg-linear-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-block px-4 py-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        On-Demand Services
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                        How can we help you today?
                    </h2>
                    <p className="text-slate-500 dark:text-slate-300 font-medium text-sm md:text-base max-w-2xl mx-auto">
                        Request rides, order food, or send packages — all in one platform
                    </p>
                </div>

                {/* Service Cards - Mobile Optimized Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            href={service.link}
                            className="group relative overflow-hidden rounded-3xl md:rounded-4xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
                        >
                            {/* Background Image & Overlay */}
                            <div className="absolute inset-0">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className={`absolute inset-0 bg-linear-to-t ${service.gradient} transition-all duration-300`} />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 p-6 md:p-8 flex flex-col h-full min-h-[220px] md:min-h-[280px]">
                                {/* Icon Replacement/Badge */}


                                {/* Text */}
                                <div className="flex-1">
                                    <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">
                                        {service.subtitle}
                                    </p>
                                    <h3 className="text-white text-xl md:text-2xl font-black mb-2 leading-tight">
                                        {service.title}
                                    </h3>
                                    <p className="text-white/90 text-xs md:text-sm font-medium">
                                        {service.description}
                                    </p>
                                </div>

                                {/* CTA Arrow */}
                                <div className="mt-4 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform">
                                    Get Started
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Stats - Mobile Optimized */}
                <div className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto">
                    <div className="text-center p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400 mb-1">24/7</div>
                        <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Available</div>
                    </div>
                    <div className="text-center p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400 mb-1">5min</div>
                        <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Wait</div>
                    </div>
                    <div className="text-center p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400 mb-1">100+</div>
                        <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Drivers</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
