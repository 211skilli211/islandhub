'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface CoopSector {
  sector_id: number;
  sector_key: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
}

interface Coop {
  coop_id: number;
  name: string;
  slug: string;
  description: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  island: string;
  is_verified: boolean;
  is_featured: boolean;
  member_count: number;
  sectors: CoopSector[];
}

function CoopsPageContent() {
  const searchParams = useSearchParams();
  const [coops, setCoops] = useState<Coop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIsland, setSelectedIsland] = useState('all');

  useEffect(() => {
    const fetchCoops = async () => {
      try {
        const res = await api.get('/coops', { params: { island: selectedIsland } });
        setCoops(res.data.coops || res.data || []);
      } catch (error) {
        console.error('Failed to fetch coops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoops();
  }, [selectedIsland]);

  const islands = ['all', 'St. Kitts', 'Nevis', 'Jamaica', 'Trinidad', 'Bahamas', 'Barbados', 'Antigua'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="relative py-16 bg-gradient-to-br from-teal-900/50 to-surface-primary">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-white mb-2">Co-operative Federation</h1>
            <p className="text-ink-secondary">Discover member-owned businesses and cooperatives across the Caribbean.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {islands.map((island) => (
            <button
              key={island}
              onClick={() => setSelectedIsland(island)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedIsland === island
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-elevated text-ink-secondary hover:text-white'
              }`}
            >
              {island === 'all' ? 'All Islands' : island}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-ink-tertiary">Loading cooperatives...</div>
          </div>
        ) : coops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-tertiary">No cooperatives found for this island.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coops.map((coop) => (
              <Link key={coop.coop_id} href={`/store/ibt-solutions/coops/${coop.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-surface-elevated rounded-2xl border border-white/10 p-5 hover:border-accent-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                      <EmojiIcon emoji="🤝" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{coop.name}</h3>
                      <p className="text-xs text-ink-tertiary">{coop.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-secondary line-clamp-2 mb-3">{coop.description}</p>
                  <div className="flex items-center gap-3 text-xs text-ink-tertiary">
                    <span>👥 {coop.member_count || 0} members</span>
                    {coop.is_verified && <span className="text-emerald-400">✓ Verified</span>}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoopsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="animate-pulse text-ink-tertiary">Loading...</div>
      </div>
    }>
      <CoopsPageContent />
    </Suspense>
  );
}