'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface KYCStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  id_card_verified: boolean;
  license_verified: boolean;
  vehicle_registration_verified: boolean;
  insurance_verified: boolean;
  background_check_verified: boolean;
  rejection_reason?: string;
  submitted_at?: string;
}

const VERIFICATION_STEPS = [
  { key: 'id_card', label: 'Government ID', description: 'Upload a clear photo of your national ID or passport', icon: '🪪' },
  { key: 'license', label: 'Driver\'s License', description: 'Upload your valid driver\'s license', icon: '🚗' },
  { key: 'vehicle', label: 'Vehicle Registration', description: 'Upload your vehicle registration document', icon: '📋' },
  { key: 'insurance', label: 'Insurance', description: 'Upload valid vehicle insurance', icon: '🛡️' },
  { key: 'selfie', label: 'Selfie Verification', description: 'Take a selfie holding your ID for identity verification', icon: '🤳' },
];

export default function DriverVerificationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const res = await api.get('/drivers/kyc/status');
      setKycStatus(res.data);
    } catch (err) {
      // No KYC yet
      setKycStatus({ status: 'none', id_card_verified: false, license_verified: false, vehicle_registration_verified: false, insurance_verified: false, background_check_verified: false });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await api.post('/drivers/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFiles(prev => ({ ...prev, [type]: res.data.url }));
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const submitKYC = async () => {
    const requiredTypes = ['id_card', 'license', 'selfie'];
    const missing = requiredTypes.filter(t => !files[t]);

    if (missing.length > 0) {
      toast.error(`Please upload: ${missing.map(m => m.replace('_', ' ')).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/drivers/kyc/submit', {
        id_card_url: files.id_card,
        license_url: files.license,
        vehicle_url: files.vehicle || null,
        insurance_url: files.insurance || null,
        selfie_url: files.selfie,
      });

      toast.success('Verification submitted! Review typically takes 1-2 business days.');
      fetchKYCStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-500/20 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-tertiary font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const isVerified = kycStatus?.status === 'approved';
  const isPending = kycStatus?.status === 'pending';
  const isRejected = kycStatus?.status === 'rejected';

  if (isVerified) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <EmojiIcon emoji="✅" size=48 className="text-6xl mb-4" />
          <h1 className="text-2xl font-black text-ink-primary mb-2">You're Verified!</h1>
          <p className="text-ink-tertiary mb-6">Your driver account is fully verified. Start accepting jobs now.</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/driver/app')}
              className="flex-1 py-4 bg-accent-500 text-white rounded-xl font-bold"
            >
              Go Online 🚀
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-4 bg-surface-elevated text-ink-primary rounded-xl font-bold border border-border-primary"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-black text-ink-primary mb-2">Verification In Progress</h1>
          <p className="text-ink-tertiary mb-4">We're reviewing your documents. This typically takes 1-2 business days.</p>
          <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 text-left">
            <h3 className="text-sm font-black text-ink-tertiary uppercase tracking-widest mb-3">Submitted Documents</h3>
            <div className="space-y-2">
              {VERIFICATION_STEPS.map(step => (
                <div key={step.key} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl">
                  <span className="text-lg">{step.icon}</span>
                  <span className="flex-1 text-sm font-bold text-ink-primary">{step.label}</span>
                  <span className="text-xs text-ink-tertiary">Submitted</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-8 py-3 bg-surface-elevated text-ink-primary rounded-xl font-bold border border-border-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <EmojiIcon emoji="❌" size=48 className="text-6xl mb-4" />
          <h1 className="text-2xl font-black text-ink-primary mb-2">Verification Rejected</h1>
          <p className="text-ink-tertiary mb-2">We couldn't verify your documents.</p>
          {kycStatus?.rejection_reason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-400">{kycStatus.rejection_reason}</p>
            </div>
          )}
          <button
            onClick={() => setKycStatus({ status: 'none', id_card_verified: false, license_verified: false, vehicle_registration_verified: false, insurance_verified: false, background_check_verified: false })}
            className="px-8 py-4 bg-accent-500 text-white rounded-xl font-bold"
          >
            Re-submit Documents
          </button>
        </div>
      </div>
    );
  }

  // Not submitted yet — show upload form
  const uploadedCount = Object.keys(files).length;
  const totalRequired = VERIFICATION_STEPS.length;
  const progress = (uploadedCount / totalRequired) * 100;

  return (
    <div className="min-h-screen bg-surface-primary pt-4 pb-20">
      
      <div className="bg-surface-elevated border-b border-border-primary">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black text-ink-primary mb-1">Driver Verification</h1>
          <p className="text-sm text-ink-tertiary">Upload the required documents to start accepting trips</p>

          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-ink-tertiary mb-1">
              <span>{uploadedCount} of {totalRequired} uploaded</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-500 to-emerald-500 rounded-full"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {VERIFICATION_STEPS.map((step, idx) => {
          const isUploaded = !!files[step.key];
          const isUploading = uploading[step.key];

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-surface-elevated rounded-2xl border p-5 transition-all ${
                isUploaded ? 'border-emerald-500/30' : 'border-border-primary'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  isUploaded ? 'bg-emerald-500/10' : 'bg-surface-secondary'
                }`}>
                  {isUploaded ? '✅' : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-ink-primary mb-0.5">{step.label}</h3>
                  <p className="text-xs text-ink-tertiary mb-3">{step.description}</p>

                  {isUploaded ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <EmojiIcon emoji="✓" size=16 />
                    </div>
                  ) : (
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                      isUploading
                        ? 'bg-surface-tertiary text-ink-tertiary'
                        : 'bg-accent-500 text-white hover:bg-accent-600'
                    }`}>
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-surface-elevated border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          📤 Upload
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(step.key, e)}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        
        <div className="pt-4">
          <button
            onClick={submitKYC}
            disabled={submitting || uploadedCount < 3}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
              uploadedCount >= 3
                ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/20'
                : 'bg-surface-tertiary text-ink-tertiary cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              `Submit for Review (${uploadedCount}/${totalRequired})`
            )}
          </button>
          <p className="text-[10px] text-ink-tertiary text-center mt-2">
            By submitting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
