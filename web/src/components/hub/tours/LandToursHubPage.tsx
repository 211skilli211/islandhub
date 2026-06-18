'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

export function LandToursHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/listings?category=tour&sub_type=land,hiking,nature,culture').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.listings || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Land Tours & Hiking" subtitle="Hiking trails, history walks, and nature tours" emoji="🥾" gradient="from-emerald-900 via-teal-900 to-green-900" items={items} loading={loading} filters={['All', 'Easy', 'Moderate', 'Difficult']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="🥾" emptyTitle="No land tours found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/tours/land/${s.slug}`} imageUrl={s.banner_url || s.image_url} emoji="🥾" title={s.name || s.title || s.business_name} subtitle={[s.duration, s.difficulty].filter(Boolean).join(' . ')} price={s.price} priceSuffix="/person" rating={s.rating} ctaLabel="Book Now" />} />;
}

export function SeaToursHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/listings?category=tour&sub_type=sea,snorkeling,sailing,diving').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.listings || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Sea & Water Adventures" subtitle="Snorkeling, sailing, fishing, and diving" emoji="🌊" gradient="from-cyan-900 via-blue-900 to-indigo-900" items={items} loading={loading} emptyEmoji="🌊" emptyTitle="No sea tours found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/tours/sea/${s.slug}`} imageUrl={s.banner_url || s.image_url} emoji="🌊" title={s.name || s.title || s.business_name} subtitle={[s.duration, s.group_size && `Max ${s.group_size}`].filter(Boolean).join(' . ')} price={s.price} priceSuffix="/person" rating={s.rating} ctaLabel="Book Now" />} />;
}

export function AdventureToursHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/listings?category=tour&sub_type=adventure,zipline,atv,extreme').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.listings || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Adventure & Extreme" subtitle="Zip-lining, ATV, and extreme experiences" emoji="🧗" gradient="from-red-900 via-orange-900 to-amber-900" items={items} loading={loading} emptyEmoji="🧗" emptyTitle="No adventure tours found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/tours/adventure/${s.slug}`} imageUrl={s.banner_url || s.image_url} emoji="🧗" title={s.name || s.title || s.business_name} subtitle={[s.duration, s.thrill_level && `Thrill: ${s.thrill_level}/5`].filter(Boolean).join(' . ')} price={s.price} priceSuffix="/person" rating={s.rating} ctaLabel="Book Now" />} />;
}

export function CharterToursHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/listings?category=tour&sub_type=charter,yacht,private_boat').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.listings || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Private Charters" subtitle="Private boat and yacht charters" emoji="⛵" gradient="from-sky-900 via-indigo-900 to-violet-900" items={items} loading={loading} emptyEmoji="⛵" emptyTitle="No charters found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/tours/charter/${s.slug}`} imageUrl={s.banner_url || s.image_url} emoji="⛵" title={s.name || s.title || s.business_name} subtitle={[s.duration, s.capacity && `${s.capacity} guests`].filter(Boolean).join(' . ')} price={s.price} priceSuffix="/trip" rating={s.rating} badge={s.captain_included ? 'Captain Included' : undefined} badgeColor="bg-sky-500" ctaLabel="Book Charter" />} />;
}
