export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'textarea' | 'repeatable_section';

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
                { name: 'make', label: 'Make', type: 'text', placeholder: 'e.g. Toyota', required: true },
                { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Corolla', required: true },
                { name: 'year', label: 'Year', type: 'number', placeholder: 'e.g. 2022', required: true },
                { name: 'insurance_included', label: 'Insurance Included?', type: 'boolean', required: true },
                { name: 'price_per_day', label: 'Price Per Day ($)', type: 'number', required: true },
                { name: 'transmission', label: 'Transmission', type: 'select', options: [{ label: 'Automatic', value: 'auto' }, { label: 'Manual', value: 'manual' }] },
            ]
        },
        'Apartment': {
            fields: [
                { name: 'property_type', label: 'Property Type', type: 'select', options: [{ label: 'Apartment', value: 'apartment' }, { label: 'Villa', value: 'villa' }, { label: 'Studio', value: 'studio' }], required: true },
                { name: 'rooms', label: 'Number of Rooms', type: 'number', required: true },
                { name: 'beds', label: 'Number of Beds', type: 'number', required: true },
                { name: 'guests', label: 'Max Guests', type: 'number', required: true },
                { name: 'amenities', label: 'Amenities', type: 'multiselect', options: [{ label: 'WiFi', value: 'wifi' }, { label: 'Pool', value: 'pool' }, { label: 'AC', value: 'ac' }, { label: 'Kitchen', value: 'kitchen' }] },
                { name: 'price_per_night', label: 'Price Per Night ($)', type: 'number', required: true },
            ]
        },
        'Jet Ski': {
            fields: [
                { name: 'make', label: 'Make/Brand', type: 'text', required: true },
                { name: 'power', label: 'Horsepower', type: 'text' },
                { name: 'life_jackets_included', label: 'Life Jackets Included?', type: 'boolean', required: true },
                { name: 'deposit', label: 'Security Deposit ($)', type: 'number' },
            ]
        },
        'Equipment': {
            fields: [
                { name: 'condition', label: 'Condition', type: 'select', options: [{ label: 'New', value: 'new' }, { label: 'Good', value: 'good' }, { label: 'Fair', value: 'fair' }], required: true },
                { name: 'deposit', label: 'Security Deposit ($)', type: 'number', required: true },
                { name: 'usage_instructions', label: 'Usage Instructions', type: 'textarea', placeholder: 'Any special care instructions?' },
            ]
        }
    },
    services: {
        'Professional': {
            fields: [
                { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Legal Consulting', required: true },
                { name: 'years_experience', label: 'Years of Experience', type: 'number' },
                { name: 'consultation_fee', label: 'Consultation Fee ($)', type: 'number' },
                { name: 'available_days', label: 'Available Days', type: 'multiselect', options: [{ label: 'Monday', value: 'mon' }, { label: 'Tuesday', value: 'tue' }, { label: 'Wednesday', value: 'wed' }, { label: 'Thursday', value: 'thu' }, { label: 'Friday', value: 'fri' }] },
            ]
        },
        'Tour': {
            fields: [
                { name: 'duration', label: 'Duration (hours)', type: 'number', required: true },
                { name: 'max_group_size', label: 'Max Group Size', type: 'number', required: true },
                { name: 'itinerary', label: 'Itinerary Summary', type: 'textarea', placeholder: 'What will guests see/do?' },
                { name: 'meeting_point', label: 'Meeting Point', type: 'text', required: true },
            ]
        }
    },
    food: {
        'Restaurant': {
            fields: [
                { name: 'cuisine', label: 'Cuisine Type', type: 'text', placeholder: 'e.g. Caribbean Fusion', required: true },
                { name: 'opening_hours', label: 'Opening Hours', type: 'text' },
                {
                    name: 'menu_sections',
                    label: 'Menu Sections',
                    type: 'repeatable_section',
                    schema: [
                        { name: 'section_name', label: 'Section Name', type: 'text', placeholder: 'e.g. Starters' },
                        {
                            name: 'items',
                            label: 'Items',
                            type: 'repeatable_section',
                            schema: [
                                { name: 'name', label: 'Item Name', type: 'text' },
                                { name: 'price', label: 'Price ($)', type: 'number' },
                                { name: 'description', label: 'Description', type: 'textarea' }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    products: {
        'Boutique': {
            fields: [
                { name: 'brand', label: 'Brand', type: 'text' },
                { name: 'material', label: 'Material', type: 'text' },
                {
                    name: 'catalogue_sections',
                    label: 'Catalogue Sections',
                    type: 'repeatable_section',
                    schema: [
                        { name: 'section_name', label: 'Section Name', type: 'text', placeholder: 'e.g. Dresses' },
                        {
                            name: 'items',
                            label: 'Items',
                            type: 'repeatable_section',
                            schema: [
                                { name: 'name', label: 'Product Name', type: 'text' },
                                { name: 'price', label: 'Price ($)', type: 'number' },
                                { name: 'sizes', label: 'Sizes', type: 'multiselect', options: [{ label: 'S', value: 'S' }, { label: 'M', value: 'M' }, { label: 'L', value: 'L' }, { label: 'XL', value: 'XL' }] },
                                { name: 'colors', label: 'Colors', type: 'text', placeholder: 'e.g. Blue, White' }
                            ]
                        }
                    ]
                }
            ]
        }
    }
};
估
