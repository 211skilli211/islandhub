'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';

interface Campaign {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  images?: string[];
  photos?: string[];
  goal_amount?: number;
  raised_amount?: number;
  currency?: string;
  status?: string;
  slug?: string;
  store_name?: string;
  store_logo?: string;
  end_date?: string;
  created_at?: string;
  donor_count?: number;
  category?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Causes', icon: '💜' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'environment', label: 'Environment', icon: '🌿' },
  { id: 'community', label: 'Community', icon: '🤝' },
  { id: 'emergency', label: 'Emergency', icon: '🆘' },
  { id: 'arts', label: 'Arts & Culture', icon: '🎨' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop',
];

function getFallbackImage(id: number): string {
  return FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];
}

function getDaysLeft(endDate?: string): number {
  if (!endDate) return -1;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function DonationsHubPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'ending' | 'most-funded'>('trending');

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings?type=campaign&limit=50');
        const data = Array.isArray(res.data) ? res.data : (res.data?.listings || []);
        setCampaigns(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Community Campaign',
          description: item.description || 'Support this important cause.',
          image_url: item.image_url,
          images: item.images,
          photos: item.photos,
          goal_amount: item.goal_amount || null,
          raised_amount: item.current_amount || item.raised_amount || null,
          currency: item.currency || 'XCD',
          status: item.status || 'active',
          slug: item.slug,
          store_name: item.store_name || item.owner_name,
          store_logo: item.store_logo,
          end_date: item.end_date,
          created_at: item.created_at,
          donor_count: item.donor_count || null,
          category: item.metadata?.category || item.category || 'community',
        })));
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filtered = useMemo(() => {
    let result = campaigns;
    if (activeCategory !== 'all') {
      result = result.filter(c => (c.category || '').toLowerCase().includes(activeCategory));
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.store_name?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'ending':
        result = [...result].sort((a, b) => getDaysLeft(a.end_date) - getDaysLeft(b.end_date));
        break;
      case 'most-funded':
        result = [...result].sort((a, b) => (b.raised_amount || 0) - (a.raised_amount || 0));
        break;
      case 'trending':
      default:
        result = [...result].sort((a, b) => (b.donor_count || 0) - (a.donor_count || 0));
        break;
    }
    return result;
  }, [campaigns, activeCategory, searchTerm, sortBy]);

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + (c.donor_count || 0), 0);
  const featured = filtered.slice(0, 1);
  const remaining = filtered.slice(1);

  return (
    <main className="min-h-screen bg-surface-primary">
      {/* ===== HERO — Emotional, impactful ===== */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-surface-tertiary" />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-accent-400/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-accent-300/8 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px, 80px 80px'
          }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-xs font-bold text-accent-200 uppercase tracking-widest">Give Back to the Islands</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-[0.95]">
              Every Dollar<br />
              <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-accent-100 bg-clip-text text-transparent">Makes a Difference</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl font-medium">
              Support education, health, environment, and community causes across the Caribbean. 100% transparent. Every donation tracked.
            </p>

            {/* Impact stats */}
            <div className="flex items-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-black text-white">${totalRaised.toLocaleString()}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Total Raised</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-accent-400">{campaigns.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Active Causes</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-accent-300">{totalDonors.toLocaleString()}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Donors</div>
              </div>
            </div>

            {/* Search */}
            <div className="max-w-xl bg-surface-elevated rounded-2xl p-2 shadow-2xl flex gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-accent-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search causes, organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 text-ink-primary font-medium placeholder:text-ink-tertiary focus:outline-none text-sm bg-transparent"
                />
              </div>
              <button className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORY FILTER ===== */}
      <section className="sticky top-18 z-30 bg-surface-elevated/95 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  activeCategory === cat.id
                    ? 'bg-accent-500 text-white border-accent-500 shadow-md'
                    : 'bg-surface-primary text-ink-secondary border-border-primary hover:border-accent-400 hover:text-accent-500'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SORT + CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-ink-primary">
            {activeCategory !== 'all' ? `${CATEGORIES.find(c => c.id === activeCategory)?.label || 'Results'}` : 'All Causes'}
            <span className="ml-2 text-sm font-bold text-ink-tertiary">({filtered.length})</span>
          </h2>
          <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-xl border border-border-primary">
            {([
              { id: 'trending', label: 'Trending' },
              { id: 'newest', label: 'Newest' },
              { id: 'ending', label: 'Ending Soon' },
              { id: 'most-funded', label: 'Most Funded' },
            ] as const).map(opt => (
              <button key={opt.id} onClick={() => setSortBy(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === opt.id ? 'bg-surface-elevated text-accent-500 shadow-sm' : 'text-ink-tertiary hover:text-ink-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-surface-secondary rounded-2xl mb-3" />
                <div className="h-4 bg-surface-secondary rounded-full w-3/4 mb-2" />
                <div className="h-3 bg-surface-secondary rounded-full w-1/2 mb-4" />
                <div className="h-2 bg-surface-secondary rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-surface-elevated rounded-3xl border border-border-primary">
            <span className="text-5xl mb-4 block">💜</span>
            <h3 className="text-xl font-black text-ink-primary mb-2">No campaigns found</h3>
            <p className="text-ink-tertiary mb-6">Try adjusting your search or category filter</p>
            <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="px-6 py-3 bg-accent-600 text-white font-bold rounded-xl">
              View All Causes
            </button>
          </div>
        ) : (
          <>
            {/* Featured campaign — full width hero card */}
            {featured.length > 0 && !searchTerm && activeCategory === 'all' && (
              <div className="mb-10">
                <FeaturedCampaignCard campaign={featured[0]} />
              </div>
            )}

            {/* Campaign grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featured.length > 0 && !searchTerm && activeCategory === 'all' ? remaining : filtered).map((campaign, idx) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== CTA: START A CAMPAIGN ===== */}
      <section className="relative overflow-hidden mt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-700 to-accent-700" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-sm">🚀</span>
            <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Start a Campaign</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Have a Cause?<br />
            <span className="bg-gradient-to-r from-accent-300 to-accent-200 bg-clip-text text-transparent">Let the Community Help</span>
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium">
            Create a campaign, share your story, and let islanders and supporters worldwide contribute to your cause. Zero platform fees for verified nonprofits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/campaigns/new" className="px-10 py-4 bg-white dark:bg-ink-900 text-accent-600 font-bold rounded-2xl hover:bg-surface-secondary transition-all shadow-xl text-sm uppercase tracking-wider">
              Start a Campaign
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 bg-surface-elevated/10 backdrop-blur text-white font-bold rounded-2xl hover:bg-surface-elevated/20 transition-all text-sm border border-white/10">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="bg-surface-elevated border-t border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🔒', label: 'Secure Payments', desc: '256-bit SSL encryption' },
              { icon: '📊', label: 'Full Transparency', desc: 'Every dollar tracked' },
              { icon: '✅', label: 'Verified Causes', desc: 'All campaigns reviewed' },
              { icon: '💸', label: 'Low Fees', desc: 'Only 2.9% + $0.30' },
            ].map((item, i) => (
              <div key={i} className="p-4">
                <span className="text-3xl mb-2 block">{item.icon}</span>
                <h4 className="text-sm font-black text-ink-primary mb-1">{item.label}</h4>
                <p className="text-xs text-ink-tertiary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-8 bg-surface-primary" />
    </main>
  );
}

/* ===== Featured Campaign — Full-width hero card ===== */
function FeaturedCampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = campaign.goal_amount ? Math.min(100, Math.round(((campaign.raised_amount || 0) / campaign.goal_amount) * 100)) : 0;
  const daysLeft = getDaysLeft(campaign.end_date);
  const imgSrc = getImageUrl(campaign.image_url || (campaign.images && campaign.images[0]) || '') || getFallbackImage(campaign.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-3xl overflow-hidden border border-border-primary hover:shadow-2xl transition-all"
    >
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
          <img src={imgSrc} alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
          <div className="absolute top-4 left-4 bg-gradient-to-r from-accent-400 to-accent-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            ⭐ Featured
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface-elevated p-8 flex flex-col justify-center">
          {campaign.store_name && (
            <div className="flex items-center gap-2 mb-3">
              {campaign.store_logo && (
                <img src={getImageUrl(campaign.store_logo)} alt="" className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="text-xs font-bold text-ink-tertiary">{campaign.store_name}</span>
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-black text-ink-primary mb-3 leading-tight group-hover:text-accent-500 transition-colors">
            {campaign.title}
          </h2>
          <p className="text-sm text-ink-tertiary mb-6 line-clamp-3 leading-relaxed">
            {campaign.description}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-black text-accent-500">${(campaign.raised_amount || 0).toLocaleString()} raised</span>
              <span className="font-bold text-ink-tertiary">{progress}% of ${(campaign.goal_amount || 0).toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-ink-tertiary font-medium">
              <span>{campaign.donor_count} donors</span>
              {daysLeft > 0 && <span className="text-orange-500 font-bold">{daysLeft} days left</span>}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={campaign.slug ? `/listings/${campaign.slug}` : `/listings/${campaign.id}`}
              className="flex-1 py-3 bg-accent-600 text-white rounded-xl font-bold text-sm text-center hover:bg-accent-700 transition-colors"
            >
              Donate Now
            </Link>
            <button className="px-4 py-3 bg-surface-secondary text-ink-secondary rounded-xl font-bold text-sm border border-border-primary hover:bg-surface-tertiary transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ===== Standard Campaign Card ===== */
function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const progress = campaign.goal_amount ? Math.min(100, Math.round(((campaign.raised_amount || 0) / campaign.goal_amount) * 100)) : 0;
  const daysLeft = getDaysLeft(campaign.end_date);
  const imgSrc = getImageUrl(campaign.image_url || (campaign.images && campaign.images[0]) || '') || getFallbackImage(campaign.id + 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={campaign.slug ? `/listings/${campaign.slug}` : `/listings/${campaign.id}`}>
        <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-surface-secondary">
          <img src={imgSrc} alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {daysLeft > 0 && daysLeft <= 7 && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
              {daysLeft}d left
            </div>
          )}
          <div className="absolute top-3 left-3 bg-accent-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {CATEGORIES.find(c => campaign.category?.toLowerCase().includes(c.id))?.icon || '💜'} {campaign.category || 'Cause'}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 transition-colors line-clamp-2 leading-tight">
            {campaign.title}
          </h3>
          <p className="text-xs text-ink-tertiary line-clamp-2">{campaign.description}</p>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
              <span className="text-accent-500">${(campaign.raised_amount || 0).toLocaleString()}</span>
              <span className="text-ink-tertiary">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-ink-tertiary font-medium pt-1">
            <span>{campaign.donor_count} donors</span>
            <span>Goal: ${(campaign.goal_amount || 0).toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
