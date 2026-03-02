'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_SCHEMAS, FormField } from '@/lib/schemas';

interface DynamicFormProps {
    category: string;
    subType: string;
    metadata: any;
    onChange: (metadata: any) => void;
}

export default function DynamicForm({ category, subType, metadata, onChange }: DynamicFormProps) {
    const schema = CATEGORY_SCHEMAS[category]?.[subType];

    if (!schema) {
        return (
            <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold">Standard details will be used for this category.</p>
            </div>
        );
    }

    const renderInnerField = (field: FormField, currentMetadata: any, onFieldChange: (name: string, value: any) => void) => {
        const value = currentMetadata[field.name] || '';

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => onFieldChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                        required={field.required}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => onFieldChange(field.name, e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                        required={field.required}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => onFieldChange(field.name, e.target.value)}
                        rows={3}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-medium text-slate-900"
                        required={field.required}
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => onFieldChange(field.name, !value)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-teal-500' : 'bg-slate-200'}`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`}
                            />
                        </button>
                        <span className="font-bold text-slate-700">{value ? 'Yes' : 'No'}</span>
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => onFieldChange(field.name, e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 transition-all font-bold text-slate-900 appearance-none"
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
                        onFieldChange(field.name, selected.filter(v => v !== val));
                    } else {
                        onFieldChange(field.name, [...selected, val]);
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
            case 'repeatable_section':
                const items = Array.isArray(value) ? value : [];
                const addItem = () => onFieldChange(field.name, [...items, {}]);
                const removeItem = (index: number) => onFieldChange(field.name, items.filter((_, i) => i !== index));
                const updateItem = (index: number, itemData: any) => {
                    const newItems = [...items];
                    newItems[index] = itemData;
                    onFieldChange(field.name, newItems);
                };

                return (
                    <div className="space-y-6">
                        {items.map((item, index) => (
                            <div key={index} className="relative p-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors z-10 font-bold"
                                >
                                    ×
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {field.schema?.map(subField => (
                                        <div key={subField.name} className={subField.type === 'textarea' || subField.type === 'repeatable_section' || subField.type === 'multiselect' ? 'md:col-span-2' : ''}>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">
                                                {subField.label}
                                            </label>
                                            {renderInnerField(subField, item, (name, val) => updateItem(index, { ...item, [name]: val }))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addItem}
                            className="w-full py-5 border-2 border-dashed border-teal-200 text-teal-600 rounded-[2rem] font-black uppercase tracking-widest hover:bg-teal-50/50 hover:border-teal-400 transition-all flex items-center justify-center gap-2 group"
                        >
                            <span className="text-2xl group-hover:scale-125 transition-transform">+</span> Add {field.label} Item
                        </button>
                    </div>
                );

            case 'variant_manager':
                // Structure: [{ name: 'Size', values: ['S', 'M'] }, { name: 'Color', values: ['Red'] }]
                const variants = Array.isArray(value) ? value : [];
                const addVariantGroup = () => onFieldChange(field.name, [...variants, { name: '', values: '' }]);
                const removeVariantGroup = (idx: number) => onFieldChange(field.name, variants.filter((_, i) => i !== idx));
                const updateVariantGroup = (idx: number, key: string, val: string) => {
                    const newVars = [...variants];
                    newVars[idx] = { ...newVars[idx], [key]: val };
                    onFieldChange(field.name, newVars);
                };

                return (
                    <div className="space-y-4">
                        {variants.map((v, i) => (
                            <div key={i} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Option Name</label>
                                    <input
                                        placeholder="e.g. Size"
                                        value={v.name}
                                        onChange={e => updateVariantGroup(i, 'name', e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Values (comma separated)</label>
                                    <input
                                        placeholder="e.g. Small, Medium, Large"
                                        value={v.values}
                                        onChange={e => updateVariantGroup(i, 'values', e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <button type="button" onClick={() => removeVariantGroup(i)} className="mt-6 text-rose-400 hover:text-rose-600 font-bold">×</button>
                            </div>
                        ))}
                        <button type="button" onClick={addVariantGroup} className="text-xs font-black uppercase text-teal-600 bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100">+ Add Variant Option</button>
                    </div>
                );

            case 'calendar_builder':
                // Structure: { days: ['mon', 'wed'], start: '09:00', end: '17:00' }
                const schedule = value || { days: [], start: '09:00', end: '17:00' };
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const toggleDay = (d: string) => {
                    const currentDays = schedule.days || [];
                    const newDays = currentDays.includes(d) ? currentDays.filter((x: string) => x !== d) : [...currentDays, d];
                    onFieldChange(field.name, { ...schedule, days: newDays });
                };

                return (
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex justify-between gap-2 mb-6">
                            {days.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleDay(d)}
                                    className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all ${schedule.days?.includes(d) ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    {d.charAt(0)}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Start Time</label>
                                <input
                                    type="time"
                                    value={schedule.start}
                                    onChange={e => onFieldChange(field.name, { ...schedule, start: e.target.value })}
                                    className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400">End Time</label>
                                <input
                                    type="time"
                                    value={schedule.end}
                                    onChange={e => onFieldChange(field.name, { ...schedule, end: e.target.value })}
                                    className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'seasonal_rates':
                // Structure: [{ name: 'High Season', start: '', end: '', price: 0 }]
                const rates = Array.isArray(value) ? value : [];
                const addRate = () => onFieldChange(field.name, [...rates, {}]);
                const removeRate = (idx: number) => onFieldChange(field.name, rates.filter((_, i) => i !== idx));
                const updateRate = (idx: number, k: string, v: any) => {
                    const newRates = [...rates];
                    newRates[idx] = { ...newRates[idx], [k]: v };
                    onFieldChange(field.name, newRates);
                };

                return (
                    <div className="space-y-3">
                        {rates.map((r, i) => (
                            <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Season Name</label>
                                    <input placeholder="e.g. Christmas" value={r.name} onChange={e => updateRate(i, 'name', e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Price ($)</label>
                                    <input type="number" placeholder="0.00" value={r.price} onChange={e => updateRate(i, 'price', e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Start Date</label>
                                    <input type="date" value={r.start} onChange={e => updateRate(i, 'start', e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg text-sm font-bold" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">End Date</label>
                                        <input type="date" value={r.end} onChange={e => updateRate(i, 'end', e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg text-sm font-bold" />
                                    </div>
                                    <button type="button" onClick={() => removeRate(i)} className="text-rose-500 font-bold p-2">×</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addRate} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold uppercase text-xs hover:bg-blue-100 transition-colors">+ Add Seasonal Rate</button>
                    </div>
                );
            default:
                return null;
        }
    };

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
                {schema.fields.map((field) => (
                    <div key={field.name} className={`space-y-2 ${field.type === 'textarea' || field.type === 'multiselect' || field.type === 'repeatable_section' ? 'md:col-span-2' : ''}`}>
                        <label className="text-xs font-black uppercase tracking-[0.1em] text-slate-400 ml-2">
                            {field.label} {field.required && <span className="text-rose-400">*</span>}
                        </label>
                        {renderInnerField(field, metadata, (name, val) => onChange({ ...metadata, [name]: val }))}
                        {field.helperText && <p className="text-xs text-slate-400 ml-2 font-medium">{field.helperText}</p>}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
