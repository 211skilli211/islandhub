'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

export function ProfessionalServicesHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=service').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Professional Services" subtitle="Legal, consulting, accounting, and business" emoji="💼" gradient="from-blue-900 via-indigo-900 to-violet-900" items={items} loading={loading} filters={['All', 'Legal', 'Consulting', 'Accounting']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="💼" emptyTitle="No professional services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/services/professional/${s.slug}`} imageUrl={s.banner_url} emoji="💼" title={s.name || s.business_name} subtitle={s.subtype || 'Professional'} rating={s.rating} badge="Available" badgeColor="bg-emerald-500" ctaLabel="Book Now" />} />;
}

export function AutomotiveServicesHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=service&sub_type=automotive').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Automotive Services" subtitle="Car repair, detailing, and maintenance" emoji="🚗" gradient="from-orange-900 via-red-900 to-rose-900" items={items} loading={loading} filters={['All', 'Repair', 'Detailing', 'Oil Change']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="🚗" emptyTitle="No automotive services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/services/automotive/${s.slug}`} imageUrl={s.banner_url} emoji="🚗" title={s.name || s.business_name} subtitle={s.subtype || 'Auto Service'} rating={s.rating} badge="Mobile Service" badgeColor="bg-orange-500" ctaLabel="Book Now" />} />;
}

export function BeautyServicesHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=service&sub_type=spa,salon,wellness').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Health & Beauty" subtitle="Spa, salon, and wellness treatments" emoji="💆" gradient="from-pink-900 via-rose-900 to-fuchsia-900" items={items} loading={loading} filters={['All', 'Spa', 'Salon', 'Massage']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="💆" emptyTitle="No beauty services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/services/health/${s.slug}`} imageUrl={s.banner_url} emoji="💆" title={s.name || s.business_name} subtitle={s.subtype || 'Beauty'} rating={s.rating} ctaLabel="Book Now" />} />;
}

export function MarineServicesHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=service&sub_type=marine,boat').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Marine Services" subtitle="Boat services, diving, and water activities" emoji="⚓" gradient="from-cyan-900 via-blue-900 to-indigo-900" items={items} loading={loading} emptyEmoji="⚓" emptyTitle="No marine services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/services/marine/${s.slug}`} imageUrl={s.banner_url} emoji="⚓" title={s.name || s.business_name} subtitle={s.subtype || 'Marine'} rating={s.rating} badge="Insured" badgeColor="bg-cyan-500" ctaLabel="Book Now" />} />;
}

export function EventServicesHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=service&sub_type=catering,entertainment,planning').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Event Services" subtitle="Catering, planning, and entertainment" emoji="🎉" gradient="from-violet-900 via-purple-900 to-fuchsia-900" items={items} loading={loading} filters={['All', 'Catering', 'Planning', 'Entertainment']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="🎉" emptyTitle="No event services found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/services/events/${s.slug}`} imageUrl={s.banner_url} emoji="🎉" title={s.name || s.business_name} subtitle={s.subtype || 'Event'} rating={s.rating} ctaLabel="Get Quote" />} />;
}
