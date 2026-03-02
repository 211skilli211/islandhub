import React from 'react';
import { SortConfig } from '@/hooks/usePaginatedFetch';

interface SortControlsProps {
    sort: SortConfig;
    onSortChange: (sort: SortConfig) => void;
    options: { label: string; value: string }[];
}

const SortControls: React.FC<SortControlsProps> = ({ sort, onSortChange, options }) => {
    return (
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase ml-2 mr-1">Sort By</span>
            <select
                value={sort.sortBy}
                onChange={(e) => onSortChange({ ...sort, sortBy: e.target.value })}
                className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
                onClick={() => onSortChange({ ...sort, sortOrder: sort.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                title={`Current: ${sort.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
                {sort.sortOrder === 'asc' ? (
                    <span className="text-sm font-bold">↑ ASC</span>
                ) : (
                    <span className="text-sm font-bold">↓ DESC</span>
                )}
            </button>
        </div>
    );
};

export default SortControls;
