import { 
    LayoutDashboard, 
    Users, 
    Package, 
    ShoppingCart, 
    Store, 
    Settings, 
    BarChart3, 
    Truck, 
    Megaphone, 
    Shield, 
    FileText, 
    CreditCard, 
    Radio,
    DollarSign,
    Car,
    Image,
    UserCheck,
    Building2,
    PieChart,
    Megaphone,
    Bot,
    ClipboardList,
    FolderOpen,
    Archive
} from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    badge?: string;
    roles?: string[];
    children?: NavItem[];
}

export const adminNavItems: NavItem[] = [
    { 
        title: 'Overview', 
        href: '/admin/overview', 
        icon: 'LayoutDashboard'
    },
    { 
        title: 'Users', 
        href: '/admin/users', 
        icon: 'Users'
    },
    { 
        title: 'Listings', 
        href: '/admin/listings', 
        icon: 'Package'
    },
    { 
        title: 'Orders', 
        href: '/admin/orders', 
        icon: 'ShoppingCart'
    },
    { 
        title: 'Stores', 
        href: '/admin/stores', 
        icon: 'Store'
    },
    { 
        title: 'Analytics', 
        href: '/admin/analytics', 
        icon: 'BarChart3'
    },
    { 
        title: 'Dispatch', 
        href: '/admin/dispatch', 
        icon: 'Truck'
    },
    { 
        title: 'Campaigns', 
        href: '/admin/campaigns', 
        icon: 'Megaphone',
        children: [
            { title: 'Pending Review', href: '/admin/campaigns/pending', icon: 'Megaphone' }
        ]
    },
    { 
        title: 'Compliance', 
        href: '/admin/compliance', 
        icon: 'Shield',
        children: [
            { title: 'KYC Requests', href: '/admin/kyc', icon: 'UserCheck' },
            { title: 'KYB Verification', href: '/admin/kyb-verification', icon: 'Building2' },
            { title: 'Audit Logs', href: '/admin/logs', icon: 'ClipboardList' },
            { title: 'Analytics', href: '/admin/compliance-analytics', icon: 'PieChart' }
        ]
    },
    { 
        title: 'Revenue', 
        href: '/admin/revenue', 
        icon: 'DollarSign'
    },
    { 
        title: 'Payouts', 
        href: '/admin/payouts', 
        icon: 'CreditCard'
    },
    { 
        title: 'Drivers', 
        href: '/admin/drivers', 
        icon: 'Car'
    },
    { 
        title: 'Broadcasts', 
        href: '/admin/broadcasts', 
        icon: 'Radio'
    },
    { 
        title: 'Logistics', 
        href: '/admin/logistics', 
        icon: 'Truck'
    },
    { 
        title: 'Media', 
        href: '/admin/assets', 
        icon: 'Image',
        children: [
            { title: 'Hero Assets', href: '/admin/assets-hero', icon: 'Image' }
        ]
    },
    { 
        title: 'Ads', 
        href: '/admin/ads', 
        icon: 'Megaphone'
    },
    { 
        title: 'Agent Center', 
        href: '/admin/agent', 
        icon: 'Bot'
    },
    { 
        title: 'Settings', 
        href: '/admin/settings', 
        icon: 'Settings'
    }
];

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Store,
    Settings,
    BarChart3,
    Truck,
    Megaphone,
    Shield,
    FileText,
    CreditCard,
    Radio,
    DollarSign,
    Car,
    Image,
    UserCheck,
    Building2,
    PieChart,
    Bot,
    ClipboardList,
    FolderOpen,
    Archive
};

export function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
    return iconMap[iconName] || LayoutDashboard;
}

export function flattenNavItems(items: NavItem[]): NavItem[] {
    const flattened: NavItem[] = [];
    for (const item of items) {
        flattened.push(item);
        if (item.children) {
            flattened.push(...item.children);
        }
    }
    return flattened;
}

export const allAdminRoutes = flattenNavItems(adminNavItems).map(item => item.href);