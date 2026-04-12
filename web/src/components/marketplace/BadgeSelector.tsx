import React from 'react';

interface BadgeSelectorProps {
    selectedBadges: string[];
    onChange: (badges: string[]) => void;
    readonly?: boolean;
}

const AVAILABLE_BADGES = [
    { id: 'verified', label: 'Verified', emoji: '✅', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'premium', label: 'Premium', emoji: '💎', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'eco', label: 'Eco-Friendly', emoji: '🌱', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'local', label: 'Local Business', emoji: '🏝️', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { id: 'top_rated', label: 'Top Rated', emoji: '⭐', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 'fast_response', label: 'Fast Response', emoji: '⚡', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'secure', label: 'Secure', emoji: '🔒', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'popular', label: 'Popular', emoji: '🔥', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function BadgeSelector({ selectedBadges = [], onChange, readonly = false }: BadgeSelectorProps) {

    const toggleBadge = (id: string) => {
        if (readonly) return;
        if (selectedBadges.includes(id)) {
            onChange(selectedBadges.filter(b => b !== id));
        } else {
            onChange([...selectedBadges, id]);
        }
    };

    return (
        <div className="space-y-4">
            {!readonly && <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select Badges ({selectedBadges.length})</p>}
            <div className="flex flex-wrap gap-3">
                {AVAILABLE_BADGES.map(badge => {
                    const isSelected = selectedBadges.includes(badge.id);
                    return (
                        <button
                            key={badge.id}
                            onClick={(e) => { e.preventDefault(); toggleBadge(badge.id); }}
                            disabled={readonly}
                            className={`
                                group relative px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2
                                ${isSelected
                                    ? `${badge.color} shadow-sm scale-105`
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 grayscale hover:grayscale-0'
                                }
                                ${readonly ? 'cursor-default pointer-events-none' : 'cursor-pointer active:scale-95'}
                            `}
                        >
                            <span className="text-lg">{badge.emoji}</span>
                            <span className={`font-bold text-xs uppercase tracking-wider ${isSelected ? '' : 'text-slate-500'}`}>
                                {badge.label}
                            </span>
                            {isSelected && !readonly && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Helper to render badge list cleanly elsewhere
export function BadgeList({ badges = [] }: { badges: string[] }) {
    if (!badges || badges.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {badges.map(id => {
                const badge = AVAILABLE_BADGES.find(b => b.id === id);
                if (!badge) return null;
                return (
                    <span
                        key={id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${badge.color}`}
                    >
                        <span>{badge.emoji}</span>
                        {badge.label}
                    </span>
                );
            })}
        </div>
    );
}
