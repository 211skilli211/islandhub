'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

export function CommunityDirectoryHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/stores?category=community').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.stores || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Island Community" subtitle="Events, stories, and groups across the Caribbean" emoji="🌴" gradient="from-green-900 via-emerald-900 to-teal-900" items={items} loading={loading} emptyEmoji="🌴" emptyTitle="No community items found" renderCard={(s, i) => <CompactCard key={s.store_id || s.id} href={`/hub/community/${s.slug}`} imageUrl={s.banner_url} emoji="🌴" title={s.name || s.business_name} subtitle={s.subtype || 'Community'} rating={s.rating} ctaLabel="Explore" />} />;
}
