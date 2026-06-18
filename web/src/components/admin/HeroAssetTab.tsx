'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MediaUploader from './MediaUploader';

interface HeroAsset {
  id: number;
  page_key: string;
  asset_url: string;
  asset_type: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  cta2_text: string;
  cta2_link: string;
  overlay_color: string;
  overlay_opacity: number;
  icon_url: string;
  layout_template: string;
  style_config: any;
  typography: any;
  branding_color: string;
  is_active: boolean;
}

const ASSET_TYPES = [
  { value: 'image', label: 'Image', emoji: '🖼️', desc: 'Static image background' },
  { value: 'video', label: 'Video', emoji: '🎬', desc: 'Video loop background' },
  { value: 'shader', label: 'Shader', emoji: '🌊', desc: 'WebGL animated shader' },
  { value: 'particle', label: 'Particles', emoji: '✨', desc: 'Canvas particle system' },
  { value: 'aurora', label: 'Aurora', emoji: '🌌', desc: 'ReactBits Aurora (WebGL)' },
  { value: 'color', label: 'Gradient', emoji: '🎨', desc: 'Solid/gradient color' },
];

const SHADER_PRESETS = [
  { value: 'ocean', label: 'Ocean', colors: ['#020617', '#0f172a', '#0e7490', '#fbbf24'] },
  { value: 'tropical', label: 'Tropical', colors: ['#064e3b', '#0f766e', '#14b8a6', '#fbbf24'] },
  { value: 'sunset', label: 'Sunset', colors: ['#1e1b4b', '#7c3aed', '#f97316', '#fbbf24'] },
  { value: 'midnight', label: 'Midnight', colors: ['#020617', '#1e293b', '#334155', '#64748b'] },
  { value: 'caribbean', label: 'Caribbean', colors: ['#0c4a6e', '#0369a1', '#0ea5e9', '#67e8f9'] },
];

const AURORA_PRESETS = [
  { value: 'teal', label: 'Teal', colors: ['#0f766e', '#14b8a6', '#065f46'] },
  { value: 'purple', label: 'Purple', colors: ['#5b21b6', '#7c3aed', '#4c1d95'] },
  { value: 'ocean', label: 'Ocean', colors: ['#0c4a6e', '#0284c7', '#075985'] },
  { value: 'sunset', label: 'Sunset', colors: ['#9a3412', '#ea580c', '#7c2d12'] },
  { value: 'emerald', label: 'Emerald', colors: ['#065f46', '#059669', '#047857'] },
  { value: 'midnight', label: 'Midnight', colors: ['#020617', '#1e1b4b', '#312e81'] },
];

const PARTICLE_PRESETS = [
  { value: 'tropical', label: 'Tropical', desc: 'Golden motes rising' },
  { value: 'ocean', label: 'Ocean', desc: 'Teal bubbles' },
  { value: 'aurora', label: 'Aurora', desc: 'Multi-color drift' },
  { value: 'fireflies', label: 'Fireflies', desc: 'Warm glowing dots' },
];

const LAYOUT_TEMPLATES = [
  { value: 'standard', label: 'Standard', desc: 'Full-width background with centered content' },
  { value: 'split', label: 'Split', desc: 'Side-by-side media and content' },
  { value: 'overlay', label: 'Overlay', desc: 'Content card over background' },
];

const PAGE_KEYS = [
  { value: 'home', label: 'Homepage' },
  { value: 'community', label: 'Community' },
  { value: 'hub', label: 'Hub Gateway' },
  { value: 'food', label: 'Food Hub' },
  { value: 'products', label: 'Products Hub' },
  { value: 'services', label: 'Services Hub' },
  { value: 'tours', label: 'Tours Hub' },
  { value: 'rentals', label: 'Rentals Hub' },
  { value: 'transport', label: 'Transport Hub' },
  { value: 'events', label: 'Events Hub' },
  { value: 'campaigns', label: 'Campaigns Hub' },
];

export default function HeroAssetTab() {
  const [assets, setAssets] = useState<HeroAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HeroAsset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<HeroAsset>>({
    page_key: 'home',
    asset_type: 'image',
    asset_url: '',
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    cta2_text: '',
    cta2_link: '',
    overlay_color: '#000000',
    overlay_opacity: 0.4,
    icon_url: '',
    layout_template: 'standard',
    style_config: {},
    typography: {},
    branding_color: '#14b8a6',
    is_active: true,
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hero-assets');
      setAssets(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditing(null);
    setForm({
      page_key: 'home',
      asset_type: 'image',
      asset_url: '',
      title: '',
      subtitle: '',
      cta_text: '',
      cta_link: '',
      overlay_color: '#000000',
      overlay_opacity: 0.4,
      layout_template: 'standard',
      style_config: {},
      typography: {},
      branding_color: '#14b8a6',
      is_active: true,
    });
  };

  const startEdit = (asset: HeroAsset) => {
    setEditing(asset);
    setIsCreating(false);
    setForm({ ...asset });
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsCreating(false);
  };

  const saveAsset = async () => {
    setSaving(true);
    try {
      await api.post('/admin/hero-assets', form);
      await fetchAssets();
      cancelEdit();
    } catch (e) {
      console.error('Failed to save hero asset:', e);
    }
    setSaving(false);
  };

  const deleteAsset = async (id: number, pageKey: string) => {
    if (!confirm('Delete this hero asset?')) return;
    try {
      await api.delete(`/admin/hero-assets/${pageKey}`);
      await fetchAssets();
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const updateStyleConfig = (key: string, value: any) => {
    setForm(prev => ({
      ...prev,
      style_config: { ...(prev.style_config || {}), [key]: value }
    }));
  };

  const activeAssets = assets.filter(a => a.is_active);
  const inactiveAssets = assets.filter(a => !a.is_active);

  if (loading) return <div className="text-ink-tertiary text-sm py-8 text-center">Loading hero assets...</div>;

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-tertiary">
          {activeAssets.length} active . {inactiveAssets.length} inactive
        </div>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600 transition-colors"
        >
          + New Hero Asset
        </button>
      </div>

      
      {(isCreating || editing) && (
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-ink-primary">
              {isCreating ? 'Create Hero Asset' : `Edit: ${editing?.page_key}`}
            </h3>
            <button onClick={cancelEdit} className="text-xs text-ink-tertiary hover:text-ink-primary">✕ Cancel</button>
          </div>

          
          <div className="rounded-xl border border-border-primary overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-border-primary">
              <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Live Preview — {form.page_key || 'home'}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateStyleConfig('previewMode', 'desktop')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${form.style_config?.previewMode !== 'mobile' ? 'bg-accent-500 text-white' : 'bg-surface-tertiary text-ink-tertiary'}`}
                >Desktop</button>
                <button
                  onClick={() => updateStyleConfig('previewMode', 'mobile')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${form.style_config?.previewMode === 'mobile' ? 'bg-accent-500 text-white' : 'bg-surface-tertiary text-ink-tertiary'}`}
                >Mobile</button>
              </div>
            </div>
            <div className={`relative ${form.style_config?.previewMode === 'mobile' ? 'mx-auto max-w-[375px]' : ''}`} style={{ minHeight: '250px' }}>
              
              <div className="absolute inset-0 overflow-hidden">
                {form.asset_type === 'shader' && (
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${(form.style_config?.shaderPreset === 'caribbean' ? ['#0c4a6e', '#0369a1', '#0ea5e9', '#67e8f9'] :
                      form.style_config?.shaderPreset === 'tropical' ? ['#064e3b', '#0f766e', '#14b8a6', '#fbbf24'] :
                      form.style_config?.shaderPreset === 'sunset' ? ['#1e1b4b', '#7c3aed', '#f97316', '#fbbf24'] :
                      form.style_config?.shaderPreset === 'midnight' ? ['#020617', '#1e293b', '#334155', '#64748b'] :
                      ['#020617', '#0f172a', '#0e7490', '#fbbf24']).join(', ')})`
                  }} />
                )}
                {form.asset_type === 'aurora' && (
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${(form.style_config?.auroraPreset === 'purple' ? ['#5b21b6', '#7c3aed', '#4c1d95'] :
                      form.style_config?.auroraPreset === 'ocean' ? ['#0c4a6e', '#0284c7', '#075985'] :
                      form.style_config?.auroraPreset === 'sunset' ? ['#9a3412', '#ea580c', '#7c2d12'] :
                      form.style_config?.auroraPreset === 'emerald' ? ['#065f46', '#059669', '#047857'] :
                      form.style_config?.auroraPreset === 'midnight' ? ['#020617', '#1e1b4b', '#312e81'] :
                      ['#0f766e', '#14b8a6', '#065f46']).join(', ')})`,
                    opacity: form.style_config?.auroraBlend || 0.8
                  }} />
                )}
                {form.asset_type === 'particle' && (
                  <div className="absolute inset-0 bg-[#0a0f1a]">
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.6) 1px, transparent 1px)',
                      backgroundSize: `${20 + (form.style_config?.particleSpeed || 1) * 5}px ${20 + (form.style_config?.particleSpeed || 1) * 5}px`
                    }} />
                  </div>
                )}
                {form.asset_type === 'color' && (
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${form.style_config?.bgColor || '#0f766e'}, ${form.style_config?.bgColorEnd || '#14b8a6'})`
                  }} />
                )}
                {(form.asset_type === 'image' || form.asset_type === 'video') && form.asset_url && (
                  <img src={form.asset_url} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                {!form.asset_url && form.asset_type === 'image' && (
                  <div className="absolute inset-0 bg-surface-tertiary flex items-center justify-center text-ink-tertiary text-xs">No image URL</div>
                )}
              </div>
              
              {form.style_config?.showOverlay !== false && (
                <div className="absolute inset-0" style={{
                  backgroundColor: form.overlay_color || '#000000',
                  opacity: form.overlay_opacity || 0.4
                }} />
              )}
              
              <div className={`relative z-10 flex items-center justify-center p-6 min-h-[250px] ${
                form.layout_template === 'split' ? 'items-center' : 'items-center justify-center'
              }`}>
                <div className={`${
                  form.layout_template === 'overlay' ? 'bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-6 max-w-md text-center' :
                  form.layout_template === 'split' ? 'w-1/2 pr-8 text-left' : 'text-center max-w-2xl'
                }`}>
                  {form.title && (
                    <h2 className="text-lg md:text-2xl font-black text-white drop-shadow-md mb-3">
                      {form.title}
                    </h2>
                  )}
                  {form.subtitle && (
                    <p className="text-xs md:text-sm text-white/80 drop-shadow-sm mb-4">
                      {form.subtitle}
                    </p>
                  )}
                  {form.cta_text && (
                    <span className="inline-block px-5 py-2 text-white text-[10px] font-bold rounded-xl shadow-lg" style={{ backgroundColor: form.branding_color || '#14b8a6' }}>
                      {form.cta_text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Page</label>
              <select
                value={form.page_key || 'home'}
                onChange={e => setForm(prev => ({ ...prev, page_key: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm text-ink-primary border border-border-primary"
              >
                {PAGE_KEYS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Active</label>
              <div className="mt-2">
                <button
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${form.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-secondary text-ink-tertiary'}`}
                >
                  {form.is_active ? '● Active' : '○ Inactive'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Layout</label>
              <select
                value={form.layout_template || 'standard'}
                onChange={e => setForm(prev => ({ ...prev, layout_template: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm text-ink-primary border border-border-primary"
              >
                {LAYOUT_TEMPLATES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <p className="text-[9px] text-ink-tertiary mt-0.5">{LAYOUT_TEMPLATES.find(l => l.value === form.layout_template)?.desc}</p>
            </div>
          </div>

          
          <div>
            <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Background Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              {ASSET_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setForm(prev => ({ ...prev, asset_type: type.value }))}
                  className={`p-3 rounded-xl text-center transition-all ${form.asset_type === type.value
                    ? 'bg-accent-500/10 border-2 border-accent-500 text-accent-500'
                    : 'bg-surface-secondary border-2 border-transparent text-ink-secondary hover:border-border-primary'
                    }`}
                >
                  <span className="text-xl block">{type.emoji}</span>
                  <span className="text-[10px] font-bold block mt-1">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          
          {(form.asset_type === 'image' || form.asset_type === 'video') && (
            <MediaUploader
              value={form.asset_url || ''}
              onChange={(url) => setForm(prev => ({ ...prev, asset_url: url }))}
              accept={form.asset_type === 'video' ? 'video' : 'image'}
              label={form.asset_type === 'video' ? 'Video' : 'Image'}
            />
          )}

          
          {form.asset_type === 'shader' && (
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Shader Preset</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {SHADER_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => updateStyleConfig('shaderPreset', preset.value)}
                    className={`p-2 rounded-lg text-center text-[10px] font-bold transition-all ${form.style_config?.shaderPreset === preset.value
                      ? 'bg-accent-500/10 border-2 border-accent-500'
                      : 'bg-surface-secondary border-2 border-transparent hover:border-border-primary'
                      }`}
                  >
                    <div className="flex gap-0.5 justify-center mb-1">
                      {preset.colors.map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-[9px] text-ink-tertiary">Speed</label>
                  <input type="range" min="0.1" max="3" step="0.1" value={form.style_config?.shaderSpeed || 1}
                    onChange={e => updateStyleConfig('shaderSpeed', parseFloat(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-ink-tertiary">Intensity</label>
                  <input type="range" min="0.1" max="2" step="0.1" value={form.style_config?.shaderIntensity || 1}
                    onChange={e => updateStyleConfig('shaderIntensity', parseFloat(e.target.value))}
                    className="w-full" />
                </div>
              </div>
            </div>
          )}

          
          {form.asset_type === 'aurora' && (
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Aurora Preset (ReactBits)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                {AURORA_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => updateStyleConfig('auroraPreset', preset.value)}
                    className={`p-2 rounded-lg text-center text-[10px] font-bold transition-all ${form.style_config?.auroraPreset === preset.value
                      ? 'bg-accent-500/10 border-2 border-accent-500'
                      : 'bg-surface-secondary border-2 border-transparent hover:border-border-primary'
                      }`}
                  >
                    <div className="flex gap-0.5 justify-center mb-1">
                      {preset.colors.map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-[9px] text-ink-tertiary">Amplitude</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={form.style_config?.auroraAmplitude || 1.2}
                    onChange={e => updateStyleConfig('auroraAmplitude', parseFloat(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-ink-tertiary">Blend</label>
                  <input type="range" min="0.1" max="0.8" step="0.05" value={form.style_config?.auroraBlend || 0.35}
                    onChange={e => updateStyleConfig('auroraBlend', parseFloat(e.target.value))}
                    className="w-full" />
                </div>
              </div>
            </div>
          )}

          
          {form.asset_type === 'particle' && (
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Particle Theme</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {PARTICLE_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => updateStyleConfig('particleTheme', preset.value)}
                    className={`p-3 rounded-xl text-center transition-all ${form.style_config?.particleTheme === preset.value
                      ? 'bg-accent-500/10 border-2 border-accent-500'
                      : 'bg-surface-secondary border-2 border-transparent hover:border-border-primary'
                      }`}
                  >
                    <span className="text-xs font-bold block">{preset.label}</span>
                    <span className="text-[8px] text-ink-tertiary">{preset.desc}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-[9px] text-ink-tertiary">Count: {form.style_config?.particleCount || 80}</label>
                  <input type="range" min="20" max="200" step="10" value={form.style_config?.particleCount || 80}
                    onChange={e => updateStyleConfig('particleCount', parseInt(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-ink-tertiary">Speed</label>
                  <input type="range" min="0.1" max="3" step="0.1" value={form.style_config?.particleSpeed || 1}
                    onChange={e => updateStyleConfig('particleSpeed', parseFloat(e.target.value))}
                    className="w-full" />
                </div>
              </div>
            </div>
          )}

          
          {form.asset_type === 'color' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Background Color</label>
                <input type="color" value={form.style_config?.bgColor || '#0f766e'}
                  onChange={e => updateStyleConfig('bgColor', e.target.value)}
                  className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Gradient End</label>
                <input type="color" value={form.style_config?.bgColorEnd || '#14b8a6'}
                  onChange={e => updateStyleConfig('bgColorEnd', e.target.value)}
                  className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
              </div>
            </div>
          )}

          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Overlay Color</label>
              <input type="color" value={form.overlay_color || '#000000'}
                onChange={e => setForm(prev => ({ ...prev, overlay_color: e.target.value }))}
                className="w-full mt-1 h-8 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                Overlay Opacity: {Math.round((form.overlay_opacity || 0.4) * 100)}%
              </label>
              <input type="range" min="0" max="1" step="0.05" value={form.overlay_opacity || 0.4}
                onChange={e => setForm(prev => ({ ...prev, overlay_opacity: parseFloat(e.target.value) }))}
                className="w-full mt-2" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Branding Color</label>
              <input type="color" value={form.branding_color || '#14b8a6'}
                onChange={e => setForm(prev => ({ ...prev, branding_color: e.target.value }))}
                className="w-full mt-1 h-8 rounded-lg cursor-pointer" />
            </div>
          </div>

          
          <div className="border-t border-border-primary pt-4">
            <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-3">Content</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-ink-tertiary uppercase">Title</label>
                <input type="text" value={form.title || ''}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Hero heading..."
                  className="w-full mt-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm border border-border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-tertiary uppercase">Subtitle</label>
                <input type="text" value={form.subtitle || ''}
                  onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Supporting text..."
                  className="w-full mt-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm border border-border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-tertiary uppercase">CTA Text</label>
                <input type="text" value={form.cta_text || ''}
                  onChange={e => setForm(prev => ({ ...prev, cta_text: e.target.value }))}
                  placeholder="Shop Now"
                  className="w-full mt-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm border border-border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-tertiary uppercase">CTA Link</label>
                <input type="text" value={form.cta_link || ''}
                  onChange={e => setForm(prev => ({ ...prev, cta_link: e.target.value }))}
                  placeholder="/hub"
                  className="w-full mt-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm border border-border-primary" />
              </div>
            </div>
          </div>

          
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveAsset}
              disabled={saving}
              className="px-6 py-2.5 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isCreating ? 'Create Asset' : 'Save Changes'}
            </button>
            {editing && (
              <button
                onClick={() => deleteAsset(editing.id, editing.page_key)}
                className="px-4 py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            )}
            <button onClick={cancelEdit} className="px-4 py-2.5 text-ink-tertiary text-xs font-bold hover:text-ink-primary">
              Cancel
            </button>
          </div>
        </div>
      )}

      
      {activeAssets.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink-secondary uppercase tracking-wider mb-3">Active ({activeAssets.length})</h3>
          <div className="space-y-2">
            {activeAssets.map(asset => (
              <div key={asset.id} className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl border border-border-primary hover:border-accent-500/30 transition-colors">
                {asset.asset_url && asset.asset_type === 'image' && (
                  <img src={asset.asset_url} alt={asset.page_key} className="w-20 h-12 object-cover rounded-lg shrink-0" />
                )}
                {!asset.asset_url && (
                  <div className="w-20 h-12 rounded-lg shrink-0 flex items-center justify-center text-lg"
                    style={{ background: `linear-gradient(135deg, ${asset.branding_color || '#14b8a6'}33, ${asset.branding_color || '#14b8a6'}11)` }}>
                    {ASSET_TYPES.find(t => t.value === asset.asset_type)?.emoji || '🖼️'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-ink-primary text-sm">{asset.page_key}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">ACTIVE</span>
                  </div>
                  <p className="text-xs text-ink-tertiary truncate">
                    {ASSET_TYPES.find(t => t.value === asset.asset_type)?.label} . {asset.title || 'Untitled'}
                    {asset.style_config?.shaderPreset ? ` . ${asset.style_config.shaderPreset}` : ''}
                    {asset.style_config?.auroraPreset ? ` . ${asset.style_config.auroraPreset}` : ''}
                    {asset.style_config?.particleTheme ? ` . ${asset.style_config.particleTheme}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${asset.asset_type === 'video' ? 'bg-teal-100 text-teal-700' :
                    asset.asset_type === 'shader' ? 'bg-cyan-100 text-cyan-700' :
                    asset.asset_type === 'particle' ? 'bg-amber-100 text-amber-700' :
                    asset.asset_type === 'aurora' ? 'bg-violet-100 text-violet-700' :
                    asset.asset_type === 'color' ? 'bg-rose-100 text-rose-700' :
                    'bg-emerald-100 text-emerald-700'
                    }`}>
                    {asset.asset_type}
                  </span>
                  <button onClick={() => startEdit(asset)}
                    className="px-3 py-1.5 text-[10px] font-bold text-ink-secondary bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {inactiveAssets.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink-tertiary uppercase tracking-wider mb-3">Inactive ({inactiveAssets.length})</h3>
          <div className="space-y-2">
            {inactiveAssets.map(asset => (
              <div key={asset.id} className="flex items-center gap-4 p-3 bg-surface-secondary/50 rounded-xl border border-border-primary/50 opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-secondary text-xs">{asset.page_key}</p>
                  <p className="text-[10px] text-ink-tertiary">{asset.asset_type} . {asset.title || 'Untitled'}</p>
                </div>
                <button onClick={() => startEdit(asset)}
                  className="px-3 py-1 text-[10px] font-bold text-ink-secondary bg-surface-secondary rounded-lg hover:bg-surface-tertiary">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {assets.length === 0 && (
        <div className="text-center py-12 bg-surface-secondary/50 rounded-2xl border-2 border-dashed border-border-primary">
          <p className="text-3xl mb-3">🎨</p>
          <p className="text-sm font-bold text-ink-secondary">No hero assets configured</p>
          <p className="text-xs text-ink-tertiary mt-1">Create your first hero asset to customize page backgrounds</p>
          <button onClick={startCreate} className="mt-4 px-6 py-2.5 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600">
            + Create Hero Asset
          </button>
        </div>
      )}
    </div>
  );
}
