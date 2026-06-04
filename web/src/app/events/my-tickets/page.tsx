'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMyTickets } from '@/hooks/useEvents';
import { getImageUrl } from '@/lib/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

import { QRCodeSVG } from 'qrcode.react';

function QRDisplay({ token }: { token: string }) {
  return (
    <div className="bg-surface-elevated p-4 rounded-xl inline-block">
      <QRCodeSVG
        value={token}
        size={160}
        level="H"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#0f172a"
      />
      <p className="text-center text-[10px] text-ink-tertiary mt-2 font-mono">{token.slice(0, 16)}...</p>
    </div>
  );
}

export default function MyTicketsPage() {
  const { tickets, loading, refresh } = useMyTickets();
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  const activeTickets = tickets.filter(t => t.status === 'valid');
  const pastTickets = tickets.filter(t => t.status !== 'valid');

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-ocean-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black">My Tickets</h1>
          <p className="text-teal-200 mt-2">Your QR-powered event tickets</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-surface-tertiary dark:bg-ocean-700 rounded w-1/3 mb-4" />
                <div className="h-4 bg-surface-tertiary dark:bg-ocean-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎫</p>
            <h3 className="text-2xl font-black text-ink-primary dark:text-sand-50">No tickets yet</h3>
            <p className="text-ink-tertiary dark:text-ink-tertiary mt-2">Browse events and grab your first ticket!</p>
            <Link href="/events" className="mt-6 inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tickets */}
            {activeTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-ink-primary dark:text-sand-50 mb-4">Active Tickets ({activeTickets.length})</h2>
                <div className="space-y-4">
                  {activeTickets.map(ticket => {
                    const event = ticket.event;
                    const isOpen = selectedTicket === ticket.ticket_id;
                    return (
                      <div key={ticket.ticket_id} className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary dark:border-ocean-700 overflow-hidden">
                        <div
                          className="p-6 cursor-pointer hover:bg-surface-primary dark:hover:bg-ocean-700/50 transition-colors"
                          onClick={() => setSelectedTicket(isOpen ? null : ticket.ticket_id)}
                        >
                          <div className="flex items-start gap-4">
                            {event?.image_url && (
                              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                <Image src={getImageUrl(event.image_url) || '/placeholder-event.svg'} alt={event.title} width={80} height={80} className="object-cover w-full h-full" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-black text-lg text-ink-primary dark:text-sand-50">{event?.title || 'Event'}</p>
                                  <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">
                                    📅 {event?.start_date ? formatDate(event.start_date) : 'TBD'} · 📍 {event?.venue || 'TBD'}
                                  </p>
                                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-2">
                                    {ticket.tier?.name || 'General'} · Ticket #{ticket.ticket_id}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">{ticket.status}</span>
                                  <p className="text-xs text-ink-tertiary mt-2">{isOpen ? '▲ Hide QR' : '▼ Show QR'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code Expanded */}
                        {isOpen && (
                          <div className="border-t border-border-primary dark:border-ocean-700 p-6 bg-surface-primary dark:bg-ocean-900/50">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <QRDisplay token={ticket.qr_token} />
                              <div className="text-center sm:text-left">
                                <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Present this QR code at the venue entrance</p>
                                <p className="text-xs text-ink-tertiary mt-2 font-mono">Token: {ticket.qr_token}</p>
                                <div className="mt-4 flex gap-2">
                                  <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-xs font-bold">{ticket.holder_name}</span>
                                  <span className="px-2 py-1 bg-surface-secondary dark:bg-ocean-700 text-ink-secondary dark:text-ink-tertiary rounded text-xs">{ticket.holder_email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Tickets */}
            {pastTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-ink-primary dark:text-sand-50 mb-4">Past Tickets ({pastTickets.length})</h2>
                <div className="space-y-3">
                  {pastTickets.map(ticket => (
                    <div key={ticket.ticket_id} className="bg-surface-elevated dark:bg-ocean-800 rounded-xl p-4 border border-border-primary dark:border-ocean-700 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink-secondary dark:text-ink-tertiary">{ticket.event?.title || 'Event'} — {ticket.tier?.name || 'Ticket'}</p>
                          <p className="text-xs text-ink-tertiary">#{ticket.ticket_id} · {ticket.status}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'used' ? 'bg-surface-secondary text-ink-secondary dark:bg-ocean-700 dark:text-ink-tertiary' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>{ticket.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
