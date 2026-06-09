'use client';
import React from 'react';
import { CampaignsHubPage } from './CommunityCampaignsHubPage';

export function EnvironmentCampaignsHubPage() {
  return <CampaignsHubPage category="environment" title="Environmental Campaigns" subtitle="Conservation and sustainability initiatives"
    emoji="🌿" gradient="from-green-900 via-emerald-900 to-teal-900" subtypes={['environment', 'conservation', 'sustainability']} />;
}

export function EducationCampaignsHubPage() {
  return <CampaignsHubPage category="education" title="Education Campaigns" subtitle="Schools, scholarships, and learning programs"
    emoji="📚" gradient="from-blue-900 via-indigo-900 to-violet-900" subtypes={['education', 'school', 'scholarship']} />;
}

export function HealthCampaignsHubPage() {
  return <CampaignsHubPage category="health" title="Health Campaigns" subtitle="Medical aid and wellness programs"
    emoji="🏥" gradient="from-red-900 via-rose-900 to-pink-900" subtypes={['health', 'medical', 'wellness']} />;
}
