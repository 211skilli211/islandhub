'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/urlUtils';

export default function VendorProfilePage() {
    const params = useParams();
    const id = params?.id as string;
    // Assuming vendors are just users with role='vendor' for now, 
    // or we might have a separate 'vendors' table later. 
    // Using users endpoint + listings filtration for MVP.
    const [vendor, setVendor] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Vendor Info
                const vendorRes = await api.get(`/vendors/${id}`);
                setVendor(vendorRes.data);

                // 2. Fetch Listings by this vendor
                const listingsRes = await api.get(`/vendors/${id}/listings`);
                setListings(listingsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Store...</div>;
    if (!vendor) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Store not found</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Store Banner */}
            <div
                className="h-64 bg-slate-900 relative overflow-hidden bg-cover bg-center"
                style={vendor.banner_url ? { backgroundImage: `url(${getImageUrl(vendor.banner_url)})` } : {}}
            >
                {!vendor.banner_url && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-slate-900 opacity-90"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <span className="text-9xl font-black text-white uppercase tracking-tighter">
                        {vendor.business_name || 'ISLAND'}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col md:flex-row items-center md:items-end gap-8">
                    <div className="h-32 w-32 bg-white rounded-2xl shadow-md p-2 -mt-16 md:mt-0 overflow-hidden">
                        {vendor.logo_url ? (
                            <img
                                src={getImageUrl(vendor.logo_url)}
                                alt={vendor.business_name}
                                className="h-full w-full object-cover rounded-xl"
                            />
                        ) : (
                            <div className="h-full w-full bg-teal-50 rounded-xl flex items-center justify-center text-4xl font-bold text-teal-600 border border-teal-100">
                                {vendor.business_name?.charAt(0) || vendor.owner_name?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-black text-slate-900 mb-2">{vendor.business_name || `${vendor.owner_name}'s Store`}</h1>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            {vendor.description || `Providing authentic island goods and services since ${new Date(vendor.created_at).getFullYear()}.`}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:shadow-teal-600/30 transition-all">
                            Contact Vendor
                        </button>
                    </div>
                </div>

                {/* Store Content */}
                <div className="py-12">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        Listing Showcase
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{listings.length}</span>
                    </h2>

                    {listings.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                            <h3 className="text-xl font-bold text-slate-400">No listings available yet.</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {listings.map((item) => (
                                <a href={`/listings/${item.id}`} key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                        {item.images && item.images[0] ? (
                                            <img src={getImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">No Image</div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-800 shadow-sm">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                                        <p className="text-slate-500 text-xs mb-4 line-clamp-1">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-lg text-slate-900">
                                                {item.type === 'campaign' ? `$${item.goal_amount}` : `$${item.price}`}
                                            </span>
                                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">View Details →</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
