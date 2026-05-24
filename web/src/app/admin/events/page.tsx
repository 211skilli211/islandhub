'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { AdminTable, Column } from '@/components/admin/shared/AdminTable';

export default function AdminEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, published: 0, totalTickets: 0, revenue: 0 });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    api.get('/events?limit=1000').then(res => {
      const events = res.data.events || [];
      setStats({
        total: events.length,
        published: events.filter((e: any) => e.status === 'published').length,
        totalTickets: events.reduce((sum: number, e: any) => sum + (e.tickets_sold || 0), 0),
        revenue: events.reduce((sum: number, e: any) => {
          const tiers = e.ticket_tiers || [];
          return sum + tiers.reduce((s: number, t: any) => s + (t.sold || 0) * (t.price || 0), 0);
        }, 0),
      });
    }).catch(() => {});
  }, [refreshKey]);

  const eventColumns: Column<any>[] = [
    { header: 'ID', accessor: 'id', sortKey: 'id' },
    { header: 'Title', accessor: 'title', sortKey: 'title' },
    { header: 'Category', accessor: 'category', sortKey: 'category' },
    { header: 'Venue', accessor: 'venue', sortKey: 'venue' },
    { header: 'Date', accessor: (item) => new Date(item.start_date).toLocaleDateString(), sortKey: 'start_date' },
    { header: 'Tickets', accessor: (item) => `${item.tickets_sold || 0}/${item.total_capacity || 0}` },
    { header: 'Status', accessor: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        item.status === 'published' ? 'bg-green-100 text-green-700' :
        item.status === 'draft' ? 'bg-amber-100 text-amber-700' :
        item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
        'bg-slate-100 text-slate-700'
      }`}>{item.status}</span>
    )},
  ];

  const handleAction = async (action: string, eventId: number) => {
    try {
      switch (action) {
        case 'toggle_status': {
          const res = await api.get(`/events/${eventId}`);
          const newStatus = res.data.status === 'published' ? 'draft' : 'published';
          await api.patch(`/events/${eventId}`, { status: newStatus });
          toast.success(newStatus === 'published' ? 'Event published' : 'Event unpublished');
          setRefreshKey(k => k + 1);
          break;
        }
        case 'delete':
          if (confirm('Delete this event?')) {
            await api.delete(`/events/${eventId}`);
            toast.success('Event deleted');
            setRefreshKey(k => k + 1);
          }
          break;
        case 'verify_tickets':
          router.push('/events/verify');
          break;
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-ocean-800 rounded-xl p-5 border border-slate-100 dark:border-ocean-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total Events</p>
          <p className="text-3xl font-black text-slate-900 dark:text-sand-50 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-ocean-800 rounded-xl p-5 border border-slate-100 dark:border-ocean-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Published</p>
          <p className="text-3xl font-black text-green-600 mt-1">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-ocean-800 rounded-xl p-5 border border-slate-100 dark:border-ocean-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Tickets Sold</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{stats.totalTickets}</p>
        </div>
        <div className="bg-white dark:bg-ocean-800 rounded-xl p-5 border border-slate-100 dark:border-ocean-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Revenue (XCD)</p>
          <p className="text-3xl font-black text-teal-600 mt-1">${stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Events & Tickets</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage events and verify tickets</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/events/verify')}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            🎫 Verify Tickets
          </button>
          <button
            onClick={() => router.push('/events/create')}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            + New Event
          </button>
        </div>
      </div>

      <AdminTable<any>
        key={`events-${refreshKey}`}
        endpoint="/events"
        keyName="events"
        columns={eventColumns}
        searchable={true}
        searchPlaceholder="Search events..."
        rowActions={[
          { label: 'Toggle Status', action: 'toggle_status' },
          { label: 'Verify Tickets', action: 'verify_tickets' },
          { label: 'Delete', action: 'delete', className: 'text-red-500' },
        ]}
        onRowAction={(action, id) => handleAction(action, id)}
      />
    </div>
  );
}
