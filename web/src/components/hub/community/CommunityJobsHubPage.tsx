'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY JOBS — Job board hub page
// Links to /community/jobs
// Filters: All, Full-time, Part-time, Contract, Remote, Internship
// ═══════════════════════════════════════════════════════════════════════════════

interface Job {
  id: number;
  title: string;
  slug: string;
  company: string;
  company_logo_url: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  skills: string[];
  description: string;
  posted_at: string;
  is_urgent: boolean;
  applicants_count: number;
}

const CATEGORIES = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
const SORT_OPTIONS = ['Newest', 'Salary', 'Applicants'];

function formatSalary(min: number, max: number, currency: string) {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
  return `${currency}${fmt(min)}-${fmt(max)}`;
}

function formatPostedDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getJobTypeEmoji(jobType: string) {
  const icons: Record<string, string> = {
    'full-time': '💼',
    'part-time': '⏰',
    'contract': '📝',
    'remote': '🏠',
    'internship': '🎓',
  };
  return icons[jobType.toLowerCase()] || '💼';
}

function getJobTypeBadgeColor(jobType: string) {
  const colors: Record<string, string> = {
    'full-time': 'bg-blue-500',
    'part-time': 'bg-amber-500',
    'contract': 'bg-purple-500',
    'remote': 'bg-green-500',
    'internship': 'bg-cyan-500',
  };
  return colors[jobType.toLowerCase()] || 'bg-gray-500';
}

export function CommunityJobsHubPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Newest');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/community/jobs?limit=20');
        setJobs(Array.isArray(res.data) ? res.data : res.data?.jobs || getSampleJobs());
      } catch {
        setJobs(getSampleJobs());
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const filtered = activeFilter === 'All'
    ? jobs
    : jobs.filter(j => j.job_type.toLowerCase() === activeFilter.toLowerCase());

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'Salary') return b.salary_max - a.salary_max;
    if (activeSort === 'Applicants') return a.applicants_count - b.applicants_count;
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  return (
    <CompactHubPage
      title="Job Board"
      subtitle="Find your next opportunity across the Caribbean islands"
      emoji="💼"
      gradient="from-indigo-900 via-violet-900 to-purple-900"
      items={sorted}
      loading={loading}
      skeletonCount={8}
      filters={CATEGORIES}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="💼"
      emptyTitle="No jobs found"
      emptyMessage="Try a different filter or check back later for new opportunities."
      renderCard={(job: Job) => (
        <CompactCard
          key={job.id}
          href={`/community/jobs/${job.slug}`}
          imageUrl={job.company_logo_url}
          emoji={getJobTypeEmoji(job.job_type)}
          title={job.title}
          subtitle={job.company}
          badge={formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
          badgeColor={getJobTypeBadgeColor(job.job_type)}
          meta={[
            job.job_type,
            job.location,
            ...job.skills.slice(0, 2).map(s => `#${s}`),
          ]}
          ctaLabel="Apply Now"
        />
      )}
      ctaSection={
        <section className="py-8 border-t border-border-primary text-center">
          <h3 className="text-lg font-bold text-ink-primary mb-2">Hiring Talent?</h3>
          <p className="text-sm text-ink-tertiary mb-4 max-w-md mx-auto">
            Post your job listing and connect with skilled professionals across the islands.
          </p>
          <Link
            href="/community/jobs/post"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
          >
            Post a Job →
          </Link>
        </section>
      }
    />
  );
}

// ─── Sample Data ────────────────────────────────────────────────────────────

function getSampleJobs(): Job[] {
  return [
    {
      id: 1, title: 'Senior Software Engineer', slug: 'senior-swe',
      company: 'Caribbean Tech Solutions', company_logo_url: '',
      location: 'Basseterre, St. Kitts', job_type: 'Full-time',
      salary_min: 80000, salary_max: 120000, salary_currency: '$',
      skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
      description: 'Lead development of island-wide digital services platform.',
      posted_at: '2026-07-05T10:00:00', is_urgent: true, applicants_count: 12,
    },
    {
      id: 2, title: 'Hotel Operations Manager', slug: 'hotel-ops',
      company: 'Azure Bay Resort', company_logo_url: '',
      location: 'Providenciales, TCI', job_type: 'Full-time',
      salary_min: 55000, salary_max: 75000, salary_currency: '$',
      skills: ['Hospitality', 'Management', 'PMS', 'Customer Service'],
      description: 'Oversee daily operations of luxury beachfront resort.',
      posted_at: '2026-07-04T09:00:00', is_urgent: false, applicants_count: 28,
    },
    {
      id: 3, title: 'Part-time Tutor', slug: 'tutor-pt',
      company: 'Island Learning Center', company_logo_url: '',
      location: 'St. John\'s, Antigua', job_type: 'Part-time',
      salary_min: 20, salary_max: 35, salary_currency: '$',
      skills: ['Teaching', 'Math', 'Science', 'Communication'],
      description: 'Tutor high school students in math and sciences.',
      posted_at: '2026-07-06T14:00:00', is_urgent: false, applicants_count: 45,
    },
    {
      id: 4, title: 'Web Developer (Remote)', slug: 'web-dev-remote',
      company: 'Digital Island Agency', company_logo_url: '',
      location: 'Remote', job_type: 'Remote',
      salary_min: 60000, salary_max: 90000, salary_currency: '$',
      skills: ['JavaScript', 'Next.js', 'TailwindCSS', 'Figma'],
      description: 'Build beautiful web experiences for international clients.',
      posted_at: '2026-07-06T08:00:00', is_urgent: false, applicants_count: 67,
    },
    {
      id: 5, title: 'Marketing Intern', slug: 'mkt-intern',
      company: 'Island Tourism Board', company_logo_url: '',
      location: 'The Valley, Anguilla', job_type: 'Internship',
      salary_min: 15000, salary_max: 20000, salary_currency: '$',
      skills: ['Social Media', 'Content', 'Analytics', 'Design'],
      description: 'Support digital marketing campaigns for island tourism.',
      posted_at: '2026-07-03T11:00:00', is_urgent: false, applicants_count: 89,
    },
    {
      id: 6, title: 'Marine Biologist (Contract)', slug: 'marine-bio',
      company: 'Caribbean Conservation Trust', company_logo_url: '',
      location: 'Tortola, BVI', job_type: 'Contract',
      salary_min: 45000, salary_max: 60000, salary_currency: '$',
      skills: ['Marine Biology', 'Data Analysis', 'SCUBA', 'Research'],
      description: '6-month coral reef monitoring and restoration project.',
      posted_at: '2026-07-05T16:00:00', is_urgent: true, applicants_count: 8,
    },
    {
      id: 7, title: 'Restaurant Sous Chef', slug: 'sous-chef',
      company: 'Island Bistro & Grill', company_logo_url: '',
      location: 'The Valley, Anguilla', job_type: 'Full-time',
      salary_min: 38000, salary_max: 48000, salary_currency: '$',
      skills: ['Culinary', 'Caribbean Cuisine', 'Menu Planning', 'Team Lead'],
      description: 'Lead kitchen operations in award-winning farm-to-table restaurant.',
      posted_at: '2026-07-01T12:00:00', is_urgent: false, applicants_count: 19,
    },
    {
      id: 8, title: 'Nurse Practitioner', slug: 'nurse-pract',
      company: 'Island Health Clinic', company_logo_url: '',
      location: 'St. George\'s, Grenada', job_type: 'Full-time',
      salary_min: 50000, salary_max: 65000, salary_currency: '$',
      skills: ['Nursing', 'Primary Care', 'Telehealth', 'EMR'],
      description: 'Provide primary care in community health clinic with telehealth options.',
      posted_at: '2026-07-06T06:00:00', is_urgent: true, applicants_count: 5,
    },
  ];
}
