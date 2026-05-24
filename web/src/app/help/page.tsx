'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, MessageCircle, Mail, FileText } from 'lucide-react';

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-surface-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-body-sm text-ink-secondary hover:text-ink-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-palm-100 flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-palm-600" />
            </div>
            <h1 className="text-display-lg text-ink-primary">Help Center</h1>
          </div>

          <p className="text-body-lg text-ink-secondary leading-relaxed mb-12 max-w-2xl">
            Find answers to common questions about using IslandHub. Can't find what you're looking for? Reach out to our team.
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Link href="/faq" className="bg-surface-elevated rounded-2xl border border-border-primary p-6 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <FileText className="w-8 h-8 text-brand-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-headline-sm text-ink-primary mb-2">FAQ</h3>
              <p className="text-body-sm text-ink-secondary">Browse frequently asked questions</p>
            </Link>
            <Link href="/contact" className="bg-surface-elevated rounded-2xl border border-border-primary p-6 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <MessageCircle className="w-8 h-8 text-accent-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-headline-sm text-ink-primary mb-2">Live Chat</h3>
              <p className="text-body-sm text-ink-secondary">Chat with our support team</p>
            </Link>
            <a href="mailto:support@islandhub.com" className="bg-surface-elevated rounded-2xl border border-border-primary p-6 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <Mail className="w-8 h-8 text-coral-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-headline-sm text-ink-primary mb-2">Email Us</h3>
              <p className="text-body-sm text-ink-secondary">support@islandhub.com</p>
            </a>
          </div>

          <div className="bg-surface-elevated rounded-2xl border border-border-primary p-8">
            <h2 className="text-headline-md text-ink-primary mb-6">Common Topics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { q: 'How do I create an account?', a: 'Click "Join Free" in the top right and follow the simple registration process.' },
                { q: 'How do I list my products?', a: 'After registering as a vendor, go to your dashboard and click "Add Product".' },
                { q: 'How do payouts work?', a: 'Payouts are processed weekly. Funds are transferred to your registered payment method.' },
                { q: 'Is my payment information secure?', a: 'Yes, we use industry-standard encryption and never store your full payment details.' },
                { q: 'How do I report a problem?', a: 'Use the contact form or email us directly at support@islandhub.com.' },
                { q: 'Can I use IslandHub outside St. Kitts?', a: 'Currently we serve St. Kitts & Nevis, with plans to expand across the Caribbean.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface-secondary">
                  <h4 className="text-body-sm font-bold text-ink-primary mb-1">{item.q}</h4>
                  <p className="text-body-sm text-ink-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
