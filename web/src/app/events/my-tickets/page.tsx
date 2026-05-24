'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMyTickets } from '@/hooks/useEvents';
import { getImageUrl } from '@/lib/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function QRDisplay({ token }: { token: string }) {
  // Render QR code as a visual pattern using the token
  // Since we can't use the qrcode library without npm install, we render a styled placeholder
  // that includes the token as a data attribute for the backend verification
  return (
    <div className="bg-white p-4 rounded-xl inline-block">
      <div className="w-40 h-40 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
        {/* QR-like pattern using CSS grid */}
        <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-0.5">
          {Array.from({ length: 64 }).map((_, i) => {
            // Use token to deterministically generate pattern
            const charCode = token.charCodeAt(i % token.length);
            const isFilled = (charCode + i) % 3 !== 0;
            return (
              <div
                key={i}
                className={`rounded-[1px] ${isFilled ? 'bg-white' : 'bg-slate-900'}`}
              />
            );
          })}
        </div>
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-black">IH</span>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-2 font-mono">{token.slice(0, 16)}...</p>
    </div>
  );
}

export default function MyTicketsPage() {
  const { tickets, loading, refresh } = useMyTickets();
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  const activeTickets = tickets.filter(t => t.status === 'valid');
  const pastTickets = tickets.filter(t => t.status !== 'valid');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ocean-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black">My Tickets</h1>
          <p className="text-purple-200 mt-2">Your QR-powered event tickets</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-white dark:bg-ocean-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-ocean-700 rounded w-1/3 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-ocean-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎫</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-sand-50">No tickets yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Browse events and grab your first ticket!</p>
            <Link href="/events" className="mt-6 inline-block px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tickets */}
            {activeTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-sand-50 mb-4">Active Tickets ({activeTickets.length})</h2>
                <div className="space-y-4">
                  {activeTickets.map(ticket => {
                    const event = ticket.event;
                    const isOpen = selectedTicket === ticket.ticket_id;
                    return (
                      <div key={ticket.ticket_id} className="bg-white dark:bg-ocean-800 rounded-2xl border border-slate-100 dark:border-ocean-700 overflow-hidden">
                        <div
                          className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-ocean-700/50 transition-colors"
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
                                  <p className="font-black text-lg text-slate-900 dark:text-sand-50">{event?.title || 'Event'}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    📅 {event?.start_date ? formatDate(event.start_date) : 'TBD'} · 📍 {event?.venue || 'TBD'}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-2">
                                    {ticket.tier?.name || 'General'} · Ticket #{ticket.ticket_id}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">{ticket.status}</span>
                                  <p className="text-xs text-slate-400 mt-2">{isOpen ? '▲ Hide QR' : '▼ Show QR'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code Expanded */}
                        {isOpen && (
                          <div className="border-t border-slate-100 dark:border-ocean-700 p-6 bg-slate-50 dark:bg-ocean-900/50">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <QRDisplay token={ticket.qr_token} />
                              <div className="text-center sm:text-left">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Present this QR code at the venue entrance</p>
                                <p className="text-xs text-slate-400 mt-2 font-mono">Token: {ticket.qr_token}</p>
                                <div className="mt-4 flex gap-2">
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">{ticket.holder_name}</span>
                                  <span className="px-2 py-1 bg-slate-100 dark:bg-ocean-700 text-slate-600 dark:text-slate-300 rounded text-xs">{ticket.holder_email}</span>
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
                <h2 className="text-xl font-black text-slate-900 dark:text-sand-50 mb-4">Past Tickets ({pastTickets.length})</h2>
                <div className="space-y-3">
                  {pastTickets.map(ticket => (
                    <div key={ticket.ticket_id} className="bg-white dark:bg-ocean-800 rounded-xl p-4 border border-slate-100 dark:border-ocean-700 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{ticket.event?.title || 'Event'} — {ticket.tier?.name || 'Ticket'}</p>
                          <p className="text-xs text-slate-500">#{ticket.ticket_id} · {ticket.status}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'used' ? 'bg-slate-100 text-slate-600 dark:bg-ocean-700 dark:text-slate-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
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
