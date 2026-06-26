'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  provider_name: string;
  location: string;
  rating: number;
  image_url: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const { slug } = params;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${slug}`);
        setService(res.data.service || res.data);
      } catch (error) {
        console.error('Failed to fetch service:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="animate-pulse text-ink-tertiary">Loading service...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <p className="text-ink-tertiary">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {service.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-6">
            <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mb-2">{service.name}</h1>
        <p className="text-ink-secondary mb-4">{service.description}</p>
        <div className="flex items-center gap-4 mb-6">
          {service.price != null && (
            <span className="text-xl font-bold text-accent-500">
              {service.currency || '$'}{service.price}
            </span>
          )}
          {service.rating != null && (
            <span className="text-sm text-ink-tertiary">★ {service.rating}</span>
          )}
        </div>
        <div className="bg-surface-elevated rounded-2xl border border-white/10 p-4">
          <p className="text-sm text-ink-tertiary">Provider: <span className="text-white">{service.provider_name}</span></p>
          {service.location && (
            <p className="text-sm text-ink-tertiary">Location: <span className="text-white">{service.location}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
