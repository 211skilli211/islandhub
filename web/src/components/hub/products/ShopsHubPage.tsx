'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

export function ShopsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=product').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Island Shops" subtitle="General retail stores" emoji="🏪" gradient="from-emerald-900 via-teal-900 to-cyan-900" items={items} loading={loading} filters={['All', 'Gift Shop', 'Electronics', 'Home & Garden']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="🏪" emptyTitle="No shops found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/products/shops/${s.slug}`} imageUrl={s.banner_url} emoji="🏪" title={s.name || s.business_name} rating={s.rating} meta={[s.subtype || 'Shop']} ctaLabel="Shop Now" />} />;
}

export function SpecialtyHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=product&sub_type=artisan,craft').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Artisan & Specialty" subtitle="Handcrafted Caribbean goods" emoji="🎨" gradient="from-violet-900 via-purple-900 to-fuchsia-900" items={items} loading={loading} emptyEmoji="🎨" emptyTitle="No artisan goods found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/products/specialty/${s.slug}`} imageUrl={s.banner_url} emoji="🎨" title={s.name || s.business_name} subtitle="Handmade in St. Kitts" rating={s.rating} ctaLabel="View Story" />} />;
}

export function FashionHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=product&sub_type=fashion,clothing').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Fashion & Accessories" subtitle="Clothing, shoes, and island style" emoji="👗" gradient="from-pink-900 via-rose-900 to-red-900" items={items} loading={loading} filters={['All', 'Women', 'Men', 'Accessories', 'Shoes']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="👗" emptyTitle="No fashion items found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/products/fashion/${s.slug}`} imageUrl={s.banner_url} emoji="👗" title={s.name || s.business_name} rating={s.rating} ctaLabel="Shop Now" />} />;
}

export function HealthHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=product&sub_type=health_beauty,wellness').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Health & Beauty" subtitle="Wellness, supplements, and self-care" emoji="💊" gradient="from-teal-900 via-emerald-900 to-green-900" items={items} loading={loading} emptyEmoji="💊" emptyTitle="No health products found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/products/health/${s.slug}`} imageUrl={s.banner_url} emoji="💊" title={s.name || s.business_name} rating={s.rating} ctaLabel="Shop Now" />} />;
}
