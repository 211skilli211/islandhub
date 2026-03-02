'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BecomeDriver() {
    const [applicationStep, setApplicationStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        vehicleType: '',
        licenseNumber: '',
        experience: '',
    });

    const vehicleTypes = [
        { id: 'car', name: 'Car', icon: '🚗', requirement: 'Valid Driver\'s License' },
        { id: 'motorcycle', name: 'Motorcycle', icon: '🏍️', requirement: 'Motorcycle License' },
        { id: 'bicycle', name: 'Bicycle', icon: '🚲', requirement: 'None' },
        { id: 'van', name: 'Van/Truck', icon: '🚐', requirement: 'Commercial License' },
    ];

    const benefits = [
        { icon: '💰', title: 'Earn Up to $25/hour', description: 'Competitive pay with tips' },
        { icon: '🕐', title: 'Flexible Schedule', description: 'Work when you want' },
        { icon: '📱', title: 'Easy App', description: 'Simple delivery management' },
        { icon: '🚗', title: 'Fast Deliveries', description: 'Optimized routing' },
    ];

    const handleSubmit = () => {
        // In production, submit to API
        alert('Application submitted! We will review your application.');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Become a Driver</h2>
                    <p className="text-gray-600">Join our delivery team and start earning</p>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
                <div className="max-w-2xl">
                    <h3 className="text-3xl font-bold mb-4">Start Earning Today!</h3>
                    <p className="text-lg opacity-90 mb-6">
                        Join thousands of drivers earning flexible income delivering with IslandFund.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">$15-25</div>
                            <div className="text-sm opacity-80">Per Hour</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">500+</div>
                            <div className="text-sm opacity-80">Active Drivers</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">24/7</div>
                            <div className="text-sm opacity-80">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="text-3xl mb-3">{benefit.icon}</div>
                        <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                        <p className="text-sm text-gray-500">{benefit.description}</p>
                    </motion.div>
                ))}
            </div>

            {/* Application Form */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Driver Application</h3>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${applicationStep >= step
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-16 h-1 mx-2 ${applicationStep > step ? 'bg-emerald-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-500">
                        <span>Personal Info</span>
                        <span>Vehicle</span>
                        <span>Review</span>
                    </div>
                </div>

                <div className="p-6">
                    {applicationStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="John Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Years of Driving Experience
                                    </label>
                                    <select
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="less-1">Less than 1 year</option>
                                        <option value="1-3">1-3 years</option>
                                        <option value="3-5">3-5 years</option>
                                        <option value="5+">5+ years</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setApplicationStep(2)}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Next: Vehicle Info →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {applicationStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Your Vehicle Type
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {vehicleTypes.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setFormData({ ...formData, vehicleType: vehicle.id })}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.vehicleType === vehicle.id
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{vehicle.icon}</div>
                                        <div className="font-medium text-gray-900">{vehicle.name}</div>
                                        <div className="text-xs text-gray-500">{vehicle.requirement}</div>
                                    </button>
                                ))}
                            </div>

                            {formData.vehicleType && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License/Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Enter your license number"
                                    />
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setApplicationStep(1)}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setApplicationStep(3)}
                                    disabled={!formData.vehicleType}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next: Review →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {applicationStep === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Application Summary</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Name:</div>
                                    <div>{formData.fullName || '-'}</div>
                                    <div className="text-gray-500">Email:</div>
                                    <div>{formData.email || '-'}</div>
                                    <div className="text-gray-500">Phone:</div>
                                    <div>{formData.phone || '-'}</div>
                                    <div className="text-gray-500">Vehicle:</div>
                                    <div>
                                        {vehicleTypes.find(v => v.id === formData.vehicleType)?.name || '-'}
                                    </div>
                                    <div className="text-gray-500">Experience:</div>
                                    <div>{formData.experience || '-'}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <label className="text-sm text-gray-600">
                                    I agree to the Terms of Service and confirm that all information provided is accurate.
                                </label>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setApplicationStep(2)}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Driver Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-emerald-500">✓</span> Must be 18+ years old
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-emerald-500">✓</span> Valid government-issued ID
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-emerald-500">✓</span> Smartphone with data plan
                        </li>
                    </ul>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-emerald-500">✓</span> Clean driving record
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-emerald-500">✓</span> Vehicle insurance (if applicable)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-emerald-500">✓</span> Background check clearance
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
