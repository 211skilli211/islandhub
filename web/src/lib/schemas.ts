export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'textarea' | 'repeatable_section' | 'variant_manager' | 'calendar_builder' | 'seasonal_rates';

export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string }[];
    required?: boolean;
    helperText?: string;
    schema?: FormField[]; // Used for repeatable_section items
}

export interface CategorySchema {
    fields: FormField[];
}

export const CATEGORY_SCHEMAS: Record<string, Record<string, CategorySchema>> = {
    rentals: {
        'Car': {
            fields: [
                { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: [{ label: 'Car / Sedan', value: 'car' }, { label: 'SUV', value: 'suv' }, { label: 'Truck', value: 'truck' }, { label: 'Motorcycle', value: 'motorcycle' }, { label: 'Scooter / Moped', value: 'scooter' }, { label: 'Bicycle', value: 'bicycle' }, { label: 'RV / Camper', value: 'rv' }, { label: 'Van', value: 'van' }], required: true },
                { name: 'make', label: 'Make', type: 'text', placeholder: 'e.g. Toyota', required: true },
                { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Corolla', required: true },
                { name: 'year', label: 'Year', type: 'number', placeholder: 'e.g. 2022', required: true },
                { name: 'seats', label: 'Seats', type: 'number', required: true },
                { name: 'transmission', label: 'Transmission', type: 'select', options: [{ label: 'Automatic', value: 'auto' }, { label: 'Manual', value: 'manual' }] },
                { name: 'rental_duration', label: 'Rental Duration', type: 'select', options: [{ label: 'Hourly', value: 'hourly' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }], required: true },
                { name: 'min_rental_period', label: 'Min. Rental Period (days)', type: 'number' },
                { name: 'max_rental_period', label: 'Max. Rental Period (days)', type: 'number' },
                { name: 'security_deposit', label: 'Security Deposit ($)', type: 'number' },
                { name: 'usage_limit', label: 'Mileage / Usage Limit', type: 'text', placeholder: 'e.g., 100 miles/day' },
                { name: 'insurance_included', label: 'Insurance Included?', type: 'boolean' },
                { name: 'price_per_day', label: 'Daily Rate ($)', type: 'number', required: true },
                { name: 'weekly_rate', label: 'Weekly Rate ($)', type: 'number', helperText: 'Discounted rate for 7+ days.' },
            ]
        },
        'Apartment': {
            fields: [
                { name: 'property_type', label: 'Property Type', type: 'select', options: [{ label: 'Apartment', value: 'apartment' }, { label: 'House', value: 'house' }, { label: 'Villa', value: 'villa' }, { label: 'Cottage', value: 'cottage' }, { label: 'Studio', value: 'studio' }, { label: 'Private Room', value: 'room' }, { label: 'Guesthouse', value: 'guesthouse' }], required: true },
                { name: 'bedrooms', label: 'Bedrooms', type: 'select', options: [{ label: 'Studio', value: 'studio' }, { label: '1 Bedroom', value: '1' }, { label: '2 Bedrooms', value: '2' }, { label: '3 Bedrooms', value: '3' }, { label: '4+ Bedrooms', value: '4' }], required: true },
                { name: 'bathrooms', label: 'Bathrooms', type: 'select', options: [{ label: '1 Bathroom', value: '1' }, { label: '2 Bathrooms', value: '2' }, { label: '3+ Bathrooms', value: '3' }], required: true },
                { name: 'guests', label: 'Max Guests', type: 'number', required: true },
                { name: 'amenities', label: 'Amenities', type: 'multiselect', options: [{ label: 'WiFi', value: 'wifi' }, { label: 'Pool', value: 'pool' }, { label: 'AC', value: 'ac' }, { label: 'Kitchen', value: 'kitchen' }, { label: 'Parking', value: 'parking' }, { label: 'Beach Access', value: 'beach' }, { label: 'Ocean View', value: 'ocean_view' }, { label: 'Washer/Dryer', value: 'washer' }] },
                { name: 'rental_duration', label: 'Rental Duration', type: 'select', options: [{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }, { label: 'Custom', value: 'custom' }], required: true },
                { name: 'min_rental_period', label: 'Min. Rental Period (days)', type: 'number' },
                { name: 'max_rental_period', label: 'Max. Rental Period (days)', type: 'number' },
                { name: 'security_deposit', label: 'Security Deposit ($)', type: 'number' },
                { name: 'seasonal_rates', label: 'Seasonal Pricing', type: 'seasonal_rates', helperText: 'Set rates for Peak/Off-Peak seasons.' },
            ]
        },
        'Boat': {
            fields: [
                { name: 'watercraft_type', label: 'Watercraft Type', type: 'select', options: [{ label: 'Speedboat', value: 'speedboat' }, { label: 'Sailboat', value: 'sailboat' }, { label: 'Catamaran', value: 'catamaran' }, { label: 'Yacht', value: 'yacht' }, { label: 'Jet Ski', value: 'jetski' }, { label: 'Kayak / Canoe', value: 'kayak' }, { label: 'Paddleboard', value: 'paddleboard' }, { label: 'Fishing Boat', value: 'fishing' }], required: true },
                { name: 'length', label: 'Length (ft)', type: 'number' },
                { name: 'capacity', label: 'Passenger Capacity', type: 'number', required: true },
                { name: 'captain_included', label: 'Captain Included?', type: 'boolean', required: true },
                { name: 'crew', label: 'Crew Members', type: 'number', helperText: 'Number of additional crew.' },
                { name: 'features', label: 'Features', type: 'multiselect', options: [{ label: 'Snorkel Gear', value: 'snorkel' }, { label: 'Fishing Rods', value: 'fish' }, { label: 'Stereo System', value: 'music' }, { label: 'Bathroom', value: 'wc' }, { label: 'Cooler', value: 'cooler' }, { label: 'BBQ Grill', value: 'bbq' }] },
                { name: 'rental_duration', label: 'Rental Duration', type: 'select', options: [{ label: 'Hourly', value: 'hourly' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }], required: true },
                { name: 'min_rental_period', label: 'Min. Rental Period (hours)', type: 'number' },
                { name: 'max_rental_period', label: 'Max. Rental Period (hours)', type: 'number' },
                { name: 'security_deposit', label: 'Security Deposit ($)', type: 'number' },
                { name: 'rates', label: 'Charter Rates', type: 'repeatable_section', schema: [{ name: 'duration', label: 'Duration (e.g. 4 Hours)', type: 'text' }, { name: 'price', label: 'Price ($)', type: 'number' }] },
            ]
        },
        'Jet Ski': {
            fields: [
                { name: 'make', label: 'Make/Model', type: 'text', required: true },
                { name: 'riders', label: 'Max Riders', type: 'number', required: true },
                { name: 'life_jackets', label: 'Life Jackets Included?', type: 'boolean', required: true },
                { name: 'deposit', label: 'Security Deposit ($)', type: 'number', required: true },
                { name: 'duration_rates', label: 'Hourly Rates', type: 'repeatable_section', schema: [{ name: 'time', label: 'Time (e.g. 30 mins)', type: 'text' }, { name: 'price', label: 'Price ($)', type: 'number' }] },
            ]
        },
        'Equipment': {
            fields: [
                { name: 'equipment_category', label: 'Equipment Category', type: 'select', options: [{ label: 'Power Tools', value: 'power-tools' }, { label: 'Hand Tools', value: 'hand-tools' }, { label: 'Gardening Equipment', value: 'gardening' }, { label: 'Construction Equipment', value: 'construction' }, { label: 'Party & Event Equipment', value: 'party' }, { label: 'Sports Equipment', value: 'sports' }, { label: 'Audio/Visual Equipment', value: 'audio' }], required: true },
                { name: 'condition', label: 'Condition', type: 'select', options: [{ label: 'New', value: 'new' }, { label: 'Excellent', value: 'excellent' }, { label: 'Good', value: 'good' }, { label: 'Fair', value: 'fair' }], required: true },
                { name: 'deposit', label: 'Security Deposit ($)', type: 'number', required: true },
                { name: 'usage_guide', label: 'Usage / Safety Instructions', type: 'textarea' },
                { name: 'rental_duration', label: 'Rental Duration', type: 'select', options: [{ label: 'Hourly', value: 'hourly' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }], required: true },
                { name: 'min_rental_period', label: 'Min. Rental Period', type: 'number' },
                { name: 'max_rental_period', label: 'Max. Rental Period', type: 'number' },
            ]
        }
    },
    services: {
        'Professional': {
            fields: [
                { name: 'provider_type', label: 'Provider Type', type: 'select', options: [{ label: 'Store / Business', value: 'store' }, { label: 'Independent Provider', value: 'individual' }], required: true },
                { name: 'provider_name', label: 'Provider / Business Name', type: 'text' },
                { name: 'service_name', label: 'Service Name', type: 'text', required: true },
                { name: 'specialization', label: 'Specialty Area', type: 'text', placeholder: 'e.g. Legal, Plumbing, Design' },
                { name: 'service_area', label: 'Service Area', type: 'select', options: [{ label: 'Local (Within my area)', value: 'local' }, { label: 'Regional (Nearby towns)', value: 'regional' }, { label: 'Island-wide', value: 'island-wide' }, { label: 'Remote/Online Only', value: 'remote' }], required: true },
                { name: 'experience_level', label: 'Experience Level', type: 'select', options: [{ label: 'Entry Level (0-2 years)', value: 'entry' }, { label: 'Intermediate (2-5 years)', value: 'intermediate' }, { label: 'Experienced (5-10 years)', value: 'experienced' }, { label: 'Expert (10+ years)', value: 'expert' }, { label: 'Certified Professional', value: 'certified' }], required: true },
                { name: 'response_time', label: 'Response Time', type: 'select', options: [{ label: 'Within 1 hour', value: 'immediate' }, { label: 'Within 4 hours', value: 'fast' }, { label: 'Within 24 hours', value: 'standard' }, { label: 'Within 48 hours', value: 'slow' }], required: true },
                { name: 'rate_type', label: 'Rate Type', type: 'select', options: [{ label: 'Hourly', value: 'hourly' }, { label: 'Flat Fee', value: 'flat' }, { label: 'Quote Based', value: 'quote' }], required: true },
                { name: 'base_rate', label: 'Base Rate ($)', type: 'number' },
                { name: 'portfolio_url', label: 'Portfolio / Website URL', type: 'text' },
                { name: 'availability', label: 'Typical Availability', type: 'calendar_builder' },
            ]
        },
        'Tour': {
            fields: [
                { name: 'tour_type', label: 'Tour Type', type: 'select', options: [{ label: 'General / Shared', value: 'general' }, { label: 'Private', value: 'private' }], required: true },
                {
                    name: 'tour_category', label: 'Tour Category', type: 'select', options: [
                        { label: 'Land & Culture', value: 'land' },
                        { label: 'Sea & Aquatic', value: 'sea' },
                        { label: 'Rail & Scenic', value: 'rail' },
                        { label: 'Adventure', value: 'adventure' },
                        { label: 'Charter', value: 'charter' },
                        { label: 'Culture', value: 'culture' }
                    ], required: true
                },
                { name: 'tour_duration', label: 'Tour Duration', type: 'select', options: [{ label: 'Short (1-2 hours)', value: 'short' }, { label: 'Half Day (3-5 hours)', value: 'half-day' }, { label: 'Full Day (6-8 hours)', value: 'full-day' }, { label: 'Multi-Day', value: 'multi-day' }], required: true },
                { name: 'capacity', label: 'Max Group Size', type: 'number', required: true },
                { name: 'difficulty_level', label: 'Difficulty Level', type: 'select', options: [{ label: 'Easy - All fitness levels', value: 'easy' }, { label: 'Moderate - Some walking', value: 'moderate' }, { label: 'Strenuous - Physical activity', value: 'strenuous' }, { label: 'Expert - High fitness required', value: 'expert' }] },
                { name: 'tour_inclusions', label: 'Inclusions (What\'s Included)', type: 'multiselect', options: [{ label: 'Meals', value: 'Meals' }, { label: 'Drinks', value: 'Drinks' }, { label: 'Equipment', value: 'Equipment' }, { label: 'Guide', value: 'Guide' }, { label: 'Transportation', value: 'Transportation' }, { label: 'Photos/Video', value: 'Photos/Video' }, { label: 'Entrance Fees', value: 'Entrance Fees' }, { label: 'Insurance', value: 'Insurance' }] },
                { name: 'tour_non_inclusions', label: 'Non-Inclusions (What\'s NOT Included)', type: 'multiselect', options: [{ label: 'Gratuities/Tips', value: 'Gratuities/Tips' }, { label: 'Personal Expenses', value: 'Personal Expenses' }, { label: 'Souvenirs', value: 'Souvenirs' }, { label: 'Alcoholic Drinks', value: 'Alcoholic Drinks' }, { label: 'Optional Activities', value: 'Optional Activities' }, { label: 'Travel Insurance', value: 'Travel Insurance' }] },
                { name: 'location', label: 'Meeting / Pickup Point', type: 'text', required: true },
                { name: 'tour_schedule', label: 'Tour Schedule', type: 'select', options: [{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Bi-Weekly', value: 'bi-weekly' }, { label: 'Weekends Only', value: 'weekends' }, { label: 'Custom Schedule', value: 'custom' }, { label: 'On Demand (Book anytime)', value: 'on-demand' }] },
                {
                    name: 'addons', label: 'Optional Add-ons', type: 'repeatable_section', schema: [
                        { name: 'name', label: 'Add-on Name', type: 'text' },
                        { name: 'price', label: 'Price ($)', type: 'number' }
                    ]
                },
                { name: 'schedule', label: 'Tour Schedule', type: 'calendar_builder' },
            ]
        },
        'Taxi': {
            fields: [
                { name: 'provider_type', label: 'Provider Type', type: 'select', options: [{ label: 'Store / Business', value: 'store' }, { label: 'Independent Provider', value: 'individual' }], required: true },
                { name: 'vehicle_category', label: 'Vehicle Class', type: 'select', options: [{ label: 'Standard Car', value: 'car' }, { label: 'SUV / Minivan', value: 'suv' }], required: true },
                { name: 'capacity', label: 'Passenger Capacity', type: 'number', required: true },
                { name: 'service_area', label: 'Service Area', type: 'select', options: [{ label: 'Local (Within my area)', value: 'local' }, { label: 'Regional (Nearby towns)', value: 'regional' }, { label: 'Island-wide', value: 'island-wide' }], required: true },
                { name: 'pickup_location', label: 'Operating Area / Base', type: 'text', placeholder: 'e.g. Basseterre / Frigate Bay', required: true },
            ]
        },
        'Pickup': {
            fields: [
                { name: 'provider_type', label: 'Provider Type', type: 'select', options: [{ label: 'Store / Business', value: 'store' }, { label: 'Independent Provider', value: 'individual' }], required: true },
                { name: 'vehicle_category', label: 'Vehicle Type', type: 'select', options: [{ label: 'SUV / Minivan', value: 'suv' }, { label: 'Truck / Van', value: 'truck' }], required: true },
                { name: 'max_weight', label: 'Max Weight Capacity (lbs)', type: 'number' },
                { name: 'service_area', label: 'Service Area', type: 'select', options: [{ label: 'Local (Within my area)', value: 'local' }, { label: 'Regional (Nearby towns)', value: 'regional' }, { label: 'Island-wide', value: 'island-wide' }], required: true },
                { name: 'pickup_location', label: 'Operating Area', type: 'text', required: true },
            ]
        },
        'Delivery': {
            fields: [
                { name: 'provider_type', label: 'Provider Type', type: 'select', options: [{ label: 'Store / Business', value: 'store' }, { label: 'Independent Provider', value: 'individual' }], required: true },
                { name: 'vehicle_category', label: 'Delivery Vehicle', type: 'select', options: [{ label: 'Scooter / Bike', value: 'scooter' }, { label: 'Standard Car', value: 'car' }, { label: 'SUV / Truck', value: 'suv' }], required: true },
                { name: 'service_radius', label: 'Service Radius (miles)', type: 'number' },
                { name: 'service_area', label: 'Service Area', type: 'select', options: [{ label: 'Local (Within my area)', value: 'local' }, { label: 'Regional (Nearby towns)', value: 'regional' }, { label: 'Island-wide', value: 'island-wide' }], required: true },
                { name: 'pickup_location', label: 'Operating Area', type: 'text', required: true },
            ]
        }
    },
    food: {
        'Restaurant': {
            fields: [
                { name: 'cuisine', label: 'Cuisine Style', type: 'text', placeholder: 'e.g. Caribbean Fusion', required: true },
                { name: 'dietary_options', label: 'Dietary Options', type: 'multiselect', options: [{ label: 'Vegan', value: 'vegan' }, { label: 'Vegetarian', value: 'veg' }, { label: 'Gluten Free', value: 'gf' }, { label: 'Halal', value: 'halal' }] },
                { name: 'opening_hours', label: 'Opening Hours', type: 'textarea', placeholder: 'Mon-Sun: 11am - 10pm' },
                { name: 'badges', label: 'Badges / Tags', type: 'multiselect', options: [{ label: 'Halal', value: 'halal' }, { label: 'Vegan Friendly', value: 'vegan_friendly' }, { label: 'Family Style', value: 'family' }, { label: 'Date Night', value: 'date_night' }, { label: 'Live Music', value: 'music' }] },
                {
                    name: 'menu',
                    label: 'Menu Builder',
                    type: 'repeatable_section',
                    schema: [
                        { name: 'category', label: 'Category Name', type: 'text', placeholder: 'e.g. Starters' },
                        {
                            name: 'items',
                            label: 'Dishes',
                            type: 'repeatable_section',
                            schema: [
                                { name: 'name', label: 'Dish Name', type: 'text', required: true },
                                { name: 'price', label: 'Price ($)', type: 'number', required: true },
                                { name: 'description', label: 'Description', type: 'textarea' },
                                { name: 'spicy', label: 'Spicy?', type: 'boolean' },
                                { name: 'vegan', label: 'Vegan?', type: 'boolean' },
                            ]
                        }
                    ]
                }
            ]
        }
    },
    campaign: {
        'Fundraiser': {
            fields: [
                { name: 'goal_amount', label: 'Target Goal Amount ($)', type: 'number', required: true },
                { name: 'beneficiary', label: 'Beneficiary (Who is this for?)', type: 'text', required: true },
                { name: 'start_date', label: 'Campaign Start Date', type: 'date', required: true },
                { name: 'end_date', label: 'Campaign End Date', type: 'date', required: true },
                { name: 'story', label: 'The Story (Extended)', type: 'textarea', required: true },
                { name: 'milestones', label: 'Milestones', type: 'repeatable_section', schema: [{ name: 'amount', label: 'Amount ($)', type: 'number' }, { name: 'description', label: 'What happens at this stage?', type: 'text' }] },
            ]
        }
    },
    donation: {
        'Community Contribution': {
            fields: [
                { name: 'goal_amount', label: 'Goal Amount ($)', type: 'number', required: true },
                { name: 'beneficiary', label: 'Beneficiary / Cause', type: 'text', required: true },
                { name: 'description', label: 'Tell the community why their help matters', type: 'textarea', required: true },
            ]
        }
    },
    products: {
        'Boutique': {
            fields: [
                { name: 'brand', label: 'Brand Name', type: 'text' },
                { name: 'material', label: 'Materials', type: 'text' },
                { name: 'catalogue_section', label: 'Catalogue Section', type: 'text', placeholder: 'e.g. New Arrivals, Men, Women' },
                { name: 'variants', label: 'Size & Color Options', type: 'variant_manager', helperText: 'Add variants like "Size: S, M, L" and "Color: Red, Blue".' },
            ]
        },
        'Retail/Produce': {
            fields: [
                { name: 'brand', label: 'Brand/Producer', type: 'text', placeholder: 'e.g. Island Organic Farms' },
                { name: 'origin', label: 'Origin', type: 'text', placeholder: 'e.g. St. Kitts' },
                { name: 'unit_type', label: 'Unit Type', type: 'select', options: [{ label: 'Weight (lb)', value: 'lb' }, { label: 'Weight (kg)', value: 'kg' }, { label: 'Per Unit (Each)', value: 'each' }, { label: 'Per Dozen', value: 'dozen' }, { label: 'Bunch', value: 'bunch' }] },
                { name: 'stock_quantity', label: 'Stock Level', type: 'number', required: true },
                { name: 'is_organic', label: 'Organic Certified?', type: 'boolean' },
                { name: 'harvest_date', label: 'Harvest/Batch Date', type: 'date' },
                { name: 'catalogue_section', label: 'Catalogue Section', type: 'text', placeholder: 'e.g. Fresh Produce, Dairy, Bakery' },
                { name: 'variants', label: 'Options/Variations', type: 'variant_manager', helperText: 'e.g. Ripeness: Ripe, Unripe' },
            ]
        }
    }
};
