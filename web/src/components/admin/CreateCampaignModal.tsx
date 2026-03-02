'use client';
import React, { useState } from 'react';
import api from '@/lib/api';

interface CreateCampaignModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCampaignModal({ onClose, onSuccess }: CreateCampaignModalProps) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        goal_amount: '',
        category: 'Community',
        end_date: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Explicitly use the endpoint for creating campaigns
            await api.post('/campaigns', form);
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--bg-primary)] rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in" style={{ boxShadow: 'var(--shadow)' }}>
                <h2 className="text-2xl font-black mb-6 text-[var(--text-primary)]">Start New Campaign</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        placeholder="Campaign Title"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-xl border-2 border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent)] font-bold text-[var(--text-primary)]"
                        required
                    />
                    <textarea
                        placeholder="Description..."
                        rows={3}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-xl border-2 border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent)] font-medium text-[var(--text-primary)]"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Goal Amount ($)"
                            type="number"
                            value={form.goal_amount}
                            onChange={e => setForm({ ...form, goal_amount: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-xl border-2 border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent)] font-bold text-[var(--text-primary)]"
                            required
                        />
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={e => setForm({ ...form, end_date: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-xl border-2 border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent)] font-bold text-[var(--text-primary)]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[var(--text-muted)] px-1">Category</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-xl border-2 border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent)] font-bold text-[var(--text-primary)]"
                        >
                            <option value="Community">Community</option>
                            <option value="Environment">Environment</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-[var(--text-secondary)] font-bold">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl font-bold shadow-lg" style={{ boxShadow: 'var(--shadow)' }}>
                            {loading ? 'Launching...' : 'Launch Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
