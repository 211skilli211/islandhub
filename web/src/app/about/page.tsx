'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FounderPhoto from '@/components/FounderPhoto';

function FounderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
        >
          ✕
        </button>

        {/* Photo header */}
        <div className="aspect-[16/9] rounded-t-3xl overflow-hidden">
          <FounderPhoto className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-1">N. J. Robin</h3>
          <p className="text-lg font-semibold text-teal-600 mb-4">Founder & Creative Technologist</p>

          <div className="text-slate-600 leading-relaxed space-y-4 mb-6">
            <p>
              A multi-disciplinary creative technologist based in St. Kitts & Nevis, N. J. Robin brings over
              13 years of graphic design, 5+ years of app development, and a decade of hands-on technical
              experience to IslandHub. His vision is to build practical technology infrastructure that empowers
              Caribbean businesses and communities.
            </p>
            <p>
              From corporate branding and print production to full-stack mobile development with Flutter and Dart,
              3D modeling, and AI-powered business tools — he combines creative vision with technical execution
              to build products that serve real community needs.
            </p>
            <p>
              His background in professional painting and construction across Dominica gives him a grounded
              understanding of physical craft, materials, and project management — skills that inform his
              approach to digital product design and development.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <a href="mailto:businesstrends869@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-100 transition-colors">
              📧 businesstrends869@gmail.com
            </a>
            <a href="https://wa.me/18697639919" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-100 transition-colors">
              💬 +1 (869) 763-9919
            </a>
            <a href="https://quikrsolutions.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-100 transition-colors">
              🌐 quikrsolutions.app
            </a>
          </div>

          <Link href="/founder" className="inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:text-teal-700 transition-colors">
            View Full Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [founderModalOpen, setFounderModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            Empowering <span className="text-teal-400">Island Commerce</span>
          </h1>
          <p className="text-xl text-teal-50/80 max-w-2xl mx-auto leading-relaxed">
            IslandHub is the premier marketplace for the Caribbean, connecting local creators,
            entrepreneurs, and causes with the world.
          </p>
        </div>
      </section>

      {/* Founder Section — Clickable card that opens modal */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              The Founder
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Meet N. J. Robin</h2>
          </div>

          {/* Clickable founder card */}
          <div
            onClick={() => setFounderModalOpen(true)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300 overflow-hidden"
          >
            <div className="grid md:grid-cols-5 gap-6 p-6 md:p-8 items-center">
              {/* Photo */}
              <div className="md:col-span-2">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <FounderPhoto className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-3 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">N. J. Robin</h3>
                <p className="text-lg font-semibold text-teal-600 mb-3">Founder & Creative Technologist</p>
                <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  A multi-disciplinary creative technologist based in St. Kitts & Nevis, N. J. Robin brings over
                  13 years of graphic design, 5+ years of app development, and a decade of hands-on technical
                  experience to IslandHub...
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">Graphic Design</span>
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">App Development</span>
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">3D Design</span>
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">AI Tools</span>
                </div>

                <span className="inline-flex items-center gap-2 text-teal-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Click to read full profile
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Modal */}
      <FounderModal open={founderModalOpen} onClose={() => setFounderModalOpen(false)} />

      {/* Mission Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                We believe in the power of community commerce to drive sustainable growth across the Caribbean islands.
                Our mission is to provide robust digital infrastructure that enables:
              </p>
              <ul className="space-y-4">
                {[
                  'Secure transactions for goods and services',
                  'Transparent fundraising for community initiatives',
                  'Global reach for local vendors',
                  'Connecting islanders with opportunities'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-sm">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-teal-100 to-amber-50 rounded-[3rem] p-12">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: '50K+', label: 'Active Users' },
                  { number: '2,500+', label: 'Vendors' },
                  { number: '$2M+', label: 'Processed' },
                  { number: '15+', label: 'Islands' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-4xl font-black text-teal-700">{stat.number}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-16 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🌴', title: 'Community First', description: 'We prioritize the needs of local communities and ensure they benefit from every transaction.' },
              { icon: '🔒', title: 'Trust & Security', description: 'Every transaction is protected. We verify vendors and ensure transparent, secure payments.' },
              { icon: '💡', title: 'Innovation', description: 'We continuously improve our platform to bring the best technology to island commerce.' }
            ].map((value, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
                <span className="text-5xl mb-6 block">{value.icon}</span>
                <h3 className="text-xl font-black text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-16 text-center">What We Offer</h2>
          <div className="space-y-8">
            {[
              { title: 'Marketplace', description: 'Buy and sell goods and services from verified local vendors across the Caribbean.', link: '/shop', cta: 'Browse Marketplace' },
              { title: 'Rentals', description: 'Find vacation rentals, equipment rentals, and more from trusted providers.', link: '/rentals', cta: 'View Rentals' },
              { title: 'Fundraising', description: 'Support causes and community initiatives through transparent crowdfunding campaigns.', link: '/campaigns', cta: 'View Campaigns' },
              { title: 'Community', description: 'Connect with islanders, share stories, and participate in local events.', link: '/community', cta: 'Join Community' }
            ].map((offer, i) => (
              <div key={i} className="p-8 md:p-12 bg-white rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-shadow">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{offer.title}</h3>
                  <p className="text-slate-600">{offer.description}</p>
                </div>
                <Link href={offer.link} className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-colors shrink-0">
                  {offer.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-600 py-24 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to Join the Island Economy?</h2>
          <p className="text-teal-50 text-lg mb-10 leading-relaxed">
            Whether you're a vendor looking to grow or a customer seeking local treasures,
            IslandHub connects you to the Caribbean.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-12 py-5 bg-white text-teal-900 rounded-2xl font-black text-lg hover:shadow-xl transition-all">
              Get Started
            </Link>
            <Link href="/contact" className="px-12 py-5 bg-teal-800 text-white rounded-2xl font-black text-lg hover:bg-teal-900 transition-all border border-teal-500/30">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
