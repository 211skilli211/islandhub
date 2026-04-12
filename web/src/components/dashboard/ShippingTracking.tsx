'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Shipment {
    id: string;
    tracking_number: string;
    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
    origin: string;
    destination: string;
    estimated_delivery: string;
    carrier: string;
    last_update: string;
}

export default function ShippingTracking() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shipments, setShipments] = useState<Shipment[]>([
        {
            id: '1',
            tracking_number: 'ISL-2024-001234',
            status: 'in_transit',
            origin: 'Miami, FL',
            destination: 'Kingston, Jamaica',
            estimated_delivery: '2024-02-10',
            carrier: 'Island Express',
            last_update: 'Package arrived at Kingston hub',
        },
        {
            id: '2',
            tracking_number: 'ISL-2024-001235',
            status: 'out_for_delivery',
            origin: 'Kingston, Jamaica',
            destination: 'Montego Bay, Jamaica',
            estimated_delivery: '2024-02-05',
            carrier: 'Local Delivery',
            last_update: 'Out for delivery',
        },
    ]);
    const [searchResult, setSearchResult] = useState<Shipment | null>(null);

    const handleTrack = () => {
        const found = shipments.find(s => s.tracking_number === trackingNumber);
        setSearchResult(found || null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-700';
            case 'picked_up': return 'bg-blue-100 text-blue-700';
            case 'in_transit': return 'bg-amber-100 text-amber-700';
            case 'out_for_delivery': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-emerald-100 text-emerald-700';
            case 'exception': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '📦';
            case 'picked_up': return '📬';
            case 'in_transit': return '🚚';
            case 'out_for_delivery': return '🛵';
            case 'delivered': return '✅';
            case 'exception': return '⚠️';
            default: return '📦';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">International Shipping & Tracking</h2>
                    <p className="text-gray-600">Track shipments and manage international deliveries</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    + New Shipment
                </button>
            </div>

            {/* Tracking Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Track Your Package</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter tracking number..."
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleTrack}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Track
                    </button>
                </div>

                {searchResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-gray-50 rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-medium text-gray-900">{searchResult.tracking_number}</div>
                                <div className="text-sm text-gray-500">via {searchResult.carrier}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(searchResult.status)}`}>
                                {getStatusIcon(searchResult.status)} {searchResult.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">From:</span>
                                <span className="ml-2 text-gray-900">{searchResult.origin}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">To:</span>
                                <span className="ml-2 text-gray-900">{searchResult.destination}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">ETA:</span>
                                <span className="ml-2 text-gray-900">{searchResult.estimated_delivery}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Last Update:</span>
                                <span className="ml-2 text-gray-900">{searchResult.last_update}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Shipments Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                    <div className="text-2xl font-bold text-gray-600">{shipments.length}</div>
                    <div className="text-sm text-gray-700">Total Shipments</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                >
                    <div className="text-2xl font-bold text-amber-600">
                        {shipments.filter(s => s.status === 'in_transit').length}
                    </div>
                    <div className="text-sm text-amber-700">In Transit</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-200"
                >
                    <div className="text-2xl font-bold text-purple-600">
                        {shipments.filter(s => s.status === 'out_for_delivery').length}
                    </div>
                    <div className="text-sm text-purple-700">Out for Delivery</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-emerald-50 rounded-xl p-4 border border-emerald-200"
                >
                    <div className="text-2xl font-bold text-emerald-600">
                        {shipments.filter(s => s.status === 'delivered').length}
                    </div>
                    <div className="text-sm text-emerald-700">Delivered</div>
                </motion.div>
            </div>

            {/* Shipments List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">All Shipments</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {shipments.map((shipment) => (
                        <motion.div
                            key={shipment.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{getStatusIcon(shipment.status)}</span>
                                    <div>
                                        <div className="font-medium text-gray-900">{shipment.tracking_number}</div>
                                        <div className="text-sm text-gray-500">
                                            {shipment.origin} → {shipment.destination}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">{shipment.carrier}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                                        {shipment.status.replace('_', ' ')}
                                    </span>
                                    <div className="text-sm text-gray-500 mt-1">
                                        ETA: {shipment.estimated_delivery}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Last update: {shipment.last_update}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left">
                    <div className="font-medium text-gray-900">Schedule Pickup</div>
                    <div className="text-sm text-gray-500">Arrange courier collection</div>
                </button>
                <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left">
                    <div className="font-medium text-gray-900">Customs Documents</div>
                    <div className="text-sm text-gray-500">Upload & manage paperwork</div>
                </button>
                <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left">
                    <div className="font-medium text-gray-900">Insurance</div>
                    <div className="text-sm text-gray-500">Add shipment protection</div>
                </button>
            </div>
        </div>
    );
}
