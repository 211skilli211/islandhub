'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function SafetyPage() {
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
            <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent-600" />
            </div>
            <h1 className="text-display-lg text-ink-primary">Safety Center</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-body-lg text-ink-secondary leading-relaxed mb-8">
              At IslandHub, safety is our top priority. We're committed to providing a secure
              marketplace for all Caribbean businesses and customers.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-12">
              <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                <h3 className="text-headline-sm text-ink-primary mb-3">For Buyers</h3>
                <ul className="space-y-2 text-body-sm text-ink-secondary">
                  <li>- All vendors are verified before listing</li>
                  <li>- Secure payment processing</li>
                  <li>- Dispute resolution support</li>
                  <li>- Review system for transparency</li>
                </ul>
              </div>
              <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                <h3 className="text-headline-sm text-ink-primary mb-3">For Vendors</h3>
                <ul className="space-y-2 text-body-sm text-ink-secondary">
                  <li>- Secure payout system</li>
                  <li>- Fraud protection</li>
                  <li>- Verified customer transactions</li>
                  <li>- 24/7 support access</li>
                </ul>
              </div>
            </div>

            <div className="bg-brand-50 rounded-2xl p-8 border border-brand-200">
              <h3 className="text-headline-sm text-ink-primary mb-3">Report an Issue</h3>
              <p className="text-body-sm text-ink-secondary mb-4">
                If you encounter any safety concerns or suspicious activity, please contact us immediately.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
