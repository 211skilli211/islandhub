import React from 'react';

interface FilterControlsProps {
    filters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
    config: Record<string, { label: string; options: { label: string; value: string }[] }>;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, config }) => {
    const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters };
        if (value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        onFilterChange(newFilters);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(config).map(([key, setting]) => (
                <div key={key} className="relative">
                    <select
                        value={filters[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="">{setting.label}: All</option>
                        {setting.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FilterControls;
