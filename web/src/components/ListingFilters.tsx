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
                        className="w-full px-3 py-2 border border-border-primary rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-transparent bg-surface-elevated text-sm"
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
                            className="w-full px-3 py-2 border border-border-primary rounded-xl text-sm focus:ring-2 focus:ring-accent-400"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters[`max_${section.id}`] || ''}
                            onChange={(e) => handleChange(`max_${section.id}`, e.target.value)}
                            className="w-full px-3 py-2 border border-border-primary rounded-xl text-sm focus:ring-2 focus:ring-accent-400"
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
                                        className="w-4 h-4 border-2 border-border-primary text-accent-400 focus:ring-accent-400 rounded-full transition-all group-hover:border-teal-400"
                                    />
                                </div>
                                <span className="text-sm font-medium text-ink-secondary group-hover:text-ink-primary">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <label className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-border-primary cursor-pointer hover:bg-surface-elevated hover:shadow-sm transition-all">
                        <input
                            type="checkbox"
                            checked={!!filters[section.id]}
                            onChange={(e) => handleChange(section.id, e.target.checked)}
                            className="w-5 h-5 border-2 border-border-primary rounded-lg text-accent-400 focus:ring-accent-400 transition-all checked:bg-accent-500/100 checked:border-teal-500"
                        />
                        <span className="text-sm font-bold text-ink-secondary">{section.label}</span>
                    </label>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center lg:hidden mb-4">
                <h3 className="font-black text-xl text-ink-primary">Filters</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-surface-secondary rounded-full transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="hidden lg:block">
                <h3 className="font-black text-lg text-ink-primary mb-4">Filters</h3>
            </div>

            {config.filters.map(section => (
                <div key={section.id} className="space-y-2">
                    {section.type !== 'checkbox' && (
                        <label className="block text-xs font-black uppercase tracking-widest text-ink-tertiary">
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
                className="w-full py-3 text-sm font-bold text-accent-400 hover:bg-accent-500/10 rounded-xl transition-all border border-teal-100"
            >
                Clear All Filters
            </button>
        </div>
    );
}
