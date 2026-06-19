'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEvent } from '@/hooks/useEvents';
import { getImageUrl } from '@/lib/api';
import toast from '@/lib/toast';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const { event, loading } = useEvent(eventId);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary dark:bg-ocean-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-surface-primary dark:bg-ocean-900 flex items-center justify-center">
        <div className="text-center">
          <EmojiIcon emoji="🔍" size={48} className="text-6xl mb-4" />
          <h2 className="text-2xl font-black text-ink-primary dark:text-sand-50">Event not found</h2>
          <Link href="/events" className="mt-4 inline-block text-teal-600 font-bold hover:underline">← Back to Events</Link>
        </div>
      </div>
    );
  }

  const isSoldOut = event.tickets_sold >= event.total_capacity;
  const tier = selectedTier !== null ? event.ticket_tiers?.[selectedTier] : null;

  const handlePurchase = async () => {
    if (selectedTier === null || !tier) return;
    setPurchasing(true);
    try {
      const res = await api.post('/events/tickets/purchase', {
        event_id: event.event_id,
        tier_id: tier.tier_id,
        quantity: 1,
      });
      toast.success('Ticket purchased! Check My Tickets.');
      setShowConfirm(false);
      // Redirect to tickets page
      window.location.href = '/events/my-tickets';
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-ocean-900">
      
      <div className="relative h-64 sm:h-96 overflow-hidden">
        {(event.banner_url || event.image_url) ? (
          <Image
            src={getImageUrl(event.banner_url || event.image_url) || '/placeholder-event.jpg'}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-bold mb-3">{event.category}</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-4 text-center border border-border-primary dark:border-ocean-700">
                <EmojiIcon emoji="📅" size={24} className="text-2xl mb-1" />
                <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Date</p>
                <p className="font-bold text-ink-primary dark:text-sand-50 text-sm">{formatDate(event.start_date)}</p>
              </div>
              <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-4 text-center border border-border-primary dark:border-ocean-700">
                <EmojiIcon emoji="🕐" size={24} className="text-2xl mb-1" />
                <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Time</p>
                <p className="font-bold text-ink-primary dark:text-sand-50 text-sm">{formatTime(event.start_date)}</p>
              </div>
              <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-4 text-center border border-border-primary dark:border-ocean-700">
                <EmojiIcon emoji="📍" size={24} className="text-2xl mb-1" />
                <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Venue</p>
                <p className="font-bold text-ink-primary dark:text-sand-50 text-sm">{event.venue}</p>
              </div>
            </div>

            
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-6 border border-border-primary dark:border-ocean-700">
              <h2 className="text-xl font-black text-ink-primary dark:text-sand-50 mb-3">About This Event</h2>
              <p className="text-ink-secondary dark:text-ink-tertiary leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-6 border border-border-primary dark:border-ocean-700">
              <h2 className="text-xl font-black text-ink-primary dark:text-sand-50 mb-3">Organizer</h2>
              <p className="text-ink-secondary dark:text-ink-tertiary">{event.organizer_name}</p>
            </div>
          </div>

          
          <div className="lg:col-span-1">
            <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-6 border border-border-primary dark:border-ocean-700 sticky top-24">
              <h3 className="text-lg font-black text-ink-primary dark:text-sand-50 mb-4">Select Tickets</h3>

              {isSoldOut ? (
                <div className="text-center py-8">
                  <EmojiIcon emoji="🎫" size={40} className="text-4xl mb-3" />
                  <p className="font-black text-red-500 text-lg">SOLD OUT</p>
                  <p className="text-sm text-ink-tertiary mt-2">All tickets have been claimed</p>
                </div>
              ) : event.ticket_tiers?.length > 0 ? (
                <div className="space-y-3">
                  {event.ticket_tiers.map((t, idx) => {
                    const soldOut = t.sold >= t.quantity;
                    const isSelected = selectedTier === idx;
                    return (
                      <button
                        key={t.tier_id}
                        disabled={soldOut}
                        onClick={() => setSelectedTier(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          soldOut
                            ? 'border-border-primary dark:border-ocean-700 opacity-50 cursor-not-allowed'
                            : isSelected
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : 'border-border-primary dark:border-ocean-600 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-ink-primary dark:text-sand-50">{t.name}</p>
                            {t.description && <p className="text-xs text-ink-tertiary mt-1">{t.description}</p>}
                            {t.perks?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {t.perks.map((perk, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full font-bold">{perk}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg text-teal-600 dark:text-teal-400">${t.price}</p>
                            <p className="text-[10px] text-ink-tertiary">{t.quantity - t.sold} left</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {selectedTier !== null && tier && (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="w-full py-4 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-colors mt-4"
                    >
                      Get Ticket — ${tier.price} XCD
                    </button>
                  )}

                  
                  <div className="pt-4 border-t border-border-primary dark:border-ocean-700">
                    <div className="flex justify-between text-xs text-ink-tertiary mb-1">
                      <span>{event.tickets_sold} sold</span>
                      <span>{event.total_capacity} total</span>
                    </div>
                    <div className="w-full h-2 bg-surface-tertiary dark:bg-ocean-700 rounded-full">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (event.tickets_sold / event.total_capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-ink-tertiary text-center py-4">No tickets available yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      
      {showConfirm && tier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-6 max-w-md w-full border border-border-primary dark:border-ocean-700">
            <h3 className="text-xl font-black text-ink-primary dark:text-sand-50 mb-4">Complete Your Booking</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-ink-tertiary">Event</span>
                <span className="font-bold text-ink-primary dark:text-sand-50">{event.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-tertiary">Ticket</span>
                <span className="font-bold text-ink-primary dark:text-sand-50">{tier.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-tertiary">Date</span>
                <span className="font-bold text-ink-primary dark:text-sand-50">{formatDate(event.start_date)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border-primary dark:border-ocean-700 pt-3">
                <span className="font-black">Total</span>
                <span className="font-black text-lg text-teal-600">${tier.price} XCD</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-ink-tertiary font-bold hover:bg-surface-secondary dark:hover:bg-ocean-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : `Get Ticket — $${tier.price} XCD`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
