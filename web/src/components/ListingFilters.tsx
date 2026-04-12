'use client';

import React, { useState } from 'react';
import { CategoryConfig, FilterSection } from '@/lib/filterConfig';

interface ListingFiltersProps {
    config: CategoryConfig;
    filters: any;
    setFilters: (filters: any) => void;
    onClose?: () => void; // For mobile drawer
}

export default function ListingFilters({ config, filters, setFilters, onClose }: ListingFiltersProps) {
    if (!config || !config.filters) return null;

    const handleChange = (id: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [id]: value }));
    };

    const renderFilter = (section: FilterSection) => {
        switch (section.type) {
            case 'select':
                return (
                    <select
                        value={filters[section.id] || ''}
                        onChange={(e) => handleChange(section.id, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                    >
                        {section.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );
            case 'range':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters[`min_${section.id}`] || ''}
                            onChange={(e) => handleChange(`min_${section.id}`, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters[`max_${section.id}`] || ''}
                            onChange={(e) => handleChange(`max_${section.id}`, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {section.options?.map(opt => (
                            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="radio"
                                        name={section.id}
                                        value={opt.value}
                                        checked={filters[section.id] === opt.value}
                                        onChange={(e) => handleChange(section.id, e.target.value)}
                                        className="w-4 h-4 border-2 border-slate-300 text-teal-600 focus:ring-teal-500 rounded-full transition-all group-hover:border-teal-400"
                                    />
                                </div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                        <input
                            type="checkbox"
                            checked={!!filters[section.id]}
                            onChange={(e) => handleChange(section.id, e.target.checked)}
                            className="w-5 h-5 border-2 border-slate-300 rounded-lg text-teal-600 focus:ring-teal-500 transition-all checked:bg-teal-500 checked:border-teal-500"
                        />
                        <span className="text-sm font-bold text-slate-700">{section.label}</span>
                    </label>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center lg:hidden mb-4">
                <h3 className="font-black text-xl text-slate-900">Filters</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="hidden lg:block">
                <h3 className="font-black text-lg text-slate-900 mb-4">Filters</h3>
            </div>

            {config.filters.map(section => (
                <div key={section.id} className="space-y-2">
                    {section.type !== 'checkbox' && (
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                            {section.label}
                        </label>
                    )}
                    {renderFilter(section)}
                </div>
            ))}

            <button
                onClick={() => {
                    const resetFilters = config.filters.reduce((acc: any, curr) => {
                        if (curr.type === 'range') {
                            acc[`min_${curr.id}`] = '';
                            acc[`max_${curr.id}`] = '';
                        } else {
                            acc[curr.id] = '';
                        }
                        return acc;
                    }, {});
                    setFilters(resetFilters);
                }}
                className="w-full py-3 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-all border border-teal-100"
            >
                Clear All Filters
            </button>
        </div>
    );
}
