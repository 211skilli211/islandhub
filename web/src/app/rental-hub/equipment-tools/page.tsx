'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import SiloSubNav from '@/app/rental-hub/SiloSubNav';

interface EquipmentItem {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  location?: string;
  subtype?: string;
  condition?: string;
  category_label?: string;
  rating?: number;
  slug?: string;
}

const EQUIPMENT_TYPES = [
  { id: 'all', label: 'All', icon: '🛠️' },
  { id: 'tools', label: 'Power Tools', icon: '⚡' },
  { id: 'marine', label: 'Marine Gear', icon: '⚓' },
  { id: 'event', label: 'Event Equipment', icon: '🎪' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'recreation', label: 'Recreation', icon: '🎯' },
  { id: 'camping', label: 'Camping', icon: '⛺' },
];

export default function EquipmentToolsPage() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings?category=rental&sub_category=equipment,tools,gear,machinery,marine_gear,event_equipment,camping,construction,recreation');
        const data = Array.isArray(res.data) ? res.data : (res.data.listings || []);
        setItems(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Equipment Rental',
          description: item.description || 'Quality equipment for your project or adventure.',
          price: item.price || Math.floor(Math.random() * 200) + 25,
          image_url: item.image_url,
          location: item.location || 'St. Kitts',
          subtype: item.subtype || 'tools',
          condition: item.metadata?.condition || 'Excellent',
          category_label: item.metadata?.category || 'General',
          rating: item.rating || (4.0 + Math.random() * 1),
          slug: item.slug,
        })));
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (activeType !== 'all') {
      result = result.filter(l => l.subtype?.toLowerCase().includes(activeType));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category_label?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeType, searchQuery]);

    const SILOS = [
        { id: 'stays', title: 'Stays & Homes', icon: '🏠', href: '/rental-hub/stays' },
        { id: 'vehicles', title: 'Vehicles', icon: '🚗', href: '/rental-hub/vehicles' },
        { id: 'sea', title: 'Sea & Aquatic', icon: '⛵', href: '/rental-hub/sea-rentals' },
        { id: 'equipment', title: 'Equipment & Tools', icon: '🛠️', href: '/rental-hub/equipment-tools' },
        { id: 'property', title: 'Land & Property', icon: '🏘️', href: '/rental-hub/property' },
    ];
    
    

      return (
    <main className="min-h-screen bg-surface-primary">
      <SiloSubNav current="equipment" silos={SILOS} />

      {/* HERO — Industrial/workshop feel */}
      <section className="relative min-h-[45vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-surface-tertiary" />
          <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-slate-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Equipment & Tools</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight leading-[0.95]">
              Rent the<br />
              <span className="bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 bg-clip-text text-transparent">Right Tools</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-xl font-medium">
              Power tools, marine gear, event equipment, construction machinery — rent what you need, when you need it.
            </p>

            {/* Search */}
            <div className="max-w-xl bg-surface-elevated rounded-2xl p-2 shadow-2xl flex gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tools, equipment, gear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 text-ink-primary font-medium placeholder:text-ink-tertiary focus:outline-none text-sm bg-transparent"
                />
              </div>
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FILTER */}
      <section className="sticky top-18 z-30 bg-surface-elevated/95 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {EQUIPMENT_TYPES.map(type => {
              const count = type.id === 'all' ? items.length : items.filter(l => l.subtype?.toLowerCase().includes(type.id)).length;
              return (
                <button key={type.id} onClick={() => setActiveType(type.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                    activeType === type.id
                      ? 'bg-slate-700 text-white border-slate-700 shadow-md'
                      : 'bg-surface-primary text-ink-secondary border-border-primary hover:border-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeType === type.id ? 'bg-white/20' : 'bg-surface-secondary'}`}>
                    {loading ? '…' : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-surface-secondary rounded-xl mb-2" />
                <div className="h-3 bg-surface-secondary rounded-full w-3/4 mb-1" />
                <div className="h-2 bg-surface-secondary rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-surface-elevated rounded-3xl border border-border-primary">
            <span className="text-5xl mb-4 block">🛠️</span>
            <h3 className="text-xl font-black text-ink-primary mb-2">No equipment found</h3>
            <p className="text-ink-tertiary mb-6">Try adjusting your search or filters</p>
            <button onClick={() => { setSearchQuery(''); setActiveType('all'); }} className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl">
              View All Equipment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} whileHover={{ y: -3 }} className="group">
                <Link href={item.slug ? `/store/${item.slug}` : `/listings/${item.id}`}>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-surface-secondary">
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-600/30 to-slate-700/30 flex items-center justify-center">
                        <span className="text-4xl opacity-40">🛠️</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-surface-elevated/90 backdrop-blur-sm rounded-md px-2 py-0.5 shadow-sm">
                      <span className="text-xs font-black text-ink-primary">${item.price}/d</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-ink-primary group-hover:text-slate-600 transition-colors line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-emerald-500 font-bold">{item.condition}</span>
                    <span className="text-[10px] text-ink-tertiary">·</span>
                    <span className="text-[10px] text-ink-tertiary">{item.location}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="relative overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Have Equipment to Rent?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            List your tools, gear, or machinery and earn from every rental.
          </p>
          <Link href="/become-vendor" className="px-10 py-4 bg-white text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-xl text-sm uppercase tracking-wider inline-block">
            List Equipment
          </Link>
        </div>
      </section>
      <div className="h-8 bg-surface-primary" />
    </main>
  );
}
