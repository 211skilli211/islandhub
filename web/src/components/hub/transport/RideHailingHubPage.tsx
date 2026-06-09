'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

export function RideHailingHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=transport&sub_type=ride,taxi').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Ride Hailing" subtitle="Quick rides across St. Kitts & Nevis" emoji="🚕" gradient="from-sky-900 via-blue-900 to-indigo-900" items={items} loading={loading} filters={['All', 'Standard', 'Premium', 'SUV']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="🚕" emptyTitle="No rides available" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/transport/ride/${s.slug}`} imageUrl={s.banner_url} emoji="🚕" title={s.name || s.business_name} subtitle={s.subtype || 'Ride'} rating={s.rating} badge="2 min away" badgeColor="bg-sky-500" meta={['$8+']} ctaLabel="Book Ride" />} />;
}

export function DeliveryHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=transport&sub_type=delivery,courier').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Package Delivery" subtitle="Send packages and goods across the island" emoji="📦" gradient="from-amber-900 via-orange-900 to-red-900" items={items} loading={loading} emptyEmoji="📦" emptyTitle="No delivery services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/transport/delivery/${s.slug}`} imageUrl={s.banner_url} emoji="📦" title={s.name || s.business_name} subtitle={s.subtype || 'Delivery'} rating={s.rating} ctaLabel="Schedule" />} />;
}

export function BoatTransportHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=transport&sub_type=boat,ferry').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Boat Charters & Ferries" subtitle="Private boat and ferry services" emoji="🚤" gradient="from-teal-900 via-cyan-900 to-blue-900" items={items} loading={loading} emptyEmoji="🚤" emptyTitle="No boat services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/transport/boat/${s.slug}`} imageUrl={s.banner_url} emoji="🚤" title={s.name || s.business_name} subtitle={s.subtype || 'Boat'} rating={s.rating} ctaLabel="Book Passage" />} />;
}

export function MovingHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=transport&sub_type=moving,relocation').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Moving & Relocation" subtitle="Relocation and heavy lifting services" emoji="🚚" gradient="from-slate-800 via-zinc-900 to-neutral-900" items={items} loading={loading} emptyEmoji="🚚" emptyTitle="No moving services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/transport/moving/${s.slug}`} imageUrl={s.banner_url} emoji="🚚" title={s.name || s.business_name} subtitle={s.subtype || 'Moving'} rating={s.rating} badge="Available Today" badgeColor="bg-emerald-500" ctaLabel="Get Quote" />} />;
}
