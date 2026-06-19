'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FounderPhoto from '@/components/FounderPhoto';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

function FounderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div className="absolute inset-0 bg-ink-primary/60 backdrop-blur-sm" onClick={onClose} />

      
      <div className="relative bg-surface-elevated  rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface-secondary hover:bg-surface-tertiary flex items-center justify-center text-ink-tertiary hover:text-ink-secondary transition-colors"
        >
          ✕
        </button>

        
        <div className="aspect-[16/9] rounded-t-3xl overflow-hidden">
          <FounderPhoto className="w-full h-full" />
        </div>

        
        <div className="p-8">
          <h3 className="text-2xl font-black text-ink-primary mb-1">N. J. Robin</h3>
          <p className="text-lg font-semibold text-accent-400 mb-4">Founder & Creative Technologist</p>

          <div className="text-ink-secondary leading-relaxed space-y-4 mb-6">
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
            <a href="mailto:businesstrends869@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 text-accent-500 rounded-full text-sm font-medium hover:bg-accent-500/15 transition-colors">
              📧 businesstrends869@gmail.com
            </a>
            <a href="https://wa.me/18697639919" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 text-accent-500 rounded-full text-sm font-medium hover:bg-accent-500/15 transition-colors">
              💬 +1 (869) 763-9919
            </a>
            <a href="https://quikrsolutions.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 text-accent-500 rounded-full text-sm font-medium hover:bg-accent-500/15 transition-colors">
              🌐 quikrsolutions.app
            </a>
          </div>

          <Link href="/founder" className="inline-flex items-center gap-2 text-accent-400 font-bold text-sm hover:text-accent-500 transition-colors">
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
    <main className="min-h-screen bg-surface-primary ">
      
      <section className="bg-gradient-to-br from-accent-800 via-accent-700 to-surface-tertiary py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-500/100/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sand-500/10 rounded-full blur-[100px]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="inline-block px-4 py-2 bg-surface-elevated/10 backdrop-blur-xl rounded-full text-accent-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-surface-elevated/10">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            Empowering <span className="text-accent-400">Island Commerce</span>
          </h1>
          <p className="text-xl text-accent-50/80 max-w-2xl mx-auto leading-relaxed">
            IslandHub is the premier marketplace for the Caribbean, connecting local creators,
            entrepreneurs, and causes with the world.
          </p>
        </div>
      </section>

      
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-accent-500/10 text-accent-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              The Founder
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-ink-primary">Meet N. J. Robin</h2>
          </div>

          
          <div
            onClick={() => setFounderModalOpen(true)}
            className="group cursor-pointer bg-surface-elevated rounded-3xl border border-border-primary shadow-lg hover:shadow-2xl hover:border-accent-300 transition-all duration-300 overflow-hidden"
          >
            <div className="grid md:grid-cols-5 gap-6 p-6 md:p-8 items-center">
              
              <div className="md:col-span-2">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <FounderPhoto className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>

              
              <div className="md:col-span-3 text-center md:text-left">
                <h3 className="text-2xl font-black text-ink-primary mb-1 group-hover:text-accent-400 transition-colors">N. J. Robin</h3>
                <p className="text-lg font-semibold text-accent-400 mb-3">Founder & Creative Technologist</p>
                <p className="text-ink-secondary leading-relaxed mb-4 line-clamp-3">
                  A multi-disciplinary creative technologist based in St. Kitts & Nevis, N. J. Robin brings over
                  13 years of graphic design, 5+ years of app development, and a decade of hands-on technical
                  experience to IslandHub...
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <span className="px-3 py-1 bg-accent-500/10 text-accent-500 rounded-full text-xs font-medium">Graphic Design</span>
                  <span className="px-3 py-1 bg-accent-500/10 text-accent-500 rounded-full text-xs font-medium">App Development</span>
                  <span className="px-3 py-1 bg-accent-500/10 text-accent-500 rounded-full text-xs font-medium">3D Design</span>
                  <span className="px-3 py-1 bg-accent-500/10 text-accent-500 rounded-full text-xs font-medium">AI Tools</span>
                </div>

                <span className="inline-flex items-center gap-2 text-accent-400 font-bold text-sm group-hover:gap-3 transition-all">
                  Click to read full profile
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <FounderModal open={founderModalOpen} onClose={() => setFounderModalOpen(false)} />

      
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-ink-primary mb-6">Our Mission</h2>
              <p className="text-lg text-ink-secondary leading-relaxed mb-6">
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
                  <li key={i} className="flex items-center gap-3 text-ink-secondary font-medium">
                    <EmojiIcon emoji="✓" size={16} className="w-6 h-6 bg-accent-500/15 rounded-full flex items-center justify-center text-accent-400 text-sm" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-accent-500/10 to-sand-500/5 rounded-[3rem] p-12">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: '50K+', label: 'Active Users' },
                  { number: '2,500+', label: 'Vendors' },
                  { number: '$2M+', label: 'Processed' },
                  { number: '15+', label: 'Islands' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-4xl font-black text-accent-500">{stat.number}</p>
                    <p className="text-xs font-bold text-ink-tertiary uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-24 px-4 bg-surface-elevated">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-ink-primary mb-16 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🌴', title: 'Community First', description: 'We prioritize the needs of local communities and ensure they benefit from every transaction.' },
              { icon: '🔒', title: 'Trust & Security', description: 'Every transaction is protected. We verify vendors and ensure transparent, secure payments.' },
              { icon: '💡', title: 'Innovation', description: 'We continuously improve our platform to bring the best technology to island commerce.' }
            ].map((value, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-surface-primary border border-border-primary hover:shadow-xl transition-shadow">
                <span className="text-5xl mb-6 block">{value.icon}</span>
                <h3 className="text-xl font-black text-ink-primary mb-4">{value.title}</h3>
                <p className="text-ink-secondary leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-ink-primary mb-16 text-center">What We Offer</h2>
          <div className="space-y-8">
            {[
              { title: 'Marketplace', description: 'Buy and sell goods and services from verified local vendors across the Caribbean.', link: '/shop', cta: 'Browse Marketplace' },
              { title: 'Rentals', description: 'Find vacation rentals, equipment rentals, and more from trusted providers.', link: '/rentals', cta: 'View Rentals' },
              { title: 'Fundraising', description: 'Support causes and community initiatives through transparent crowdfunding campaigns.', link: '/campaigns', cta: 'View Campaigns' },
              { title: 'Community', description: 'Connect with islanders, share stories, and participate in local events.', link: '/community', cta: 'Join Community' }
            ].map((offer, i) => (
              <div key={i} className="p-8 md:p-12 bg-surface-elevated rounded-[3rem] border border-border-primary flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-shadow">
                <div>
                  <h3 className="text-2xl font-black text-ink-primary mb-2">{offer.title}</h3>
                  <p className="text-ink-secondary">{offer.description}</p>
                </div>
                <Link href={offer.link} className="px-8 py-4 bg-accent-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent-600 transition-colors shrink-0">
                  {offer.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-accent-500 py-24 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to Join the Island Economy?</h2>
          <p className="text-accent-50 text-lg mb-10 leading-relaxed">
            Whether you're a vendor looking to grow or a customer seeking local treasures,
            IslandHub connects you to the Caribbean.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-12 py-5 bg-surface-elevated text-accent-700 rounded-2xl font-black text-lg hover:shadow-xl transition-all">
              Get Started
            </Link>
            <Link href="/contact" className="px-12 py-5 bg-accent-700 text-white rounded-2xl font-black text-lg hover:bg-accent-800 transition-all border border-accent-500/30">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
