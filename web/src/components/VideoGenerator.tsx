'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play, Download, Share2, Copy, Check, Loader2, Film, Sparkles, Clock, ExternalLink } from 'lucide-react';

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  icon: string;
}

interface VideoResult {
  renderId: string;
  outputPath: string;
  fileSize: number;
  duration: number;
  url?: string;
}

interface ShareLink {
  platform: string;
  label: string;
  icon: string;
  url: string;
  color: string;
}

const TEMPLATES: VideoTemplate[] = [
  { id: 'product_showcase', name: 'Product Showcase', description: 'Ken Burns zoom on images with title overlay', duration: 15, icon: '🎬' },
  { id: 'service_explainer', name: 'Service Explainer', description: 'Animated text with brand colors', duration: 30, icon: '✨' },
  { id: 'listing_announcement', name: 'New Listing', description: 'Eye-catching announcement card', duration: 10, icon: '🎉' },
];

const SHARE_LINKS = (videoUrl: string, title: string): ShareLink[] => [
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    url: `https://wa.me/?text=${encodeURIComponent(`Check out: ${title} ${videoUrl}`)}`,
    color: 'bg-green-500',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    icon: '📘',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
    color: 'bg-blue-600',
  },
  {
    platform: 'twitter',
    label: 'X / Twitter',
    icon: '🐦',
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(videoUrl)}`,
    color: 'bg-gray-900',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    icon: '📸',
    url: 'instagram://library?AssetPath=',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    url: 'tiktok://',
    color: 'bg-black',
  },
  {
    platform: 'copy',
    label: 'Copy Link',
    icon: '🔗',
    url: videoUrl,
    color: 'bg-gray-500',
  },
];

interface VideoGeneratorProps {
  listingId: string;
  listingTitle: string;
  listingImages: string[];
  listingDescription?: string;
  vendorName?: string;
  primaryColor?: string;
}

export default function VideoGenerator({
  listingId,
  listingTitle,
  listingImages,
  listingDescription,
  vendorName,
  primaryColor = '#0ea5e9',
}: VideoGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'template' | 'preview' | 'generating' | 'complete' | 'error'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('product_showcase');
  const [customTitle, setCustomTitle] = useState(listingTitle);
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customDuration, setCustomDuration] = useState(15);
  const [selectedImages, setSelectedImages] = useState<string[]>(listingImages.slice(0, 5));
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('template');
      setSelectedTemplate('product_showcase');
      setCustomTitle(listingTitle);
      setCustomSubtitle('');
      setCustomDuration(15);
      setSelectedImages(listingImages.slice(0, 5));
      setVideoResult(null);
      setErrorMessage('');
      setRenderProgress(0);
      setCopied(false);
    }
  }, [isOpen, listingTitle, listingImages]);

  // Poll for render completion
  const pollRenderStatus = useCallback(async (renderId: string) => {
    setPolling(true);
    const maxAttempts = 40; // 40 × 3s = 2 min max
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/video/status/${renderId}`);
        const data = await res.json();

        if (data.status === 'complete') {
          clearInterval(interval);
          setPolling(false);
          setRenderProgress(100);
          setStep('complete');
        } else if (data.status === 'error') {
          clearInterval(interval);
          setPolling(false);
          setStep('error');
          setErrorMessage(data.error || 'Rendering failed');
        } else {
          // Estimate progress
          const estimated = Math.min(90, Math.round((attempts / maxAttempts) * 100));
          setRenderProgress(estimated);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          setStep('error');
          setErrorMessage('Render timed out. Please try again.');
        }
      } catch (err) {
        clearInterval(interval);
        setPolling(false);
        setStep('error');
        setErrorMessage('Lost connection to server.');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setStep('generating');
    setRenderProgress(0);

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTemplate,
          title: customTitle,
          subtitle: customSubtitle,
          images: selectedImages,
          durationSec: customDuration,
          branding: { primaryColor },
          metadata: { listingId, vendorName },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVideoResult({
          renderId: data.renderId,
          outputPath: data.outputPath,
          fileSize: data.fileSize,
          duration: data.duration,
          url: `/api/video/download/${data.renderId}`,
        });
        // Start polling
        pollRenderStatus(data.renderId);
      } else {
        setStep('error');
        setErrorMessage(data.error || 'Generation failed');
      }
    } catch (err) {
      setStep('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.origin + url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleImage = (img: string) => {
    setSelectedImages(prev =>
      prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
    );
  };

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
          color: 'white',
          boxShadow: `0 4px 14px ${primaryColor}40`,
        }}
      >
        <Film className="w-4 h-4" />
        Generate Promo Video
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${primaryColor}15` }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Video Generator</h2>
                  <p className="text-xs text-gray-500">
                    {step === 'template' && 'Choose a template'}
                    {step === 'preview' && 'Customize your video'}
                    {step === 'generating' && 'Rendering...'}
                    {step === 'complete' && 'Ready to share!'}
                    {step === 'error' && 'Something went wrong'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Step 1: Template Selection */}
              {step === 'template' && (
                <div className="space-y-3">
                  {TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setCustomDuration(template.duration);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? 'border-current bg-opacity-5'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                      style={selectedTemplate === template.id ? {
                        borderColor: primaryColor,
                        background: `${primaryColor}08`,
                      } : {}}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.duration}s
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: primaryColor }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setStep('preview')}
                    className="w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: primaryColor }}
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2: Preview / Customize */}
              {step === 'preview' && (
                <div className="space-y-4">
                  {/* Images */}
                  {listingImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Images ({selectedImages.length}/5)
                      </label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {listingImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleImage(img)}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImages.includes(img)
                                ? 'border-current ring-2 ring-offset-1'
                                : 'border-gray-200 opacity-60 hover:opacity-100'
                            }`}
                            style={selectedImages.includes(img) ? {
                              borderColor: primaryColor,
                              boxShadow: `0 0 0 2px white, 0 0 0 4px ${primaryColor}`,
                            } : {}}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            {selectedImages.includes(img) && (
                              <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ background: `${primaryColor}30` }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 text-sm"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      placeholder="Video title"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={e => setCustomSubtitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 text-sm"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      placeholder="e.g., Available now — Free delivery"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration: {customDuration}s
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      value={customDuration}
                      onChange={e => setCustomDuration(parseInt(e.target.value))}
                      className="w-full accent-current"
                      style={{ accentColor: primaryColor }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>5s</span>
                      <span>30s</span>
                      <span>60s</span>
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Preview</p>
                    <div className="aspect-[9/16] max-h-40 mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 relative">
                      {selectedImages[0] && (
                        <img
                          src={selectedImages[0]}
                          alt=""
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-white font-bold text-sm">{customTitle}</p>
                        {customSubtitle && (
                          <p className="text-white/70 text-xs mt-1">{customSubtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('template')}
                      className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!customTitle || selectedImages.length === 0}
                      className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: primaryColor }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Video
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Generating */}
              {step === 'generating' && (
                <div className="text-center py-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-full animate-spin"
                      style={{
                        border: `3px solid ${primaryColor}20`,
                        borderTopColor: primaryColor,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">Rendering your video...</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedTemplateData?.name} • {customDuration}s • {selectedImages.length} images
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${renderProgress}%`,
                        background: primaryColor,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {renderProgress < 100 ? `${renderProgress}% complete` : 'Finalizing...'}
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    This usually takes 30-120 seconds
                  </div>
                </div>
              )}

              {/* Step 4: Complete */}
              {step === 'complete' && videoResult && (
                <div className="space-y-4">
                  {/* Success Animation */}
                  <div className="text-center mb-4">
                    <div
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                      style={{ background: `${primaryColor}15` }}
                    >
                      <Check className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Video Ready!</h3>
                    <p className="text-sm text-gray-500">
                      {(videoResult.fileSize / 1024 / 1024).toFixed(1)} MB • {customDuration}s
                    </p>
                  </div>

                  {/* Video Preview */}
                  <div className="aspect-[9/16] max-h-60 mx-auto rounded-xl overflow-hidden bg-gray-900 relative">
                    {videoResult.url ? (
                      <video
                        src={videoResult.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Share Links */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share your video
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {SHARE_LINKS(videoResult.url || '', customTitle).map(link => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${link.color} text-white text-xs font-medium py-2.5 px-3 rounded-lg text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5`}
                          onClick={e => {
                            if (link.platform === 'copy') {
                              e.preventDefault();
                              handleCopyLink(videoResult.url || '');
                            }
                          }}
                        >
                          <span>{link.icon}</span>
                          <span>{link.label}</span>
                          {link.platform !== 'copy' && <ExternalLink className="w-3 h-3 opacity-60" />}
                        </a>
                      ))}
                    </div>
                    {copied && (
                      <p className="text-xs text-green-600 text-center mt-2 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" />
                        Link copied to clipboard!
                      </p>
                    )}
                  </div>

                  {/* Download */}
                  <div className="flex gap-3">
                    <a
                      href={videoResult.url || '#'}
                      download={`${listingTitle.replace(/\s+/g, '-')}-promo.mp4`}
                      className="flex-1 py-3 rounded-xl font-semibold text-white text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ background: primaryColor }}
                    >
                      <Download className="w-4 h-4" />
                      Download MP4
                    </a>
                    <button
                      onClick={() => {
                        setStep('template');
                        setVideoResult(null);
                      }}
                      className="py-3 px-5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      New
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Error */}
              {step === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
                  <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setStep('template');
                        setErrorMessage('');
                      }}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
