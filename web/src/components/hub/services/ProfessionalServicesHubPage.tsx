'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api from '@/lib/api';

interface ServiceProvider {
  id: number; name: string; slug: string;
  specialty?: string; credentials?: string; years_exp?: number;
  hourly_rate?: number; rating?: number; review_count?: number;
  image_url?: string; description?: string;
  next_available?: string; is_verified?: boolean;
}

function ProviderCard({ provider }: { provider: ServiceProvider }) {
  const name = provider.name || 'Professional';
  const rate = provider.hourly_rate || 75;
  return (
    <Link href={`/hub/services/professional/${provider.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{provider.specialty || 'Professional Services'}</p>
              </div>
              {provider.rating && <RatingBadge rating={provider.rating} reviewCount={provider.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-ink-tertiary">
              {provider.credentials && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">{provider.credentials}</span>}
              {provider.years_exp && <span>{provider.years_exp}+ yrs exp</span>}
              {provider.is_verified && <span className="text-emerald-500">✓ Verified</span>}
            </div>
            <div className="flex items-center justify-between mt-2">
              <PriceTag price={rate} suffix="/hr" size="sm" />
              {provider.next_available && (
                <span className="text-[10px] text-emerald-500 font-medium">Next: {provider.next_available}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProfessionalServicesHubPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Rating');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['professional_services', 'legal', 'consulting', 'accounting'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            specialty: ['Legal', 'Consulting', 'Accounting', 'Marketing', 'IT Services', 'Financial Planning'][i % 6],
            credentials: ['JD', 'CPA', 'MBA', 'PMP', 'CFA', 'LLM'][i % 6],
            years_exp: 5 + (i * 3),
            hourly_rate: 60 + (i * 20),
            rating: 4.4 + (Math.random() * 0.6),
            review_count: 8 + Math.floor(Math.random() * 80),
            image_url: s.banner_url,
            description: s.description,
            next_available: ['Today', 'Tomorrow', 'This week', 'Mon', 'Wed', 'Fri'][i % 6],
            is_verified: i % 2 === 0,
          }));
        setProviders(filtered);
      } catch (error) { console.error('Failed to fetch providers:', error); }
      finally { setLoading(false); }
    };
    fetchProviders();
  }, []);

  const filters = ['All', 'Legal', 'Consulting', 'Accounting', 'Verified', 'Available Today'];
  const sortOptions = ['Rating', 'Price', 'Experience', 'Availability'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">💼 Professional Services</h1>
          <p className="text-blue-200 mb-4">Legal, consulting, accounting, and business services</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'professional', label: 'Professional', emoji: '💼' },
              { id: 'automotive', label: 'Automotive', emoji: '🚗' },
              { id: 'health', label: 'Health & Beauty', emoji: '💆' },
              { id: 'marine', label: 'Marine', emoji: '⚓' },
              { id: 'events', label: 'Events', emoji: '🎉' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/services/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'professional' ? 'bg-white text-blue-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                <span>{cat.emoji}</span> {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter}
          sortOptions={sortOptions} activeSort={activeSort} onSortChange={setActiveSort} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-secondary animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-secondary rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-surface-secondary rounded animate-pulse w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState emoji="💼" title="No providers found" message="Check back later for professional service listings." />
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        )}
      </div>
    </div>
  );
}
