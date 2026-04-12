'use client';

import { Briefcase, Search } from 'lucide-react';

export default function JobsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Job Board</h1>
                    <p className="text-slate-500 dark:text-slate-400">Find jobs or post opportunities</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search jobs by title, company, or keyword..." 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Job Categories */}
            <div className="flex flex-wrap gap-2">
                {['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'].map((cat) => (
                    <button key={cat} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white transition-all">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
                {[
                    { title: 'Software Developer', company: 'Island Tech', type: 'Full-time', location: 'Remote', salary: '$60k - $80k' },
                    { title: 'Marketing Manager', company: 'Tropical Brand Co.', type: 'Full-time', location: 'Office', salary: '$50k - $70k' },
                    { title: 'Delivery Driver', company: 'Island Express', type: 'Part-time', location: 'Island-wide', salary: '$18/hr' },
                ].map((job, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{job.company}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full">{job.type}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.salary}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}