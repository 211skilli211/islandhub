'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
  });

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/listings', formData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface-elevated text-white"
              placeholder="Listing title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface-elevated text-white"
              placeholder="Describe your listing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Price (USD)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface-elevated text-white"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface-elevated text-white"
              required
            >
              <option value="">Select category</option>
              <option value="products">Products</option>
              <option value="services">Services</option>
              <option value="rentals">Rentals</option>
              <option value="food">Food</option>
              <option value="tours">Tours</option>
              <option value="transport">Transport</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface-elevated text-white"
              placeholder="City, Island"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
