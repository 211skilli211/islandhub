'use client';
import React, { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AddAssetModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddAssetModal({ onClose, onSuccess }: AddAssetModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Asset uploaded');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-black mb-6 text-slate-900">Upload New Asset</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-teal-500 transition-colors">
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="asset-upload"
                            accept="image/*"
                        />
                        <label htmlFor="asset-upload" className="cursor-pointer block">
                            <div className="text-4xl mb-2">📸</div>
                            <div className="font-bold text-slate-600">{file ? file.name : 'Select an image file'}</div>
                            <div className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP</div>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                        <button type="submit" disabled={loading || !file} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50">
                            {loading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
