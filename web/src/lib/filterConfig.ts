export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterSection {
    id: string;
    label: string;
    type: 'select' | 'radio' | 'checkbox' | 'range';
    options?: FilterOption[];
}

export interface CategoryConfig {
    title: string;
    description: string;
    icon: string;
    gradient?: string;
    filters: FilterSection[];
}

export const filterConfigs: Record<string, CategoryConfig> = {
    fund: {
        title: 'Support Community Projects',
        description: 'Make a difference in island communities. Fund education, environment, health, and cultural projects.',
        icon: '❤️',
        gradient: 'from-teal-500 to-teal-700',
        filters: [
            {
                id: 'category',
                label: 'Project Category',
                type: 'select',
                options: [
                    { label: 'All Projects', value: '' },
                    { label: 'Child Cancer', value: 'Child Cancer' },
                    { label: 'Co-op Startup', value: 'Co-op Startup' },
                    { label: 'Community Fundraiser', value: 'Community Fundraiser' },
                    { label: 'Education', value: 'Education' }
                ]
            }
        ]

    },
    food: {
        title: 'Island Flavors',
        description: 'From street food to fine dining. Order pickup or delivery from the best local spots.',
        icon: '🥘',
        gradient: 'from-orange-500 to-amber-500',
        filters: [
            {
                id: 'category',
                label: 'Cuisine Type',
                type: 'select',
                options: [
                    { label: 'All Cuisines', value: '' },
                    { label: 'Local / Caribbean', value: 'local' },
                    { label: 'Fast Food', value: 'fast_food' },
                    { label: 'Seafood', value: 'seafood' },
                    { label: 'Vegan / Ital', value: 'vegan' },
                    { label: 'Bakery & Sweets', value: 'bakery' }
                ]
            },
            {
                id: 'is_organic',
                label: 'Organic / Ital Only',
                type: 'checkbox'
            }
        ]
    },
    shop: {
        title: 'Shop Local Treasures',
        description: 'Discover authentic island products from local artisans. Every purchase supports a small business.',
        icon: '🛍️',
        gradient: 'from-orange-400 to-red-600',
        filters: [
            {
                id: 'category',
                label: 'Product Category',
                type: 'select',
                options: [
                    { label: 'All Categories', value: '' },
                    { label: 'Souvenirs', value: 'Souvenirs' },
                    { label: 'Clothing', value: 'Clothing' },
                    { label: 'Art & Crafts', value: 'Art' },
                    { label: 'Fresh Produce', value: 'Agro' }
                ]
            },
            {
                id: 'is_organic',
                label: 'Organic Certified',
                type: 'checkbox'
            }
        ]
    },
    rent: {
        title: 'Island Rentals',
        description: 'Find everything from boats to beach gear. Rent from verified local islanders.',
        icon: '🚤',
        gradient: 'from-blue-500 to-cyan-600',
        filters: [
            {
                id: 'category',
                label: 'Rental Type',
                type: 'select',
                options: [
                    { label: 'All Rentals', value: '' },
                    { label: 'Apartments & Vacation Homes', value: 'Apartment' },
                    { label: 'Cars', value: 'Car' },
                    { label: 'Boats', value: 'Boat' },
                    { label: 'Jet Skis', value: 'Jet Ski' },
                    { label: 'Equipment & Tools', value: 'Equipment' }
                ]
            },
            {
                id: 'instant_booking',
                label: 'Instant Booking',
                type: 'checkbox'
            }
        ]
    },
    book: {
        title: 'Experiences & Services',
        description: 'Book local tours, instructors, and professionals. Real islanders, real experiences.',
        icon: '⭐',
        gradient: 'from-indigo-500 to-purple-600',
        filters: [
            {
                id: 'category',
                label: 'Service Type',
                type: 'select',
                options: [
                    { label: 'All Services', value: '' },
                    { label: 'Professional Services', value: 'Professional' },
                    { label: 'Tours & Excursions', value: 'Tour' },
                    { label: 'Taxis & Transport', value: 'Taxi' },
                    { label: 'Pickup Services', value: 'Pickup' },
                    { label: 'Delivery Services', value: 'Delivery' }
                ]
            }
        ]
    },
    marketplace: {
        title: 'Island Marketplace',
        description: 'Discover everything the island has to offer. Food, products, and services from local vendors.',
        icon: '🌴',
        gradient: 'from-slate-800 to-slate-950',
        filters: [
            {
                id: 'type',
                label: 'Listing Type',
                type: 'select',
                options: [
                    { label: 'All Types', value: '' },
                    { label: 'Food & Dining', value: 'food' },
                    { label: 'Products', value: 'product' },
                    { label: 'Services', value: 'service' },
                    { label: 'Rentals', value: 'rental' }
                ]
            },
            {
                id: 'category',
                label: 'Discovery Category',
                type: 'select',
                options: [
                    { label: 'All Categories', value: '' },
                    { label: 'Food & Dining', value: 'Food & Dining' },
                    { label: 'Retail & Shopping', value: 'Retail & Shopping' },
                    { label: 'Professional Services', value: 'Professional Services' },
                    { label: 'Rentals & Property', value: 'Rentals & Property' },
                    { label: 'Tourism', value: 'Tourism' }
                ]
            }
        ]
    }
};
