'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

export default function QRVerifyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!token.trim()) return;
    setVerifying(true);
    setResult(null);
    try {
      const res = await api.post('/events/tickets/verify', { qr_token: token.trim() });
      setResult(res.data);
      if (res.data.valid) {
        toast.success('Ticket verified successfully!');
      } else {
        toast.error(res.data.error || 'Ticket invalid');
      }
    } catch (err: any) {
      toast.error('Verification failed');
      setResult({ valid: false, error: 'Server error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-ocean-900 flex items-center justify-center p-4">
      <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-8 max-w-md w-full border border-border-primary dark:border-ocean-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <EmojiIcon emoji="🎫" size=28 className="text-3xl" />
          </div>
          <h1 className="text-2xl font-black text-ink-primary dark:text-sand-50">Verify Ticket</h1>
          <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">Enter the QR token to verify</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Paste QR token..."
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full px-4 py-3 bg-surface-primary dark:bg-ocean-900 border border-border-primary dark:border-ocean-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-mono dark:text-sand-50"
          />
          <button
            onClick={handleVerify}
            disabled={verifying || !token.trim()}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Ticket'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-xl ${result.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            {result.valid ? (
              <div>
                <EmojiIcon emoji="✓" size=18 className="font-black text-green-700 dark:text-green-400 text-lg" />
                <div className="mt-2 space-y-1 text-sm text-ink-secondary dark:text-ink-tertiary">
                  <p><span className="font-bold">Event:</span> {result.ticket?.event_title}</p>
                  <p><span className="font-bold">Tier:</span> {result.ticket?.tier_name}</p>
                  <p><span className="font-bold">Ticket ID:</span> {result.ticket?.ticket_id}</p>
                </div>
              </div>
            ) : (
              <div>
                <EmojiIcon emoji="✕" size=18 className="font-black text-red-700 dark:text-red-400 text-lg" />
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
