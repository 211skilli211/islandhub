'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Search, MapPin, DollarSign, Clock, Building } from 'lucide-react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    salary_text?: string;
    job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
    description?: string;
    posted_date: string;
    category?: string;
    logo_url?: string;
}

type FilterType = 'all' | 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';

function formatSalary(job: Job): string {
    if (job.salary_text) return job.salary_text;
    if (job.salary_min && job.salary_max) return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}k`;
    return 'Negotiable';
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_BADGES: Record<string, string> = {
    'full-time': 'bg-accent-500/10 text-accent-500',
    'part-time': 'bg-amber-500/10 text-amber-600',
    'contract': 'bg-blue-500/10 text-blue-600',
    'internship': 'bg-purple-500/10 text-purple-600',
    'remote': 'bg-green-500/10 text-green-600',
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '30');
                params.append('sort', 'newest');
                if (filter !== 'all') params.append('job_type', filter);

                const response = await api.get(`/community/jobs?${params.toString()}`);
                setJobs(response.data || response || []);
            } catch {
                setJobs(getSampleJobs());
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, [filter]);

    const getSampleJobs = (): Job[] => [
        { id: 1, title: 'Software Developer', company: 'Island Tech', location: 'Remote', salary_min: 60000, salary_max: 80000, job_type: 'full-time', description: 'Join our team building the next generation of island tech solutions. React, Node.js, and cloud experience required.', posted_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 2, title: 'Marketing Manager', company: 'Tropical Brand Co.', location: 'Downtown Office', salary_min: 50000, salary_max: 70000, job_type: 'full-time', description: 'Lead marketing campaigns for a growing lifestyle brand. Social media and content marketing expertise required.', posted_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
        { id: 3, title: 'Delivery Driver', company: 'Island Express', location: 'Island-wide', salary_text: '$18/hr', job_type: 'part-time', description: 'Flexible delivery work across the island. Vehicle required. Great side income opportunity.', posted_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, title: 'Frontend Engineer', company: 'Wave Digital', location: 'Remote', salary_min: 70000, salary_max: 95000, job_type: 'full-time', description: 'Build beautiful, accessible web applications. TypeScript, React, and design systems experience preferred.', posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, title: 'Barista', company: 'Harbor Coffee Roasters', location: 'Harbor District', salary_text: '$15/hr + tips', job_type: 'part-time', description: 'Passionate about coffee? Join our team at the island\'s best roastery. No experience necessary, training provided.', posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 6, title: 'Project Manager', company: 'BuildRight Construction', location: 'Various Sites', salary_min: 55000, salary_max: 75000, job_type: 'contract', description: '6-month contract overseeing residential construction projects. PMP certification preferred.', posted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    const filteredJobs = jobs.filter(j => {
        const matchesType = filter === 'all' || j.job_type === filter;
        const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (j.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleApply = async (jobId: number) => {
        try {
            await api.post(`/community/jobs/${jobId}/apply`);
        } catch {
            try {
                await api.post(`/jobs/${jobId}/apply`);
            } catch (e) {
                console.error('Failed to apply:', e);
            }
        }
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tighter">Job Board</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Find jobs or post opportunities on the island</p>
                    </div>
                    <Link
                        href="/community/jobs/post"
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        <Briefcase size={16} className="inline mr-2" />
                        Post a Job
                    </Link>
                </div>

                <div className="relative flex-1 max-w-lg mb-8">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                        type="text"
                        placeholder="Search jobs by title, company, keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-surface-elevated rounded-2xl border border-border-primary font-medium outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    {(['all', 'full-time', 'part-time', 'contract', 'internship', 'remote'] as FilterType[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                                ? 'bg-accent-500 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-surface-elevated text-ink-tertiary hover:bg-surface-secondary'
                                }`}
                        >
                            {f === 'all' ? '🌟 All' : f}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-surface-elevated rounded-2xl p-6 border border-border-primary animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-surface-secondary rounded-xl shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-surface-secondary rounded-lg w-2/3"></div>
                                        <div className="h-4 bg-surface-secondary rounded w-1/3"></div>
                                    </div>
                                    <div className="h-6 bg-surface-secondary rounded-full w-24"></div>
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <div className="h-4 bg-surface-secondary rounded w-20"></div>
                                    <div className="h-4 bg-surface-secondary rounded w-20"></div>
                                    <div className="h-4 bg-surface-secondary rounded w-24"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20">
                        <EmojiIcon emoji="💼" size=48 className="text-6xl mb-4" />
                        <h3 className="text-xl font-black text-ink-primary mb-2">No jobs found</h3>
                        <p className="text-ink-tertiary mb-6">
                            {searchQuery || filter !== 'all' ? 'No jobs match your filters.' : 'Be the first to post a job on the island!'}
                        </p>
                        <Link
                            href="/community/jobs/post"
                            className="inline-block px-8 py-4 bg-accent-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                        >
                            Post a Job
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map(job => (
                            <div key={job.id} className="bg-surface-elevated rounded-2xl p-6 border border-border-primary hover:shadow-xl hover:shadow-teal-500/10 transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-accent-500/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent-500/25 transition-colors">
                                            <Building size={24} className="text-accent-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-ink-primary text-lg group-hover:text-accent-400 transition-colors">{job.title}</h3>
                                            <p className="text-sm text-ink-tertiary flex items-center gap-1">
                                                <Briefcase size={12} />
                                                {job.company}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${TYPE_BADGES[job.job_type] || 'bg-surface-secondary text-ink-tertiary'}`}>
                                        {job.job_type}
                                    </span>
                                </div>
                                {job.description && (
                                    <p className="text-sm text-ink-tertiary mt-3 line-clamp-2">{job.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    <span className="flex items-center gap-1 text-sm text-ink-tertiary">
                                        <MapPin size={14} />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-ink-tertiary">
                                        <DollarSign size={14} />
                                        {formatSalary(job)}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-ink-tertiary">
                                        <Clock size={14} />
                                        {timeAgo(job.posted_date)}
                                    </span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border-primary flex justify-end">
                                    <button
                                        onClick={() => handleApply(job.id)}
                                        className="px-6 py-3 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
