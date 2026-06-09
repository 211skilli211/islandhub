'use client';
import React from 'react';
import { EventsHubPage } from './CommunityEventsHubPage';

export function EnvironmentEventsHubPage() {
  return <EventsHubPage category="environment" title="Environmental Events" subtitle="Cleanups, tree planting, and conservation activities"
    emoji="🌿" gradient="from-green-900 via-emerald-900 to-teal-900" subtypes={['environment', 'cleanup', 'conservation']} />;
}

export function EducationEventsHubPage() {
  return <EventsHubPage category="education" title="Educational Events" subtitle="Workshops, seminars, and learning sessions"
    emoji="📚" gradient="from-blue-900 via-indigo-900 to-violet-900" subtypes={['education', 'workshop', 'seminar']} />;
}

export function HealthEventsHubPage() {
  return <EventsHubPage category="health" title="Health Events" subtitle="Health fairs, screenings, and wellness activities"
    emoji="🏥" gradient="from-red-900 via-rose-900 to-pink-900" subtypes={['health', 'wellness', 'screening']} />;
}
