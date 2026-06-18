'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import toast from '@/lib/toast';
import { compressImage } from '@/lib/image-compress';

interface TicketTierForm {
  name: string;
  price: string;
  quantity: string;
  description: string;
  perks: string;
}

const CATEGORIES = [
  { value: 'music', label: '🎵 Music & Concerts' },
  { value: 'food', label: '🍽️ Food & Drink' },
  { value: 'sports', label: '⚽ Sports & Fitness' },
  { value: 'arts', label: '🎨 Arts & Culture' },
  { value: 'business', label: '💼 Business & Networking' },
  { value: 'community', label: '🤝 Community' },
  { value: 'festival', label: '🎪 Festivals' },
  { value: 'workshop', label: '🔧 Workshops' },
];

const emptyTier = (): TicketTierForm => ({ name: '', price: '', quantity: '', description: '', perks: '' });

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // Event details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('22:00');
  const [category, setCategory] = useState('music');
  const [totalCapacity, setTotalCapacity] = useState('100');

  // Image uploads
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Ticket tiers
  const [tiers, setTiers] = useState<TicketTierForm[]>([emptyTier()]);

  const addTier = () => setTiers([...tiers, emptyTier()]);
  const removeTier = (idx: number) => setTiers(tiers.filter((_, i) => i !== idx));
  const updateTier = (idx: number, field: string, value: string) => {
    const updated = [...tiers];
    updated[idx] = { ...updated[idx], [field]: value };
    setTiers(updated);
  };

  // ── Image Upload Handlers ──

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerImageFile(file);
    setBannerImagePreview(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 800, quality: 0.8 });
    const formData = new FormData();
    formData.append('image', compressed);
    const res = await api.post('/uploads/asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url as string;
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Event title is required'); return; }
    if (!venue.trim()) { toast.error('Venue is required'); return; }
    if (!startDate) { toast.error('Start date is required'); return; }

    const validTiers = tiers.filter(t => t.name.trim() && t.price && t.quantity);
    if (validTiers.length === 0) { toast.error('Add at least one ticket tier'); return; }

    setSaving(true);
    try {
      // Upload images first
      let coverUrl = coverImageUrl;
      let bannerUrl = bannerImageUrl;

      if (coverImageFile) {
        setUploadingCover(true);
        coverUrl = await uploadFile(coverImageFile);
        setCoverImageUrl(coverUrl);
        setUploadingCover(false);
      }

      if (bannerImageFile) {
        setUploadingBanner(true);
        bannerUrl = await uploadFile(bannerImageFile);
        setBannerImageUrl(bannerUrl);
        setUploadingBanner(false);
      }

      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = endDate ? `${endDate}T${endTime}:00` : null;

      const ticketTiers = validTiers.map(t => ({
        name: t.name.trim(),
        price: parseFloat(t.price) || 0,
        quantity: parseInt(t.quantity) || 0,
        description: t.description.trim(),
        perks: t.perks.split(',').map(p => p.trim()).filter(Boolean),
      }));

      const res = await api.post('/events', {
        title: title.trim(),
        description: description.trim(),
        venue: venue.trim(),
        address: address.trim(),
        start_date: startDateTime,
        end_date: endDateTime,
        category,
        image_url: coverUrl,
        banner_url: bannerUrl,
        total_capacity: parseInt(totalCapacity) || 100,
        ticket_tiers: ticketTiers,
      });

      toast.success('Event created successfully!');
      router.push(`/events/${res.data.event_id || res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    } finally {
      setSaving(false);
      setUploadingCover(false);
      setUploadingBanner(false);
    }
  };

  const uploading = uploadingCover || uploadingBanner || saving;

  // Step validation
  const canProceedStep1 = title.trim() && venue.trim() && startDate;
  const canProceedStep2 = tiers.filter(t => t.name.trim() && t.price && t.quantity).length > 0;

  const goToStep = (targetStep: number) => {
    if (uploading) return;
    // Validate current step before advancing
    if (step === 1 && targetStep > 1 && !canProceedStep1) {
      toast.error('Please fill in Title, Venue, and Start Date');
      return;
    }
    if (step === 2 && targetStep > 2 && !canProceedStep2) {
      toast.error('Add at least one ticket tier with name, price, and quantity');
      return;
    }
    setStep(targetStep);
  };

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-ocean-900">
      
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <button onClick={() => router.back()} className="text-teal-200 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-3xl font-black">Create Event</h1>
          <p className="text-teal-200 mt-2">Set up your event with ticketed entry</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              onClick={() => goToStep(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                step === s
                  ? 'bg-teal-600 text-white'
                  : step > s
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                    : 'bg-surface-secondary dark:bg-ocean-800 text-ink-tertiary'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === s ? 'bg-surface-elevated text-teal-600' : step > s ? 'bg-teal-600 text-white' : 'bg-surface-tertiary dark:bg-ocean-700'
              }`}>{step > s ? '✓' : s}</span>
              {s === 1 ? 'Details' : s === 2 ? 'Tickets' : 'Review'}
            </button>
          ))}
        </div>

        
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-6 border border-border-primary dark:border-ocean-700 space-y-5">
              <h2 className="text-lg font-black text-ink-primary dark:text-sand-50">Event Details</h2>

              <div>
                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Event Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Caribbean Music Festival 2026"
                  className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Tell people what your event is about..." rows={4}
                  className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Total Capacity</label>
                  <input type="number" value={totalCapacity} onChange={e => setTotalCapacity(e.target.value)} min="1"
                    className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Venue *</label>
                <input type="text" value={venue} onChange={e => setVenue(e.target.value)}
                  placeholder="e.g. Warner Park Sporting Complex"
                  className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Basseterre, St. Kitts"
                  className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-1">End Time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                </div>
              </div>

              
              <div className="border-t border-border-primary dark:border-ocean-700 pt-5">
                <h3 className="text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-3">Event Images</h3>

                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-ink-tertiary mb-1">Cover Image</label>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                  {coverImagePreview ? (
                    <div className="relative">
                      <img src={coverImagePreview} alt="Cover" className="w-full h-48 object-cover rounded-xl" />
                      <button onClick={() => { setCoverImageFile(null); setCoverImagePreview(''); setCoverImageUrl(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => coverInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-border-primary dark:border-ocean-600 rounded-xl flex flex-col items-center justify-center text-ink-tertiary hover:border-teal-400 hover:text-teal-500 transition-colors">
                      <span className="text-3xl mb-2">📷</span>
                      <span className="font-bold text-sm">Upload Cover Image</span>
                      <span className="text-xs mt-1">Recommended: 1200×800px</span>
                    </button>
                  )}
                </div>

                
                <div>
                  <label className="block text-xs font-bold text-ink-tertiary mb-1">Banner Image</label>
                  <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerSelect} className="hidden" />
                  {bannerImagePreview ? (
                    <div className="relative">
                      <img src={bannerImagePreview} alt="Banner" className="w-full h-32 object-cover rounded-xl" />
                      <button onClick={() => { setBannerImageFile(null); setBannerImagePreview(''); setBannerImageUrl(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => bannerInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-border-primary dark:border-ocean-600 rounded-xl flex flex-col items-center justify-center text-ink-tertiary hover:border-teal-400 hover:text-teal-500 transition-colors">
                      <span className="text-2xl mb-1">🖼️</span>
                      <span className="font-bold text-sm">Upload Banner Image</span>
                      <span className="text-xs mt-1">Recommended: 1920×600px</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button onClick={() => goToStep(2)}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
              Next: Ticket Tiers →
            </button>
          </div>
        )}

        
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              {tiers.map((tier, idx) => (
                <div key={idx} className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-6 border border-border-primary dark:border-ocean-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-ink-primary dark:text-sand-50">Tier {idx + 1}</h3>
                    {tiers.length > 1 && (
                      <button onClick={() => removeTier(idx)} className="text-red-500 text-sm font-bold hover:text-red-600">✕ Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-tertiary mb-1">Tier Name *</label>
                      <input type="text" value={tier.name} onChange={e => updateTier(idx, 'name', e.target.value)}
                        placeholder="e.g. General Admission"
                        className="w-full px-3 py-2.5 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-tertiary mb-1">Price (XCD) *</label>
                      <input type="number" value={tier.price} onChange={e => updateTier(idx, 'price', e.target.value)}
                        placeholder="75.00" min="0" step="0.01"
                        className="w-full px-3 py-2.5 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-tertiary mb-1">Quantity *</label>
                      <input type="number" value={tier.quantity} onChange={e => updateTier(idx, 'quantity', e.target.value)}
                        placeholder="100" min="1"
                        className="w-full px-3 py-2.5 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-tertiary mb-1">Description</label>
                      <input type="text" value={tier.description} onChange={e => updateTier(idx, 'description', e.target.value)}
                        placeholder="Access to all general areas"
                        className="w-full px-3 py-2.5 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-tertiary mb-1">Perks (comma-separated)</label>
                      <input type="text" value={tier.perks} onChange={e => updateTier(idx, 'perks', e.target.value)}
                        placeholder="VIP lounge, Free drinks, Meet & greet"
                        className="w-full px-3 py-2.5 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-sand-50" />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-surface-primary dark:bg-ocean-900 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-ink-primary dark:text-sand-50">{tier.name || 'Unnamed Tier'}</span>
                      {tier.description && <span className="text-xs text-ink-tertiary ml-2">— {tier.description}</span>}
                    </div>
                    <span className="font-black text-teal-600 dark:text-teal-400">${tier.price || '0'} XCD</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addTier}
              className="w-full py-3 border-2 border-dashed border-border-primary dark:border-ocean-600 text-ink-tertiary dark:text-ink-tertiary rounded-xl font-bold hover:border-teal-400 hover:text-teal-600 transition-colors">
              + Add Another Tier
            </button>

            <div className="flex gap-3">
              <button onClick={() => goToStep(1)}
                className="flex-1 py-3 bg-surface-secondary dark:bg-ocean-800 text-ink-secondary dark:text-ink-tertiary rounded-xl font-bold hover:bg-surface-tertiary dark:hover:bg-ocean-700 transition-colors">
                ← Back
              </button>
              <button onClick={() => goToStep(3)}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
                Review →
              </button>
            </div>
          </div>
        )}

        
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-6 border border-border-primary dark:border-ocean-700 space-y-5">
              <h2 className="text-lg font-black text-ink-primary dark:text-sand-50">Review & Publish</h2>

              
              {(coverImagePreview || bannerImagePreview) && (
                <div className="space-y-2">
                  {coverImagePreview && (
                    <div>
                      <span className="text-xs font-bold text-ink-tertiary">Cover</span>
                      <img src={coverImagePreview} alt="Cover" className="w-full h-32 object-cover rounded-lg mt-1" />
                    </div>
                  )}
                  {bannerImagePreview && (
                    <div>
                      <span className="text-xs font-bold text-ink-tertiary">Banner</span>
                      <img src={bannerImagePreview} alt="Banner" className="w-full h-20 object-cover rounded-lg mt-1" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Title</span>
                  <span className="font-bold text-ink-primary dark:text-sand-50">{title || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Category</span>
                  <span className="font-bold text-ink-primary dark:text-sand-50">{CATEGORIES.find(c => c.value === category)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Venue</span>
                  <span className="font-bold text-ink-primary dark:text-sand-50">{venue || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Start</span>
                  <span className="font-bold text-ink-primary dark:text-sand-50">{startDate ? `${startDate} at ${startTime}` : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">End</span>
                  <span className="font-bold text-ink-primary dark:text-sand-50">{endDate ? `${endDate} at ${endTime}` : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Capacity</span>
                  <span className="font-bold text-ink-primary dark:text-sand-50">{totalCapacity}</span>
                </div>
              </div>

              <div className="border-t border-border-primary dark:border-ocean-700 pt-4">
                <h3 className="font-bold text-sm text-ink-secondary dark:text-ink-tertiary mb-3">Ticket Tiers ({tiers.filter(t => t.name.trim()).length})</h3>
                <div className="space-y-2">
                  {tiers.filter(t => t.name.trim()).map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-surface-primary dark:bg-ocean-900 rounded-lg">
                      <div>
                        <span className="font-bold text-sm text-ink-primary dark:text-sand-50">{tier.name}</span>
                        <span className="text-xs text-ink-tertiary ml-2">× {tier.quantity} tickets</span>
                      </div>
                      <span className="font-black text-teal-600 dark:text-teal-400">${tier.price} XCD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border-primary dark:border-ocean-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Projected Revenue (if sold out)</span>
                  <span className="font-black text-green-600 text-lg">
                    ${tiers.filter(t => t.name.trim()).reduce((sum, t) => sum + (parseFloat(t.price) || 0) * (parseInt(t.quantity) || 0), 0).toLocaleString()} XCD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToStep(2)}
                className="flex-1 py-3 bg-surface-secondary dark:bg-ocean-800 text-ink-secondary dark:text-ink-tertiary rounded-xl font-bold hover:bg-surface-tertiary dark:hover:bg-ocean-700 transition-colors">
                ← Edit Tickets
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50">
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadingCover ? 'Uploading cover...' : uploadingBanner ? 'Uploading banner...' : 'Publishing...'}
                  </span>
                ) : '🎉 Publish Event'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
