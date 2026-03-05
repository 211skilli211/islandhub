/**
 * IslandHub Agent Configuration
 * Maps user roles to ZeroClaw agent profiles with scoped tools.
 * Follows Context7 best practices: RBAC, least privilege, dynamic tool loading.
 */

export type AgentRole = 'customer' | 'vendor' | 'admin' | 'super-admin' | 'driver' | 'moderator';

export interface AgentProfile {
    /** ZeroClaw agent identifier */
    agent: string;
    /** Chat endpoint path (relative to gateway) */
    endpoint: string;
    /** Display name shown in UI */
    displayName: string;
    /** Greeting message */
    greeting: string;
    /** Input placeholder */
    placeholder: string;
    /** Header color (Tailwind class) */
    headerColor: string;
    /** Accent color (Tailwind class) */
    accentColor: string;
    /** Icon emoji */
    icon: string;
    /** Tools the agent is allowed to use */
    allowedTools: string[];
    /** Whether pairing code is required for sensitive operations */
    requiresPairing: boolean;
    /** Agent autonomy level */
    autonomyLevel: 'supervised' | 'semi' | 'full';
}

export const AGENT_PROFILES: Record<string, AgentProfile> = {
    customer: {
        agent: 'customer_service',
        endpoint: '/chat',
        displayName: 'IslandHub Assistant',
        greeting: 'Hello! I\'m your IslandHub assistant. How can I help you today?',
        placeholder: 'Ask anything about the islands...',
        headerColor: 'bg-teal-600',
        accentColor: 'teal',
        icon: '🏝️',
        allowedTools: ['search', 'track_order', 'find_stores', 'check_availability', 'recommendations'],
        requiresPairing: false,
        autonomyLevel: 'supervised',
    },
    vendor: {
        agent: 'vendor_helper',
        endpoint: '/chat/vendor',
        displayName: 'Vendor Assistant',
        greeting: 'Welcome back! I can help you manage your store, inventory, and orders.',
        placeholder: 'Ask about inventory, orders, analytics...',
        headerColor: 'bg-indigo-600',
        accentColor: 'indigo',
        icon: '🏪',
        allowedTools: ['inventory', 'orders', 'analytics', 'onboarding', 'webhooks', 'product_management'],
        requiresPairing: false,
        autonomyLevel: 'supervised',
    },
    admin: {
        agent: 'admin_console',
        endpoint: '/chat/admin',
        displayName: 'Admin Command Console',
        greeting: 'Admin Console active. All operations are logged and audited.',
        placeholder: 'Enter admin command or question...',
        headerColor: 'bg-slate-800',
        accentColor: 'slate',
        icon: '🛡️',
        allowedTools: [
            'dashboard_stats', 'audit_logs', 'user_management', 'vendor_management',
            'order_management', 'emergency_refund', 'export_data', 'agent_control'
        ],
        requiresPairing: true,
        autonomyLevel: 'supervised',
    },
    'super-admin': {
        agent: 'admin_console',
        endpoint: '/chat/admin',
        displayName: 'Super Admin Console',
        greeting: 'Super Admin Console active. Full platform control enabled.',
        placeholder: 'Full access — enter any command...',
        headerColor: 'bg-rose-700',
        accentColor: 'rose',
        icon: '👑',
        allowedTools: ['all'],
        requiresPairing: true,
        autonomyLevel: 'supervised',
    },
    driver: {
        agent: 'customer_service',
        endpoint: '/chat',
        displayName: 'Driver Assistant',
        greeting: 'Hey! I can help with deliveries, navigation, and order pickups.',
        placeholder: 'Ask about deliveries, routes...',
        headerColor: 'bg-amber-600',
        accentColor: 'amber',
        icon: '🚗',
        allowedTools: ['delivery_status', 'navigation', 'order_pickup', 'support'],
        requiresPairing: false,
        autonomyLevel: 'supervised',
    },
    moderator: {
        agent: 'directory_manager',
        endpoint: '/chat/moderator',
        displayName: 'Moderation Assistant',
        greeting: 'Moderation panel active. I can help review listings and vendor submissions.',
        placeholder: 'Review listings, check compliance...',
        headerColor: 'bg-purple-600',
        accentColor: 'purple',
        icon: '🔍',
        allowedTools: ['review_listings', 'compliance_check', 'flag_content', 'vendor_review'],
        requiresPairing: false,
        autonomyLevel: 'supervised',
    },
};

/** ZeroClaw gateway base URL */
export const AGENT_GATEWAY_URL = process.env.NEXT_PUBLIC_AGENT_GATEWAY_URL || 'http://localhost:3001';

/** Get agent profile for a given user role */
export function getAgentProfile(role?: string | null): AgentProfile {
    if (!role) return AGENT_PROFILES.customer;
    return AGENT_PROFILES[role] || AGENT_PROFILES.customer;
}

/** Check if a role should see the floating chat (vs. a dedicated panel) */
export function shouldShowFloatingChat(role?: string | null): boolean {
    if (!role) return true; // guests see floating chat
    return ['customer', 'driver', 'buyer', 'rider'].includes(role) || !AGENT_PROFILES[role];
}

/** Check if a role has admin-level agent access */
export function isAdminAgent(role?: string | null): boolean {
    return role === 'admin' || role === 'super-admin';
}

/** Check if a role has vendor-level agent access */
export function isVendorAgent(role?: string | null): boolean {
    return role === 'vendor';
}
