import React from 'react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-6">About IslandHub</h1>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                    IslandHub is the premier marketplace for the Caribbean, connecting local creators,
                    entrepreneurs, and causes with the world. We believe in the power of community
                    commerce to drive sustainable growth across the islands.
                </p>
                {/* Team image will be added via admin */}
                <div className="text-left prose prose-lg mx-auto">
                    <p>
                        Founded in 2026, our mission is to provide a robust digital infrastructure
                        that enables:
                    </p>
                    <ul>
                        <li>Secure transactions for goods and services</li>
                        <li>Transparent fundraising for community initiatives</li>
                        <li>Global reach for local vendors</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
