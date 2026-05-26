'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import SiloSubNav from '@/app/rental-hub/SiloSubNav';

interface PropertyListing {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  images?: string[];
  location?: string;
  subtype?: string;
  property_type?: string;
  lot_size?: string;
  zoning?: string;
  year_built?: number;
  rating?: number;
  slug?: string;
}

const PROPERTY_TYPES = [
  { id: 'all', label: 'All', icon: '🏝️' },
  { id: 'land', label: 'Land & Plots', icon: '🌿' },
  { id: 'residential', label: 'Residential', icon: '🏠' },
  { id: 'commercial', label: 'Commercial', icon: '🏢' },
  { id: 'warehouse', label: 'Warehouse', icon: '🏗️' },
  { id: 'office', label: 'Office Space', icon: '💼' },
];

const SILOS = [
        { id: 'stays', title: 'Stays & Homes', icon: '🏠', href: '/rental-hub/stays' },
        { id: 'vehicles', title: 'Vehicles', icon: '🚗', href: '/rental-hub/vehicles' },
        { id: 'sea', title: 'Sea & Aquatic', icon: '⛵', href: '/rental-hub/sea-rentals' },
        { id: 'equipment', title: 'Equipment & Tools', icon: '🛠️', href: '/rental-hub/equipment-tools' },
        { id: 'property', title: 'Land & Property', icon: '🏘️', href: '/rental-hub/property' },
    ];

const PROVIDER_TYPES = [
  { id: 'real_estate_agent', label: 'Real Estate Agent', icon: '🏢', desc: 'Licensed agents & brokerages' },
  { id: 'property_manager', label: 'Property Manager', icon: '🔑', desc: 'Manage residential & commercial portfolios' },
  { id: 'landowner', label: 'Land Owner', icon: '🌿', desc: 'Private land & plot owners' },
  { id: 'developer', label: 'Developer', icon: '🏗️', desc: 'New construction & development projects' },
];

export default function PropertyHubPage() {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings?category=rental&sub_category=property,land,residential,commercial,real_estate');
        const data = Array.isArray(res.data) ? res.data : (res.data.listings || []);
        setListings(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Caribbean Property',
          description: item.description || 'Prime island real estate opportunity.',
          price: item.price || Math.floor(Math.random() * 500) + 100,
          image_url: item.image_url,
          images: item.images,
          location: item.location || 'St. Kitts',
          subtype: item.subtype || item.property_type || 'land',
          property_type: item.metadata?.property_type || item.property_type || 'Lot',
          lot_size: item.metadata?.lot_size || item.lot_size || `${(Math.random() * 5 + 0.1).toFixed(1)} acres`,
          zoning: item.metadata?.zoning || item.zoning || ['Residential', 'Commercial', 'Agricultural', 'Mixed-Use'][Math.floor(Math.random() * 4)],
          year_built: item.metadata?.year_built,
          rating: item.rating || (4.0 + Math.random() * 1),
          slug: item.slug,
        })));
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    if (activeType === 'all') return listings;
    return listings.filter(l => (l.subtype || '').toLowerCase() === activeType);
  }, [listings, activeType]);

  return (
    <main className="min-h-screen bg-surface-primary">
      <SiloSubNav current="property" silos={SILOS} />

      {/* HERO */}
      <section className="relative min-h-[55vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-surface-tertiary to-ocean-900" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-sunset-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-accent-400/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-elevated/10 backdrop-blur text-accent-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-accent-400/20 mb-6">
              🏝️ Real Estate & Land
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[0.95]">
              Land & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-sunset-400">Property</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-xl font-medium">
              Own a piece of the Caribbean. From beachfront lots to commercial warehouses — find the right property or list yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#browse" className="px-8 py-4 bg-accent-400 text-brand-950 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-accent-300 transition-all text-center">
                Browse Properties
              </Link>
              <Link href="/become-vendor" className="px-8 py-4 bg-surface-elevated/10 backdrop-blur text-white rounded-2xl font-bold text-sm border border-white/10 hover:bg-surface-elevated/20 transition-all text-center">
                List Property or Land
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Provider Types Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-black text-ink-primary mb-8 text-center tracking-tight">Who Can List Here?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROVIDER_TYPES.map((pt) => (
            <div key={pt.id} className="bg-surface-elevated rounded-2xl p-6 border border-border-primary">
              <span className="text-3xl mb-3 block">{pt.icon}</span>
              <h4 className="text-lg font-black text-ink-primary mb-1">{pt.label}</h4>
              <p className="text-ink-tertiary text-sm">{pt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Properties */}
      <section id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-ink-primary tracking-tight">
              Available Properties
            </h2>
            <p className="text-ink-tertiary mt-2">
              {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found
            </p>
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                activeType === t.id
                  ? 'bg-accent-500 text-white border-accent-500 shadow-md'
                  : 'bg-surface-primary text-ink-secondary border-border-primary hover:border-accent-400 hover:text-accent-500'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 animate-pulse rounded-[2.5rem] bg-surface-elevated border border-border-primary" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={item.slug ? `/store/${item.slug}` : `/listings/${item.id}`}
                  className="group block bg-surface-elevated rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border-primary hover:border-accent-400"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(
                        item.image_url || (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) || '/assets/placeholder-listing.png'
                      )}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-accent-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                      {item.property_type || 'Property'}
                    </div>
                    <div className="absolute top-4 right-4 bg-surface-elevated/90 backdrop-blur px-3 py-1.5 rounded-xl">
                      <span className="text-accent-400 font-black text-sm">${item.price}</span>
                      <span className="text-ink-tertiary text-[10px] ml-1">
                        {item.property_type === 'land' ? '/lot' : item.property_type === 'commercial' ? '/mo' : '/mo'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-ink-primary leading-tight mb-2 group-hover:text-accent-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-ink-tertiary text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex gap-3 text-xs font-bold text-ink-tertiary">
                      {item.lot_size && <span className="bg-surface-tertiary px-2.5 py-1 rounded-full">📐 {item.lot_size}</span>}
                      {item.zoning && <span className="bg-surface-tertiary px-2.5 py-1 rounded-full">🏛 {item.zoning}</span>}
                      {item.year_built && <span className="bg-surface-tertiary px-2.5 py-1 rounded-full">📅 {item.year_built}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-elevated rounded-[2.5rem] border-2 border-dashed border-border-primary">
            <span className="text-5xl mb-4 block">🏝️</span>
            <h3 className="text-xl font-black text-ink-primary mb-2">No properties listed yet</h3>
            <p className="text-ink-tertiary mb-6">Be the first to list land or property on IslandHub</p>
            <Link href="/become-vendor" className="inline-block px-8 py-4 bg-accent-400 text-brand-950 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-accent-300 transition-all">
              List Property
            </Link>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="relative bg-surface-tertiary py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-ink-primary mb-6 tracking-tighter">
            Have Land or Property to Lease?
          </h2>
          <p className="text-lg text-ink-tertiary mb-10 max-w-xl mx-auto">
            Reach thousands of locals and expats looking for Caribbean real estate. Free to list.
          </p>
          <Link href="/become-vendor" className="inline-block px-10 py-4 bg-accent-400 text-brand-950 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl">
            Become a Property Provider
          </Link>
        </div>
      </section>
    </main>
  );
}
