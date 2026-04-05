'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, Users, Package, ShoppingCart, Store, 
    Settings, BarChart3, Truck, Megaphone, Shield, 
    FileText, CreditCard, Radio, DollarSign, Car, 
    Image, UserCheck, Building2, PieChart, Bot, 
    ClipboardList, ChevronLeft, ChevronRight, LogOut, 
    Home, ArrowLeft, Menu, X
} from 'lucide-react';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';

const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin/overview' },
    { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    { id: 'listings', label: 'Listings', icon: Package, href: '/admin/listings' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { id: 'stores', label: 'Stores', icon: Store, href: '/admin/stores' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { id: 'dispatch', label: 'Dispatch', icon: Truck, href: '/admin/dispatch' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/admin/campaigns' },
    { id: 'compliance', label: 'Compliance', icon: Shield, href: '/admin/compliance' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, href: '/admin/revenue' },
    { id: 'payouts', label: 'Payouts', icon: CreditCard, href: '/admin/payouts' },
    { id: 'drivers', label: 'Drivers', icon: Car, href: '/admin/drivers' },
    { id: 'broadcasts', label: 'Broadcasts', icon: Radio, href: '/admin/broadcasts' },
    { id: 'logistics', label: 'Logistics', icon: Truck, href: '/admin/logistics' },
    { id: 'media', label: 'Media', icon: Image, href: '/admin/assets' },
    { id: 'ads', label: 'Ads', icon: Megaphone, href: '/admin/ads' },
    { id: 'agent', label: 'Agent', icon: Bot, href: '/admin/agent' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
    { id: 'logistics-rates', label: 'Rates', icon: FileText, href: '/admin/logistics-rates' },
];

const secondaryNavItems = [
    { id: 'kyc', label: 'KYC Requests', icon: UserCheck, href: '/admin/kyc', parent: 'compliance' },
    { id: 'kyb', label: 'KYB Verification', icon: Building2, href: '/admin/kyb-verification', parent: 'compliance' },
    { id: 'logs', label: 'Audit Logs', icon: ClipboardList, href: '/admin/logs', parent: 'compliance' },
    { id: 'compliance-analytics', label: 'Compliance Analytics', icon: PieChart, href: '/admin/compliance-analytics', parent: 'compliance' },
    { id: 'campaigns-pending', label: 'Pending Campaigns', icon: Megaphone, href: '/admin/campaigns/pending', parent: 'campaigns' },
    { id: 'assets-hero', label: 'Hero Assets', icon: Image, href: '/admin/assets-hero', parent: 'media' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
    { id: 'logistics-rates', label: 'Logistics Rates', icon: FileText, href: '/admin/logistics-rates' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['compliance', 'campaigns', 'media']);

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    const isParentActive = (parentId: string) => {
        const children = secondaryNavItems.filter(item => item.parent === parentId);
        return children.some(child => isActive(child.href));
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => 
            prev.includes(groupId) 
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleLogout = () => {
        logout();
        router.push('/');
        toast.success('Logged out');
    };

    const NavItem = ({ item, isSecondary = false }: { item: typeof adminNavItems[0], isSecondary?: boolean }) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
            <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    active 
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
                {active && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!collapsed && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
            </Link>
        );
    };

    const SecondaryNavItem = ({ item }: { item: typeof secondaryNavItems[0] }) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
            <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    active 
                        ? 'text-teal-400 bg-teal-500/10' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="font-medium text-xs">{item.label}</span>}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ 
                    x: mobileOpen ? 0 : -280,
                    width: collapsed ? 80 : 280
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed left-0 top-0 h-screen bg-slate-950 text-white flex flex-col z-50 
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'lg:w-20' : 'w-72'}`}
            >
                {/* Logo & Collapse */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <Link href="/admin/overview" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-black text-lg tracking-tight"
                            >
                                Admin
                            </motion.span>
                        )}
                    </Link>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={() => setMobileOpen(false)} 
                            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                {user && !collapsed && (
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold text-white">
                                {user.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate text-white">{user.name}</p>
                                <p className="text-xs text-teal-400">Administrator</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back to Site */}
                <div className="p-3 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {!collapsed && <span>Back to Site</span>}
                    </Link>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-3 space-y-1">
                        {adminNavItems.map((item) => (
                            <div key={item.id}>
                                <NavItem item={item} />
                                {/* Secondary items for expanded groups */}
                                {!collapsed && expandedGroups.includes(item.id) && item.id === 'compliance' && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {secondaryNavItems.filter(s => s.parent === 'compliance').map(sub => (
                                            <SecondaryNavItem key={sub.id} item={sub} />
                                        ))}
                                    </div>
                                )}
                                {!collapsed && expandedGroups.includes(item.id) && item.id === 'campaigns' && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {secondaryNavItems.filter(s => s.parent === 'campaigns').map(sub => (
                                            <SecondaryNavItem key={sub.id} item={sub} />
                                        ))}
                                    </div>
                                )}
                                {!collapsed && expandedGroups.includes(item.id) && item.id === 'media' && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {secondaryNavItems.filter(s => s.parent === 'media').map(sub => (
                                            <SecondaryNavItem key={sub.id} item={sub} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Quick Links (when collapsed) */}
                {collapsed && (
                    <div className="px-2 py-2 border-t border-slate-800">
                        {['compliance', 'campaigns', 'media'].map(group => {
                            const groupItem = adminNavItems.find(i => i.id === group);
                            if (!groupItem) return null;
                            const active = isParentActive(group);
                            return (
                                <Link
                                    key={group}
                                    href={`/admin/${group}`}
                                    className={`flex items-center justify-center p-2 rounded-lg mb-1 ${
                                        active ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                                    }`}
                                    title={groupItem.label}
                                >
                                    <groupItem.icon className="w-5 h-5" />
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white w-full transition-all ${
                            collapsed ? 'justify-center' : ''
                        }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="
                flex-1 min-w-0 
                ml-0 
                lg:ml-20 
                xl:ml-72 
                transition-all duration-300
            ">
                {/* Header with Breadcrumb */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <AdminBreadcrumb />
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/admin/overview"
                                className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
                            >
                                View Dashboard →
                            </Link>
                            <button 
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}