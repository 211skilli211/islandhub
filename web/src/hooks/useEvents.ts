'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';

export interface EventItem {
  id: number;
  title: string;
  description: string;
  venue: string;
  address: string;
  start_date: string;
  end_date: string;
  category: string;
  image_url: string;
  banner_url: string;
  organizer_name: string;
  status: string;
  ticket_tiers: TicketTier[];
  total_capacity: number;
  tickets_sold: number;
}

export interface TicketTier {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
  perks: string[];
}

export interface Ticket {
  id: number;
  event_id: number;
  tier_id: number;
  qr_code: string;
  qr_token: string;
  status: 'valid' | 'used' | 'refunded' | 'expired';
  holder_name: string;
  holder_email: string;
  purchased_at: string;
  used_at: string | null;
  event?: EventItem;
  tier?: TicketTier;
}

export function useEvents(filters?: { category?: string; status?: string; search?: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    api.get(`/events?${params}`).then(res => setEvents(res.data.events || [])).catch(() => {}).finally(() => setLoading(false));
  }, [filters?.category, filters?.status, filters?.search]);

  return { events, loading };
}

export function useEvent(eventId: number) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/events/${eventId}`).then(res => setEvent(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);
  return { event, loading };
}

export function useMyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = () => api.get('/events/tickets/my').then(res => setTickets(res.data.tickets || [])).catch(() => {});
  useEffect(() => { fetch().finally(() => setLoading(false)); }, []);
  return { tickets, loading, refresh: fetch };
}
