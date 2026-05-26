'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import SiloSubNav from '@/app/rental-hub/SiloSubNav';

interface VehicleListing {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  location?: string;
  subtype?: string;
  transmission?: string;
  seats?: number;
  fuel_type?: string;
  year?: number;
  rating?: number;
  slug?: string;
}

const VEHICLE_TYPES = [
  { id: 'all', label: 'All', icon: '🗺️' },
  { id: 'car', label: 'Cars', icon: '🚗' },
  { id: 'suv', label: 'SUVs', icon: '🚙' },
  { id: 'jeep', label: 'Jeeps', icon: '🏔️' },
  { id: 'atv', label: 'ATVs', icon: '🏍️' },
  { id: 'bike', label: 'Bikes', icon: '🚲' },
  { id: 'scooter', label: 'Scooters', icon: '🛵' },
];

export default function LandRentalsPage() {
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings?category=rental&sub_category=car,suv,jeep,atv,bike,scooter,vehicle');
        const data = Array.isArray(res.data) ? res.data : (res.data.listings || []);
        setListings(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Island Vehicle',
          description: item.description || 'Reliable transport for your island adventure.',
          price: item.price || Math.floor(Math.random() * 150) + 45,
          image_url: item.image_url,
          location: item.location || 'St. Kitts',
          subtype: item.subtype || item.vehicle_category || 'car',
          transmission: item.metadata?.transmission || (Math.random() > 0.5 ? 'Automatic' : 'Manual'),
          seats: item.metadata?.seats || Math.floor(Math.random() * 6) + 2,
          fuel_type: item.metadata?.fuel_type || ['Gasoline', 'Diesel', 'Electric'][Math.floor(Math.random() * 3)],
          year: item.metadata?.year || 2020 + Math.floor(Math.random() * 5),
          rating: item.rating || (4.0 + Math.random() * 1),
          slug: item.slug,
        })));
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filtered = useMemo(() => {
    if (activeType === 'all') return listings;
    return listings.filter(l => l.subtype?.toLowerCase().includes(activeType));
  }, [listings, activeType]);

    const SILOS = [
        { id: 'stays', title: 'Stays & Homes', icon: '🏠', href: '/rental-hub/stays' },
        { id: 'land', title: 'Land Rentals', icon: '🚗', href: '/rental-hub/land-rentals' },
        { id: 'sea', title: 'Sea & Aquatic', icon: '⛵', href: '/rental-hub/sea-rentals' },
        { id: 'equipment', title: 'Equipment & Tools', icon: '🛠️', href: '/rental-hub/equipment-tools' },
    ];
    
    

      return (
    <main className="min-h-screen bg-surface-primary">
      <SiloSubNav current="land" silos={SILOS} />

      {/* HERO */}
      <section className="relative min-h-[55vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-surface-tertiary to-ocean-900" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-sunset-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-amber-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-sunset-500 animate-pulse" />
              <span className="text-xs font-bold text-sand-100 uppercase tracking-widest">Land Rentals</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-[0.95]">
              Explore the<br />
              <span className="bg-gradient-to-r from-sunset-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">Island Roads</span>
            </h1>
            <p className="text-lg text-sand-200/70 mb-8 max-w-xl font-medium">
              Cars, jeeps, ATVs and bikes — freedom to explore every corner of St. Kitts & Nevis.
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{loading ? '—' : listings.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-200/50">Vehicles</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-sunset-400">24/7</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-200/50">Pickup</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">Free</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-200/50">Delivery</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VEHICLE TYPE FILTER */}
      <section className="sticky top-18 z-30 bg-surface-elevated/95 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {VEHICLE_TYPES.map(type => {
              const count = type.id === 'all' ? listings.length : listings.filter(l => l.subtype?.toLowerCase().includes(type.id)).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                    activeType === type.id
                      ? 'bg-sunset-500 text-white border-sunset-500 shadow-md'
                      : 'bg-surface-primary text-ink-secondary border-border-primary hover:border-sunset-300 hover:text-sunset-500'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeType === type.id ? 'bg-white/20' : 'bg-surface-secondary'
                  }`}>
                    {loading ? '…' : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* LISTINGS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-surface-secondary rounded-2xl mb-3" />
                <div className="h-4 bg-surface-secondary rounded-full w-3/4 mb-2" />
                <div className="h-3 bg-surface-secondary rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-surface-elevated rounded-3xl border border-border-primary">
            <span className="text-5xl mb-4 block">🚗</span>
            <h3 className="text-xl font-black text-ink-primary mb-2">No vehicles found</h3>
            <p className="text-ink-tertiary mb-6">Try a different vehicle type</p>
            <button onClick={() => setActiveType('all')} className="px-6 py-3 bg-sunset-500 text-white font-bold rounded-xl">
              View All Vehicles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Link href={item.slug ? `/store/${item.slug}` : `/listings/${item.id}`}>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-surface-secondary">
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url)} alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sunset-500/20 to-amber-500/20 flex items-center justify-center">
                        <span className="text-5xl opacity-40">🚗</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-surface-elevated/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                      <span className="text-sm font-black text-ink-primary">${item.price}</span>
                      <span className="text-[10px] text-ink-tertiary"> / day</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-ink-primary group-hover:text-sunset-500 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-amber-500 text-xs">★</span>
                        <span className="text-xs font-bold text-ink-primary">{item.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-ink-tertiary">{item.location}</p>
                    <div className="flex items-center gap-3 text-[10px] text-ink-tertiary font-medium">
                      <span>{item.transmission}</span>
                      <span>·</span>
                      <span>{item.seats} seats</span>
                      {item.year && (
                        <>
                          <span>·</span>
                          <span>{item.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="relative overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-sunset-600 via-amber-600 to-yellow-600" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">List Your Vehicle</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Turn your car, jeep, or ATV into an income source. List it on IslandHub and start earning.
          </p>
          <Link href="/become-vendor" className="px-10 py-4 bg-white text-sunset-600 font-bold rounded-2xl hover:bg-sand-50 transition-all shadow-xl text-sm uppercase tracking-wider inline-block">
            Start Earning
          </Link>
        </div>
      </section>

      <div className="h-8 bg-surface-primary" />
    </main>
  );
}
