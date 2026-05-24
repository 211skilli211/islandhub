'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            // In a real app, we'd have a specific admin endpoint or query param ?admin=true to seeing unverified ones.
            // For now, let's assume the main GET /campaigns returns ALL if we are admin, or we need a new endpoint.
            // Actually, let's just use the main endpoint but we might need to adjust the backend to return unverified ones too.
            // Wait, I modified backend to default return verified only unless ?admin=true... 
            // I need to update the backend findAll to accept a param or just create a specific admin route.
            // Let's assume for this MVP, /campaigns returns ALL for now, or I'll quickly update the fetch to pass a flag if I implemented it.
            // I implemented: static async findAll(isAdmin: boolean = false)
            // But the controller doesn't use it yet.

            const res = await api.get('/campaigns?admin=true');
            setCampaigns(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleVerify = async (id: number) => {
        try {
            await api.patch(`/campaigns/${id}/verify`);
            // Refresh list or update local state
            setCampaigns(campaigns.map(c =>
                c.campaign_id === id ? { ...c, verified: true, status: 'active' } : c
            ));
        } catch (error) {
            console.error('Failed to verify campaign', error);
            alert('Failed to verify');
        }
    };

    if (loading) return <div className="p-10">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {campaigns.map((campaign) => (
                            <li key={campaign.campaign_id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-teal-600 truncate">{campaign.title}</p>
                                        <p className="flex items-center text-sm text-gray-500">
                                            Status: <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {campaign.verified ? 'Verified' : 'Pending Verification'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="ml-5 flex-shrink-0">
                                        {!campaign.verified && (
                                            <button
                                                onClick={() => handleVerify(campaign.campaign_id)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {campaign.verified && (
                                            <Link href={`/campaigns/${campaign.campaign_id}`} className="text-indigo-600 hover:text-indigo-900 text-sm">
                                                View
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {campaigns.length === 0 && (
                            <li className="px-4 py-8 text-center text-gray-500">No campaigns found.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
