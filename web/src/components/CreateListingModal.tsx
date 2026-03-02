import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { useEffect } from 'react';
import DynamicForm from './marketplace/DynamicForm';

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    storeId?: number | null;
}

type ListingType = 'product' | 'campaign' | 'donation' | 'rental' | 'service' | 'transport';

export default function CreateListingModal({ isOpen, onClose, onSuccess, storeId }: CreateListingModalProps) {
    const { user } = useAuthStore();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedType, setSelectedType] = useState<ListingType | null>(null);
    const [loading, setLoading] = useState(false);
    const [store, setStore] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        goal_amount: '',
        category: '',
        sub_category: '',
        // Metadata fields
        inventory_count: '',
        shipping_info: '',
        deadline: '',
        duration: '',
        capacity: '',
        location: '',
        beneficiary: '',
        start_date: '',
        end_date: '',
        tour_category: '',
        // Transport fields
        service_type: 'taxi',
        pickup_location: '',
        dropoff_location: '',
        vehicle_category: 'car',
        scheduled_time: '',
        slug: '',
        metadata: {} as any
    });

    useEffect(() => {
        if (isOpen && storeId) {
            const fetchStore = async () => {
                try {
                    const res = await api.get(`/stores/${storeId}`);
                    setStore(res.data);

                    // Pre-fill category if store has a template that maps strongly
                    if (res.data.template_id === 'food_vendor' && !formData.category) {
                        setFormData(prev => ({ ...prev, category: 'Food' }));
                    } else if (res.data.template_id === 'retail_produce' && !formData.category) {
                        setFormData(prev => ({ ...prev, category: 'Product' }));
                    }
                } catch (e) {
                    console.error('Failed to fetch store for listing modal:', e);
                }
            };
            fetchStore();
        }
    }, [isOpen, storeId]);

    if (!isOpen) return null;

    const handleTypeSelect = (type: ListingType) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !user) return;

        setLoading(true);
        try {
            if (selectedType === 'transport') {
                // Transport jobs go to logistics endpoint
                const transportPayload = {
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price || '0'),
                    service_type: formData.service_type,
                    pickup_location: formData.pickup_location,
                    dropoff_location: formData.dropoff_location,
                    vehicle_category: formData.vehicle_category,
                    scheduled_time: formData.scheduled_time ? new Date(formData.scheduled_time).toISOString() : null
                };
                await api.post('/logistics/jobs', transportPayload);
            } else {
                // Standard Listings
                const payload: any = {
                    type: selectedType,
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    slug: formData.slug,
                    store_id: storeId
                };

                if (selectedType === 'campaign' || selectedType === 'donation') {
                    payload.goal_amount = parseFloat(formData.goal_amount);
                } else {
                    payload.price = parseFloat(formData.price || '0');
                }

                // Construct metadata
                const metadata: any = {};
                if (selectedType === 'product') {
                    metadata.inventory_count = parseInt(formData.inventory_count);
                    metadata.shipping_info = formData.shipping_info;
                } else if (selectedType === 'campaign' || selectedType === 'donation') {
                    payload.start_date = formData.start_date;
                    payload.end_date = formData.end_date;
                    payload.location = formData.location;
                    metadata.beneficiary = formData.beneficiary;
                } else if (selectedType === 'service') {
                    payload.duration = formData.duration;
                    payload.capacity = parseInt(formData.capacity) || null;
                    payload.location = formData.location;
                    payload.sub_category = formData.sub_category;
                    payload.tour_category = formData.tour_category;
                } else if (selectedType === 'rental') {
                    payload.duration = formData.duration;
                    payload.location = formData.location;
                    payload.sub_category = formData.sub_category;
                }

                payload.metadata = metadata;

                await api.post('/listings', payload);
            }

            onSuccess?.();
            onClose();
            // Reset state
            setStep(1);
            setSelectedType(null);
            setFormData({
                title: '', description: '', price: '', goal_amount: '', category: '',
                inventory_count: '', shipping_info: '', deadline: '', duration: '', location: '', beneficiary: '', start_date: '', end_date: '', tour_category: '', sub_category: '', capacity: '',
                service_type: 'taxi', pickup_location: '', dropoff_location: '', vehicle_category: 'car', scheduled_time: '', slug: '',
                metadata: {}
            });

        } catch (error) {
            console.error("Failed to create listing", error);
            alert("Failed to create listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render Content ---

    const renderTypeSelection = () => (
        <div>
            <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Listing</h3>
                <p className="text-sm text-gray-500 mt-2">Select the type of listing you want to create.</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
                {[
                    { type: 'product', icon: '🛍️', label: 'Product', desc: 'Sell items' },
                    { type: 'campaign', icon: '🔥', label: 'Campaign', desc: 'Raise funds' },
                    { type: 'donation', icon: '🎁', label: 'Donation', desc: 'Direct support' },
                    { type: 'rental', icon: '🏠', label: 'Rental', desc: 'Rent property' },
                    { type: 'service', icon: '💼', label: 'Service', desc: 'Offer skills' },
                    { type: 'transport', icon: '🚖', label: 'Ride / Delivery', desc: 'Request transport' },
                ].map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => handleTypeSelect(opt.type as ListingType)}
                        className="rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center space-y-2 hover:border-teal-500 hover:bg-teal-50 transition-all focus:outline-none"
                    >
                        <span className="text-4xl">{opt.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">New {selectedType === 'transport' ? 'Transport Request' : selectedType + ' Listing'}</h3>

            {/* Common Fields */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required name="title" placeholder={selectedType === 'transport' ? 'e.g. Ride to Airport / Package Delivery' : ''} value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>

            {selectedType !== 'transport' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        required
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                        <option value="">Select Category</option>
                        {selectedType === 'rental' && (
                            <>
                                <option value="Stay">Stay (Airbnb/Villa)</option>
                                <option value="Vehicle">Vehicle (Car/ATV)</option>
                                <option value="Sea">Sea (Boat/JetSki)</option>
                                <option value="Equipment">Equipment & Tools</option>
                            </>
                        )}
                        {selectedType === 'service' && (
                            <>
                                <option value="Tour">Tour & Experience</option>
                                <option value="Professional">Professional Service</option>
                                <option value="Wellness">Health & Wellness</option>
                                <option value="Taxi">Taxi / Ride Service</option>
                                <option value="Delivery">Delivery Service</option>
                                <option value="Pickup">Pickup & Hauling</option>
                            </>
                        )}
                        {selectedType === 'product' && (
                            <>
                                <option value="Retail">Retail & Boutique</option>
                                <option value="Art">Local Art & Crafts</option>
                                <option value="Food">Packaged Food</option>
                                <option value="Agro">Agro Produce</option>
                                <option value="Juice">Juice Bar & Smoothies</option>
                                <option value="Vegan">Ital & Vegan</option>
                                <option value="Dessert">Dessert & Treats</option>
                                <option value="Snack">Snackette</option>
                            </>
                        )}
                        {(selectedType === 'campaign' || selectedType === 'donation') && (
                            <>
                                <option value="Community">Community Support</option>
                                <option value="Disaster">Disaster Relief</option>
                                <option value="Innovation">Business Innovation</option>
                            </>
                        )}
                    </select>
                </div>
            )}

            {/* Service Sub-Type for Tours */}
            {selectedType === 'service' && formData.category === 'Tour' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tour Theme</label>
                    <select
                        required
                        name="tour_category"
                        value={formData.tour_category}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                        <option value="">Select Theme</option>
                        <option value="land">Land & Culture</option>
                        <option value="sea">Sea & Aquatic</option>
                        <option value="rail">Rail & Scenic</option>
                        <option value="adventure">Adventure</option>
                        <option value="charter">Private Charter</option>
                        <option value="culture">Heritage & Culture</option>
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Listing URL Slug (Optional)</label>
                <input
                    name="slug"
                    placeholder="e.g. delicious-ital-stew"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">Leave empty to generate automatically from title.</p>
            </div>

            {/* Type Specific - Price/Goal */}
            {(selectedType === 'campaign' || selectedType === 'donation') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Goal ($)</label>
                        <input required type="number" name="goal_amount" value={formData.goal_amount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Beneficiary</label>
                        <input required name="beneficiary" placeholder="e.g. Village Primary School" value={formData.beneficiary} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700">{selectedType === 'transport' ? 'Offer Price / Fare ($)' : 'Price ($)'}</label>
                    <input required type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
            )}

            {/* Transport Specific fields */}
            {selectedType === 'transport' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Service Type</label>
                            <select
                                name="service_type"
                                value={formData.service_type}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            >
                                <option value="taxi">Taxi / Ride</option>
                                <option value="delivery">Delivery</option>
                                <option value="pickup">Pickup</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Required Vehicle</label>
                            <select
                                name="vehicle_category"
                                value={formData.vehicle_category}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            >
                                <option value="car">Standard Car</option>
                                <option value="suv">SUV / Minivan</option>
                                <option value="truck">Truck / Van (Large)</option>
                                <option value="scooter">Scooter / Bike</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                        <input required name="pickup_location" placeholder="e.g. Airport Terminal 1" value={formData.pickup_location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                        <input required name="dropoff_location" placeholder="e.g. Park Hyatt St. Kitts" value={formData.dropoff_location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Scheduled Time (Optional)</label>
                        <input type="datetime-local" name="scheduled_time" value={formData.scheduled_time} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                </div>
            )}

            {/* Metadata Fields */}
            {selectedType === 'product' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Inventory Count</label>
                        <input required type="number" name="inventory_count" value={formData.inventory_count} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Shipping Info</label>
                        <input required name="shipping_info" value={formData.shipping_info} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                </div>
            )}

            {(selectedType === 'campaign') && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input required type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input required type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                </div>
            )}

            {(selectedType === 'service' || selectedType === 'rental' || selectedType === 'campaign') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input required name="location" placeholder="e.g. Basseterre, St. Kitts" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
            )}

            {/* Dynamic Category Specifics */}
            {formData.category && (
                <DynamicForm
                    category={formData.category}
                    subType={formData.sub_category || formData.category}
                    metadata={formData.metadata}
                    onChange={(newMeta) => setFormData(prev => ({ ...prev, metadata: newMeta }))}
                />
            )}

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:col-start-2 sm:text-sm"
                >
                    {loading ? 'Creating...' : 'Create Listing'}
                </button>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                    Back
                </button>
            </div>
        </form>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        {step === 1 ? renderTypeSelection() : renderForm()}
                    </div>
                </div>
            </div>
        </div>
    );
}
