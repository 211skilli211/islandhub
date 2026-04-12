import { z } from 'zod';

// Common reusable validators
export const commonValidators = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format').min(5).max(254),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain: 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&)'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999999.99, 'Price is too high'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(1000, 'Quantity exceeds maximum limit'),
  url: z.string().url('Invalid URL format'),
  pagination: z.object({
    page: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Page must be positive'),
    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 20)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  }),
  idParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
};

// Role categories for registration
const roleCategories = {
    buyer: 'buyer',
    vendor: z.enum(['vendor_product', 'vendor_food', 'vendor_service', 'vendor_other']),
    driver: z.enum(['driver_taxi', 'driver_delivery', 'driver_tour']),
    creator: 'creator',
    sponsor: 'sponsor',
    donor: 'donor',
    rider: 'rider',
};

// Auth schemas
export const authSchemas = {
    register: z.object({
        name: commonValidators.name,
        email: commonValidators.email,
        password: commonValidators.password,
        role: z.enum(['buyer', 'vendor_product', 'vendor_food', 'vendor_service', 'vendor_other', 'creator', 'sponsor', 'donor', 'driver_taxi', 'driver_delivery', 'driver_tour', 'driver_service', 'rider'])
            .optional()
            .default('buyer'),
        role_category: z.enum(['buyer', 'vendor', 'driver', 'creator', 'sponsor', 'donor']).optional(),
        vendor_category: z.enum(['product', 'food', 'service', 'other']).optional(),
        driver_category: z.enum(['taxi', 'delivery', 'tour', 'service']).optional(),
        custom_category: z.string().max(100).optional(),
    }),

  login: z.object({
    email: commonValidators.email,
    password: z.string().min(1, 'Password is required').max(128),
  }),

  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required').max(512),
  }),

  forgotPassword: z.object({
    email: commonValidators.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: commonValidators.password,
  }),

  updateRole: z.object({
    userId: commonValidators.id.optional(), // Optional - can be derived from JWT token
    role: z.enum(['buyer', 'vendor', 'sponsor', 'admin', 'creator', 'donor', 'driver', 'rider']),
  }),
};

// User schemas
export const userSchemas = {
  updateProfile: z.object({
    name: commonValidators.name.optional(),
    email: commonValidators.email.optional(),
    phone: commonValidators.phone.optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    avatar_url: commonValidators.url.optional(),
    country: z.string().min(2).max(100).optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonValidators.password,
  }),

  updateSettings: z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
  }),
};

// Store schemas
export const storeSchemas = {
  create: z.object({
    name: z.string().min(3, 'Store name must be at least 3 characters').max(100),
    slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    description: z.string().min(10).max(2000).optional(),
    category: z.string().min(1).max(50),
    logo_url: commonValidators.url.optional(),
    banner_url: commonValidators.url.optional(),
    address: z.object({
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      zipCode: z.string().min(1).max(20),
      country: z.string().min(1).max(100),
    }).optional(),
    phone: commonValidators.phone.optional(),
    email: commonValidators.email.optional(),
    business_hours: z.record(z.string(), z.object({
      open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: z.boolean(),
    })).optional(),
  }),

  update: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    logo_url: commonValidators.url.optional(),
    banner_url: commonValidators.url.optional(),
    address: z.object({
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      zipCode: z.string().min(1).max(20),
      country: z.string().min(1).max(100),
    }).optional(),
    phone: commonValidators.phone.optional(),
    email: commonValidators.email.optional(),
    business_hours: z.record(z.string(), z.object({
      open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: z.boolean(),
    })).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
};

// Listing schemas
export const listingSchemas = {
  create: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: commonValidators.price,
    compare_at_price: commonValidators.price.optional(),
    cost_per_item: commonValidators.price.optional(),
    type: z.enum(['product', 'service', 'rental']),
    category: z.string().min(1).max(100),
    sub_category: z.string().max(100).optional(),
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    images: z.array(commonValidators.url).max(10),
    featured_image: commonValidators.url.optional(),
    inventory_quantity: z.number().int().min(0).optional(),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    weight: z.number().positive().optional(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional(),
    requires_shipping: z.boolean().optional(),
    shipping_profile_id: z.string().uuid().optional(),
    attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    seo_title: z.string().max(70).optional(),
    seo_description: z.string().max(320).optional(),
    meta_keywords: z.array(z.string()).max(10).optional(),
  }),

  update: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: commonValidators.price.optional(),
    compare_at_price: commonValidators.price.optional(),
    category: z.string().min(1).max(100).optional(),
    sub_category: z.string().max(100).optional(),
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    images: z.array(commonValidators.url).max(10).optional(),
    featured_image: commonValidators.url.optional(),
    inventory_quantity: z.number().int().min(0).optional(),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    weight: z.number().positive().optional(),
    requires_shipping: z.boolean().optional(),
    attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
  }),

  search: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    type: z.enum(['product', 'service', 'rental']).optional(),
    minPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    maxPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    location: z.string().optional(),
    store_id: z.string().uuid().optional(),
    sort_by: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popular']).optional(),
    ...commonValidators.pagination.shape,
  }),
};

// Order schemas
export const orderSchemas = {
  create: z.object({
    items: z.array(z.object({
      listing_id: z.string().uuid(),
      quantity: commonValidators.quantity,
      variant_id: z.string().uuid().optional(),
      selected_options: z.record(z.string(), z.string()).optional(),
    })).min(1, 'At least one item is required'),
    shipping_address: z.object({
      name: z.string().min(1).max(200),
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      zipCode: z.string().min(1).max(20),
      country: z.string().min(1).max(100),
      phone: commonValidators.phone,
    }),
    billing_address: z.object({
      name: z.string().min(1).max(200),
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      zipCode: z.string().min(1).max(20),
      country: z.string().min(1).max(100),
    }).optional(),
    payment_method: z.enum(['stripe', 'paypal', 'wipay', 'crypto', 'dodo']),
    currency: z.string().length(3).default('USD'),
    notes: z.string().max(1000).optional(),
    gift_message: z.string().max(500).optional(),
    discount_code: z.string().max(50).optional(),
  }),

  updateStatus: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    tracking_number: z.string().max(100).optional(),
    tracking_url: commonValidators.url.optional(),
    carrier: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
  }),

  cancel: z.object({
    reason: z.enum(['customer_request', 'out_of_stock', 'fraudulent', 'other']),
    notes: z.string().max(500).optional(),
  }),

  refund: z.object({
    amount: commonValidators.price,
    reason: z.enum(['customer_request', 'damaged', 'not_as_described', 'out_of_stock', 'fraudulent', 'other']),
    notes: z.string().max(500).optional(),
  }),
};

// Cart schemas
export const cartSchemas = {
  addItem: z.object({
    listing_id: z.string().uuid(),
    quantity: commonValidators.quantity,
    variant_id: z.string().uuid().optional(),
    selected_options: z.record(z.string(), z.string()).optional(),
  }),

  updateItem: z.object({
    quantity: commonValidators.quantity,
  }),

  updateSettings: z.object({
    shipping_address: z.object({
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      zipCode: z.string().min(1).max(20),
      country: z.string().min(1).max(100),
    }).optional(),
    discount_code: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
  }),
};

// Campaign schemas
export const campaignSchemas = {
  create: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(50, 'Description must be at least 50 characters').max(10000),
    goal_amount: z.number().positive().max(1000000000),
    category: z.string().min(1).max(100),
    end_date: z.string().datetime().optional(),
    images: z.array(commonValidators.url).max(10),
    featured_image: commonValidators.url,
    video_url: commonValidators.url.optional(),
    location: z.string().min(1).max(200),
    tags: z.array(z.string().max(50)).max(20).optional(),
    risks: z.string().max(2000).optional(),
    faq: z.array(z.object({
      question: z.string().max(500),
      answer: z.string().max(2000),
    })).max(20).optional(),
  }),

  update: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(50).max(10000).optional(),
    category: z.string().min(1).max(100).optional(),
    images: z.array(commonValidators.url).max(10).optional(),
    featured_image: commonValidators.url.optional(),
    video_url: commonValidators.url.optional().nullable(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    risks: z.string().max(2000).optional(),
    status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  }),

  donate: z.object({
    amount: z.number().positive().min(1).max(1000000),
    message: z.string().max(500).optional(),
    anonymous: z.boolean().optional(),
    payment_method: z.enum(['stripe', 'paypal', 'crypto']),
  }),
};

// Review schemas
export const reviewSchemas = {
  create: z.object({
    listing_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(3).max(100).optional(),
    content: z.string().min(10).max(2000),
    images: z.array(commonValidators.url).max(5).optional(),
    recommend: z.boolean().optional(),
  }),

  update: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(3).max(100).optional(),
    content: z.string().min(10).max(2000).optional(),
    images: z.array(commonValidators.url).max(5).optional(),
  }),

  reply: z.object({
    content: z.string().min(10).max(1000),
  }),
};

// Payment schemas
export const paymentSchemas = {
  createIntent: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    order_id: z.string().uuid().optional(),
    campaign_id: z.string().uuid().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
  }),

  confirm: z.object({
    payment_intent_id: z.string(),
    payment_method_id: z.string().optional(),
  }),

  webhook: z.object({
    type: z.string(),
    data: z.object({
      id: z.string(),
      status: z.string(),
    }),
  }),
};

// Search schemas
export const searchSchemas = {
  global: z.object({
    q: z.string().min(1).max(100),
    type: z.enum(['all', 'listings', 'stores', 'campaigns', 'users']).default('all'),
    ...commonValidators.pagination.shape,
  }),
};

// Admin schemas
export const adminSchemas = {
  updateSettings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),

  moderateContent: z.object({
    content_id: z.string().uuid(),
    content_type: z.enum(['listing', 'review', 'campaign', 'user']),
    action: z.enum(['approve', 'reject', 'suspend']),
    reason: z.string().max(500).optional(),
  }),

  createAnnouncement: z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(10).max(5000),
    type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
    target_audience: z.enum(['all', 'vendors', 'buyers', 'admins']).default('all'),
    expires_at: z.string().datetime().optional(),
  }),
};

// Export all schemas
export const schemas = {
  common: commonValidators,
  auth: authSchemas,
  user: userSchemas,
  store: storeSchemas,
  listing: listingSchemas,
  order: orderSchemas,
  cart: cartSchemas,
  campaign: campaignSchemas,
  review: reviewSchemas,
  payment: paymentSchemas,
  search: searchSchemas,
  admin: adminSchemas,
};

export default schemas;
