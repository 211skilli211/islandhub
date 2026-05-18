'use client';

import Link from 'next/link';
import { ShoppingBag, Wallet, MessageSquare, Heart, Package, Truck, Star, CreditCard, Car, FileText, Settings } from 'lucide-react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    secondaryActionLabel?: string;
    secondaryActionHref?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, secondaryActionLabel, secondaryActionHref }: EmptyStateProps) {
    return (
        <div className="text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-3xl mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{description}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {actionLabel && actionHref && (
                    <Link
                        href={actionHref}
                        className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors"
                    >
                        {actionLabel}
                    </Link>
                )}
                {secondaryActionLabel && secondaryActionHref && (
                    <Link
                        href={secondaryActionHref}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        {secondaryActionLabel}
                    </Link>
                )}
            </div>
        </div>
    );
}

// Buyer Empty States
export function EmptyOrders() {
    return (
        <EmptyState
            icon={<ShoppingBag className="w-10 h-10 text-slate-400" />}
            title="No orders yet"
            description="When you place an order, it will appear here. Start browsing to find what you need!"
            actionLabel="Start Shopping"
            actionHref="/listings"
        />
    );
}

export function EmptyWallet() {
    return (
        <EmptyState
            icon={<Wallet className="w-10 h-10 text-slate-400" />}
            title="Your wallet is empty"
            description="Add funds to your wallet to make purchases faster and easier."
            actionLabel="Add Funds"
            actionHref="/dashboard?tab=wallet"
        />
    );
}

export function EmptyMessages() {
    return (
        <EmptyState
            icon={<MessageSquare className="w-10 h-10 text-slate-400" />}
            title="No messages"
            description="When vendors or customers message you, conversations will appear here."
            actionLabel="Browse Stores"
            actionHref="/stores"
        />
    );
}

export function EmptyWishlist() {
    return (
        <EmptyState
            icon={<Heart className="w-10 h-10 text-slate-400" />}
            title="Your wishlist is empty"
            description="Save items you love by clicking the heart icon. They'll appear here for easy access."
            actionLabel="Explore Marketplace"
            actionHref="/listings"
        />
    );
}

export function EmptyActivity() {
    return (
        <EmptyState
            icon={<FileText className="w-10 h-10 text-slate-400" />}
            title="No recent activity"
            description="Your recent activity will appear here. Start shopping to see your history!"
            actionLabel="Start Shopping"
            actionHref="/listings"
        />
    );
}

// Vendor Empty States
export function EmptyProducts() {
    return (
        <EmptyState
            icon={<Package className="w-10 h-10 text-slate-400" />}
            title="No products yet"
            description="Add your first product to start selling on IslandHub. It only takes a few minutes!"
            actionLabel="Add Product"
            actionHref="/create?type=product"
        />
    );
}

export function EmptyVendorOrders() {
    return (
        <EmptyState
            icon={<ShoppingBag className="w-10 h-10 text-slate-400" />}
            title="No orders yet"
            description="When customers place orders, they'll appear here. Make sure your products are visible!"
            actionLabel="View Products"
            actionHref="/dashboard?tab=menu"
            secondaryActionLabel="Marketing Tips"
            secondaryActionHref="/dashboard?tab=promotions"
        />
    );
}

export function EmptyAnalytics() {
    return (
        <EmptyState
            icon={<FileText className="w-10 h-10 text-slate-400" />}
            title="No analytics data yet"
            description="Analytics will appear here once you start getting views and sales. Check back soon!"
        />
    );
}

export function EmptyPayouts() {
    return (
        <EmptyState
            icon={<CreditCard className="w-10 h-10 text-slate-400" />}
            title="No payouts yet"
            description="Payouts will appear here once you complete sales and the holding period ends."
        />
    );
}

// Driver Empty States
export function EmptyTrips() {
    return (
        <EmptyState
            icon={<Car className="w-10 h-10 text-slate-400" />}
            title="No trips yet"
            description="Go online to start receiving trip requests. Make sure your vehicle is registered!"
            actionLabel="Go Online"
            actionHref="/driver/app"
        />
    );
}

export function EmptyEarnings() {
    return (
        <EmptyState
            icon={<CreditCard className="w-10 h-10 text-slate-400" />}
            title="No earnings yet"
            description="Complete trips to start earning. Your earnings will be displayed here."
        />
    );
}

export function EmptyRatings() {
    return (
        <EmptyState
            icon={<Star className="w-10 h-10 text-slate-400" />}
            title="No ratings yet"
            description="After customers rate your trips, your ratings will appear here. Keep up the great work!"
        />
    );
}

export function EmptyVehicle() {
    return (
        <EmptyState
            icon={<Truck className="w-10 h-10 text-slate-400" />}
            title="No vehicle registered"
            description="Register your vehicle to start accepting trips. You'll need your registration and insurance."
            actionLabel="Register Vehicle"
            actionHref="/dashboard?tab=vehicle"
        />
    );
}

// Generic Empty State for custom use
export function EmptySearch() {
    return (
        <EmptyState
            icon={<span className="text-4xl">🔍</span>}
            title="No results found"
            description="Try adjusting your search or filters to find what you're looking for."
        />
    );
}

export function EmptyStore() {
    return (
        <EmptyState
            icon={<span className="text-4xl">🏪</span>}
            title="Store not found"
            description="This store doesn't exist or has been removed. Browse other stores to find what you need."
            actionLabel="Browse Stores"
            actionHref="/stores"
        />
    );
}

export function EmptyCoops() {
    return (
        <EmptyState
            icon={<span className="text-4xl">🤝</span>}
            title="No cooperatives yet"
            description="Cooperatives are groups of businesses working together. Be the first to start one!"
            actionLabel="Create Co-op"
            actionHref="/community/coops/create"
        />
    );
}
