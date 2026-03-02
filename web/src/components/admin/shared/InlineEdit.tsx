import React, { useState, useEffect } from 'react';

interface InlineEditProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    placeholder?: string;
    className?: string;
    type?: string;
    renderView?: () => React.ReactNode;
}

export default function InlineEdit({ value, onSave, placeholder, className = '', type = 'text', renderView }: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = async () => {
        if (currentValue === value) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            await onSave(currentValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Inline edit failed', error);
            // Revert on failure?
            setCurrentValue(value);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 min-w-[120px]" onClick={e => e.stopPropagation()}>
                <input
                    type={type}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    disabled={loading}
                    placeholder={placeholder}
                    className={`w-full px-2 py-1 bg-white border border-teal-500 rounded text-xs font-medium outline-none shadow-sm ${loading ? 'opacity-50' : ''}`}
                />
                {loading && (
                    <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                // If the user selects text inside the view, don't trigger edit?
                // For now, let's allow explicit trigger via the icon usage if needed, but clicking the cell generally triggers edit.
                // If renderView contains specific interactive elements, they should stop propagation.
                setIsEditing(true);
            }}
            className={`cursor-pointer hover:bg-slate-50 px-1 -ml-1 rounded transition-colors group relative flex items-center gap-2 ${className}`}
        >
            <span className="truncate max-w-[150px]">
                {renderView ? renderView() : (value || <span className="text-slate-300 italic">None</span>)}
            </span>
            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-teal-500 font-black uppercase tracking-widest transition-opacity shrink-0">Edit</span>
        </div>
    );
}
