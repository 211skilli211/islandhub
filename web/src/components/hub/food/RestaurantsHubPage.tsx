'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const subtypes = ['restaurant', 'dining', 'fine_dining'];
const gradient = 'from-orange-900 via-red-900 to-rose-900';

export default function RestaurantsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stores?category=food')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.stores || [];
        setItems(raw.filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase())).slice(0, 12).map((s: any, i: number) => ({
          ...s, _subtype: ['Caribbean', 'Italian', 'Seafood', 'Steakhouse', 'Asian'][i % 5],
          _price: ['$$', '$$$', '$', '$$$$', '$$'][i % 5],
          _time: `${15 + i * 5} min`,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage title="Restaurants" subtitle="Full-service dining across St. Kitts & Nevis" emoji="🍽️" gradient={gradient} items={items} loading={loading} filters={['All', 'Caribbean', 'Italian', 'Seafood', 'Steakhouse']} activeFilter="All" onFilterChange={() => {}} sortOptions={['Popular', 'Rating', 'Distance']} activeSort="Popular" onSortChange={() => {}} emptyEmoji="🍽️" emptyTitle="No restaurants found" emptyMessage="Check back later for new restaurant listings."
      renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/food/restaurants/${s.slug}`} imageUrl={s.banner_url} emoji="🍽️" title={s.name || s.business_name} subtitle={s._subtype} rating={s.rating} badge={s._price} badgeColor="bg-orange-500" meta={[`<EmojiIcon emoji="🕐" size={16} /> ${s._time}`]} ctaLabel="Order Now" />}
    />
  );
}

export function KitchensHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stores?category=food')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.stores || [];
        setItems(raw.slice(0, 12).map((s: any, i: number) => ({
          ...s, _type: ['Cloud Kitchen', 'Home Cooking', 'Catering'][i % 3],
          _prepTime: `${20 + i * 10} min`,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage title="Cloud Kitchens" subtitle="Fresh home-cooked meals delivered to your door" emoji="🍳" gradient="from-amber-900 via-orange-900 to-red-900" items={items} loading={loading} filters={['All', 'Cloud Kitchen', 'Home Cooking', 'Catering']} activeFilter="All" onFilterChange={() => {}} sortOptions={['Popular', 'Prep Time', 'Rating']} activeSort="Popular" onSortChange={() => {}} emptyEmoji="🍳" emptyTitle="No kitchens found" emptyMessage="Check back later for new kitchen listings."
      renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/food/kitchens/${s.slug}`} imageUrl={s.banner_url} emoji="🍳" title={s.name || s.business_name} subtitle={s._type} rating={s.rating} badge="Open" badgeColor="bg-emerald-500" meta={[`⏱ ${s._prepTime}`]} ctaLabel="Order Now" />}
    />
  );
}

export function CafesHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stores?category=food')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.stores || [];
        setItems(raw.slice(0, 12).map((s: any) => ({ ...s, _type: 'Café' })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage title="Cafés & Bakeries" subtitle="Coffee, pastries, and light bites" emoji="☕" gradient="from-amber-800 via-yellow-900 to-orange-900" items={items} loading={loading} emptyEmoji="☕" emptyTitle="No cafés found" emptyMessage="Check back later for new café listings."
      renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/food/cafes/${s.slug}`} imageUrl={s.banner_url} emoji="☕" title={s.name || s.business_name} subtitle={s._type} rating={s.rating} badge="Now Serving" badgeColor="bg-amber-500" ctaLabel="Order for Pickup" />}
    />
  );
}

export function GrillsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stores?category=food')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.stores || [];
        setItems(raw.slice(0, 12).map((s: any, i: number) => ({
          ...s, _vibe: ['Casual', 'Live Music', 'Late Night', 'Beach Bar'][i % 4],
          _happyHr: i % 2 === 0 ? 'Happy Hour 4-6PM' : undefined,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage title="Grills & Bars" subtitle="BBQ, grills, and island nightlife" emoji="🍺" gradient="from-rose-900 via-purple-900 to-indigo-900" items={items} loading={loading} filters={['All', 'Casual', 'Live Music', 'Late Night', 'Beach Bar']} activeFilter="All" onFilterChange={() => {}} sortOptions={['Popular', 'Rating']} activeSort="Popular" onSortChange={() => {}} emptyEmoji="🍺" emptyTitle="No grills or bars found" emptyMessage="Check back later for new listings."
      renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/food/grills/${s.slug}`} imageUrl={s.banner_url} emoji="🍺" title={s.name || s.business_name} subtitle={s._vibe} rating={s.rating} badge={s._happyHr} badgeColor="bg-purple-500" ctaLabel="Explore" />}
    />
  );
}
