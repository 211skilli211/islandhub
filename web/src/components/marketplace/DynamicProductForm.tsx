'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface DynamicProductFormProps {
    subtypeId: number;
    metadata: any;
    onChange: (metadata: any) => void;
}

interface FormFieldConfig {
    id: number;
    field_key: string;
    field_label: string;
    field_type: string; // text, number, select, multiselect, textarea, boolean, date
    required: boolean;
    options: { label: string; value: string }[] | null;
    placeholder: string;
    helper_text: string;
    display_order: number;
}

export default function DynamicProductForm({ subtypeId, metadata, onChange }: DynamicProductFormProps) {
    const [fields, setFields] = useState<FormFieldConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!subtypeId) {
            setFields([]);
            return;
        }

        const fetchConfig = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/api/categories/subtypes/${subtypeId}/form-config`);
                // Backend returns { subtype, fields } - correct data access
                if (res.data && res.data.fields) {
                    setFields(res.data.fields);
                } else if (Array.isArray(res.data)) {
                    setFields(res.data);
                } else {
                    setFields([]);
                }
            } catch (err) {
                console.error('Failed to fetch form config', err);
                setError('Failed to load category-specific fields.');
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [subtypeId]);

    const renderField = (field: FormFieldConfig) => {
        const value = metadata[field.field_key] || '';

        const handleChange = (val: any) => {
            onChange({ ...metadata, [field.field_key]: val });
        };

        switch (field.field_type) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={field.field_type}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleChange(field.field_type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                        required={field.required}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        rows={3}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                        required={field.required}
                    />
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-bold text-slate-900 appearance-none"
                        required={field.required}
                    >
                        <option value="">Select Option</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );
            case 'multiselect':
                const selected = Array.isArray(value) ? value : [];
                const toggle = (val: string) => {
                    if (selected.includes(val)) {
                        handleChange(selected.filter((v: string) => v !== val));
                    } else {
                        handleChange([...selected, val]);
                    }
                };
                return (
                    <div className="flex flex-wrap gap-2">
                        {field.options?.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => toggle(opt.value)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${selected.includes(opt.value) ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div
                        className="flex items-center gap-4 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-teal-100 transition-all"
                        onClick={() => handleChange(!value)}
                    >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${value ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                            {value && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="font-bold text-slate-700">{field.placeholder || (value ? 'Yes' : 'No')}</span>
                    </div>
                );
            case 'boolean':
                return (
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => handleChange(!value)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-teal-500' : 'bg-slate-200'}`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`}
                            />
                        </button>
                        <span className="font-bold text-slate-700">{value ? 'Yes' : 'No'}</span>
                    </div>
                );
            case 'date':
            case 'time':
                return (
                    <input
                        type={field.field_type}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                        required={field.required}
                    />
                );
            case 'price':
                return (
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={value}
                            onChange={(e) => handleChange(parseFloat(e.target.value))}
                            className="w-full pl-10 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                            required={field.required}
                        />
                    </div>
                );
            case 'location':
                return (
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">📍</span>
                        <input
                            type="text"
                            placeholder={field.placeholder || "Enter address..."}
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                            required={field.required}
                        />
                    </div>
                );
            case 'file':
                return (
                    <div className="relative group">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleChange(file.name); // Placeholder for actual upload
                            }}
                        />
                        <div className="w-full px-8 py-5 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center group-hover:border-teal-400 group-hover:bg-teal-50/30 transition-all">
                            <div className="text-2xl mb-2">📁</div>
                            <p className="text-slate-400 font-bold text-sm">
                                {value || 'Click to upload or drag & drop'}
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse"></div>
                <div className="h-12 bg-slate-50 rounded-2xl animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-12 bg-slate-50 rounded-2xl animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-rose-500 font-bold p-4 bg-rose-50 rounded-xl">{error}</div>;
    }

    if (fields.length === 0) {
        return (
            <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold">Standard product details will be used.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50"
        >
            <div className="flex items-center gap-4 mb-2">
                <div className="w-2 h-8 bg-teal-500 rounded-full" />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Category Specifics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {fields.map((field) => (
                    <div key={field.id} className={`space-y-2 ${field.field_type === 'textarea' || field.field_type === 'multiselect' ? 'md:col-span-2' : ''}`}>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">
                            {field.field_label} {field.required && <span className="text-rose-400">*</span>}
                        </label>
                        {renderField(field)}
                        {field.helper_text && <p className="text-xs text-slate-400 ml-2 font-medium">{field.helper_text}</p>}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
