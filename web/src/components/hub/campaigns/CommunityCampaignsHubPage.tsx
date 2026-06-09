'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

export function CommunityCampaignsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/campaigns?category=community').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.campaigns || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Community Fundraisers" subtitle="Local community projects and causes" emoji="❤️" gradient="from-rose-900 via-pink-900 to-fuchsia-900" items={items} loading={loading} filters={['All', 'Most Urgent', 'Most Funded', 'Newest']} activeFilter="All" onFilterChange={() => {}} emptyEmoji="❤️" emptyTitle="No campaigns found" renderCard={(s, i) => <CompactCard key={s.id} href={`/hub/campaigns/community/${s.slug}`} imageUrl={s.image_url} emoji="❤️" title={s.title || s.name} subtitle={s.category || 'Community'} badge={s.urgency} badgeColor="bg-rose-500" meta={[`$${s.raised || 0} of $${s.goal || 0}`, `${s.days_left || 0} days left`].filter(Boolean)} ctaLabel="Contribute" />} />;
}

export function EnvironmentCampaignsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/campaigns?category=environment').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.campaigns || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Environmental Causes" subtitle="Eco, conservation, and green projects" emoji="🌱" gradient="from-green-900 via-emerald-900 to-teal-900" items={items} loading={loading} emptyEmoji="🌱" emptyTitle="No environmental campaigns found" renderCard={(s, i) => <CompactCard key={s.id} href={`/hub/campaigns/environment/${s.slug}`} imageUrl={s.image_url} emoji="🌱" title={s.title || s.name} subtitle={s.category || 'Environment'} badge={s.urgency} badgeColor="bg-green-500" meta={[`$${s.raised || 0} of $${s.goal || 0}`].filter(Boolean)} ctaLabel="Back this Project" />} />;
}

export function EducationCampaignsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/campaigns?category=education').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.campaigns || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Education & Scholarships" subtitle="Schools, learning, and student support" emoji="📚" gradient="from-blue-900 via-indigo-900 to-violet-900" items={items} loading={loading} emptyEmoji="📚" emptyTitle="No education campaigns found" renderCard={(s, i) => <CompactCard key={s.id} href={`/hub/campaigns/education/${s.slug}`} imageUrl={s.image_url} emoji="📚" title={s.title || s.name} subtitle={s.category || 'Education'} badge={s.urgency} badgeColor="bg-blue-500" meta={[`$${s.raised || 0} of $${s.goal || 0}`].filter(Boolean)} ctaLabel="Donate" />} />;
}

export function HealthCampaignsHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/campaigns?category=health').then((r: any) => setItems(Array.isArray(r.data) ? r.data : r.data?.campaigns || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <CompactHubPage title="Health & Medical" subtitle="Medical treatment and health causes" emoji="🏥" gradient="from-red-900 via-rose-900 to-pink-900" items={items} loading={loading} emptyEmoji="🏥" emptyTitle="No health campaigns found" renderCard={(s, i) => <CompactCard key={s.id} href={`/hub/campaigns/health/${s.slug}`} imageUrl={s.image_url} emoji="🏥" title={s.title || s.name} subtitle={s.category || 'Health'} badge={s.urgency || 'Emergency'} badgeColor="bg-red-500" meta={[`$${s.raised || 0} of $${s.goal || 0}`].filter(Boolean)} ctaLabel="Help Now" />} />;
}
