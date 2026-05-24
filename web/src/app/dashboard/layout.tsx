'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import { 
    LayoutDashboard, User, Package, ShoppingCart, Store, 
    Settings, Bell, CreditCard, MessageSquare, Truck,
    FileText, ChevronLeft, ChevronRight, LogOut, ArrowLeft,
    X, Menu, Home, TrendingUp, Star, Car, PackageCheck,
    BarChart3, Percent, Shield, Palette
} from 'lucide-react';

const buyerNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'activity', label: 'Activity', icon: FileText, href: '/dashboard?tab=activity' },
    { id: 'posts', label: 'Posts', icon: Package, href: '/dashboard?tab=posts' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { id: 'wallet', label: 'Wallet', icon: CreditCard, href: '/dashboard?tab=wallet' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'profile', label: 'Profile', icon: User, href: '/settings?tab=account' },
];

const vendorNavItems = [
    { id: 'overview', label: 'Store Overview', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
    { id: 'menu', label: 'Products', icon: Package, href: '/dashboard?tab=menu' },
    { id: 'promotions', label: 'Promotions', icon: Percent, href: '/dashboard?tab=promotions' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/vendor/analytics' },
    { id: 'wallet', label: 'Wallet', icon: CreditCard, href: '/dashboard?tab=wallet' },
    { id: 'payouts', label: 'Payouts', icon: TrendingUp, href: '/dashboard/vendor/payouts' },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/dashboard?tab=reviews' },
    { id: 'branding', label: 'Branding', icon: Palette, href: '/dashboard/vendor/branding' },
    { id: 'compliance', label: 'Compliance', icon: Shield, href: '/dashboard?tab=compliance' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

const driverNavItems = [
    { id: 'driver-hub', label: 'Driver Hub', icon: Car, href: '/dashboard?tab=driver-hub' },
    { id: 'active-jobs', label: 'Active Jobs', icon: PackageCheck, href: '/dashboard?tab=active-jobs' },
    { id: 'earnings', label: 'Earnings', icon: CreditCard, href: '/dashboard?tab=earnings' },
    { id: 'vehicle', label: 'Vehicle', icon: Truck, href: '/dashboard?tab=vehicle' },
    { id: 'history', label: 'History', icon: FileText, href: '/dashboard?tab=history' },
    { id: 'ratings', label: 'Ratings', icon: Star, href: '/dashboard?tab=ratings' },
    { id: 'documents', label: 'Documents', icon: Shield, href: '/dashboard?tab=documents' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
        }
        return false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    // Get current tab from URL params - single source of truth
    const currentTab = searchParams.get('tab');

    // Persist and retrieve dashboard type preference
    const [savedSection, setSavedSection] = useState<'buyer' | 'vendor' | 'driver'>('buyer');
    
    // Initialize section from URL or localStorage
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            const section = getSectionFromTab(tab);
            setSavedSection(section);
            localStorage.setItem('dashboard-section', section);
        } else if (pathname.startsWith('/dashboard/vendor')) {
            setSavedSection('vendor');
            localStorage.setItem('dashboard-section', 'vendor');
        } else if (pathname.startsWith('/dashboard/driver')) {
            setSavedSection('driver');
            localStorage.setItem('dashboard-section', 'driver');
        } else {
            // No tab in URL, check localStorage for saved preference
            const saved = localStorage.getItem('dashboard-section') as 'buyer' | 'vendor' | 'driver' | null;
            if (saved && ['buyer', 'vendor', 'driver'].includes(saved)) {
                setSavedSection(saved);
            }
        }
    }, []);

    // Determine section from current tab - for URL-based sync
    const getSectionFromTab = (tab: string | null): 'buyer' | 'vendor' | 'driver' => {
        const driverTabs = ['driver-hub', 'active-jobs', 'earnings', 'vehicle', 'driver-verification', 'documents', 'history', 'ratings'];
        const vendorTabs = ['overview', 'orders', 'menu', 'promotions', 'reviews', 'branding', 'onboarding', 'delivery', 'shipping', 'compliance', 'analytics', 'payouts'];
        
        if (tab && driverTabs.includes(tab)) return 'driver';
        if (tab && vendorTabs.includes(tab)) return 'vendor';
        return 'buyer';
    };

    // Use URL tab to determine current section, fallback to saved preference
    const currentSection = currentTab ? getSectionFromTab(currentTab) : savedSection;

    // Update section when pathname changes (for direct routes like /dashboard/vendor/*)
    useEffect(() => {
        if (pathname.startsWith('/dashboard/vendor')) {
            setSavedSection('vendor');
            localStorage.setItem('dashboard-section', 'vendor');
        } else if (pathname.startsWith('/dashboard/driver')) {
            setSavedSection('driver');
            localStorage.setItem('dashboard-section', 'driver');
        } else if (pathname === '/dashboard' && !currentTab) {
            const saved = localStorage.getItem('dashboard-section') as 'buyer' | 'vendor' | 'driver' | null;
            if (saved && ['buyer', 'vendor', 'driver'].includes(saved)) {
                setSavedSection(saved);
            }
        }
    }, [pathname, currentTab]);

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('dashboard-sidebar-collapsed', String(collapsed));
    }, [collapsed]);

    // Determine if user has vendor/driver roles
    const hasVendorRole = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'creator';
    const hasDriverRole = user?.role === 'driver' || user?.is_verified_driver;

    // Navigate to specific tab when dashboard type is selected
    const handleSectionChange = (section: 'buyer' | 'vendor' | 'driver') => {
        // Save preference
        setSavedSection(section);
        localStorage.setItem('dashboard-section', section);
        
        let targetTab = 'activity'; // buyer default
        if (section === 'vendor') targetTab = 'overview';
        if (section === 'driver') targetTab = 'driver-hub';
        router.push(`/dashboard?tab=${targetTab}`);
    };

    // All nav items combined with section headers
    const navItemsWithSections = [
        // Section header
        { id: 'header-buyer', label: 'BUYER', section: 'buyer', isHeader: true },
        { id: 'buyer-overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard', section: 'buyer' },
        { id: 'buyer-activity', label: 'Activity', icon: FileText, href: '/dashboard?tab=activity', section: 'buyer' },
        { id: 'buyer-orders', label: 'My Orders', icon: ShoppingCart, href: '/dashboard?tab=orders', section: 'buyer' },
        { id: 'buyer-messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', section: 'buyer' },
        { id: 'buyer-wallet', label: 'Wallet', icon: CreditCard, href: '/dashboard?tab=wallet', section: 'buyer' },
        // Vendor section (only if user has vendor role)
        ...(hasVendorRole ? [
            { id: 'header-vendor', label: 'VENDOR', section: 'vendor', isHeader: true },
            { id: 'vendor-overview', label: 'Store Overview', icon: Store, href: '/dashboard?tab=overview', section: 'vendor' },
            { id: 'vendor-orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders', section: 'vendor' },
            { id: 'vendor-products', label: 'Products', icon: Package, href: '/dashboard?tab=menu', section: 'vendor' },
            { id: 'vendor-promotions', label: 'Promotions', icon: Percent, href: '/dashboard?tab=promotions', section: 'vendor' },
            { id: 'vendor-analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/vendor/analytics', section: 'vendor' },
            { id: 'vendor-payouts', label: 'Payouts', icon: TrendingUp, href: '/dashboard/vendor/payouts', section: 'vendor' },
            { id: 'vendor-reviews', label: 'Reviews', icon: Star, href: '/dashboard?tab=reviews', section: 'vendor' },
            { id: 'vendor-branding', label: 'Branding', icon: Palette, href: '/dashboard/vendor/branding', section: 'vendor' },
        ] : []),
        // Driver section (only if user has driver role)
        ...(hasDriverRole ? [
            { id: 'header-driver', label: 'DRIVER', section: 'driver', isHeader: true },
            { id: 'driver-hub', label: 'Driver Hub', icon: Car, href: '/dashboard?tab=driver-hub', section: 'driver' },
            { id: 'driver-jobs', label: 'Active Jobs', icon: PackageCheck, href: '/dashboard?tab=active-jobs', section: 'driver' },
            { id: 'driver-earnings', label: 'Earnings', icon: CreditCard, href: '/dashboard?tab=earnings', section: 'driver' },
            { id: 'driver-vehicle', label: 'Vehicle', icon: Truck, href: '/dashboard?tab=vehicle', section: 'driver' },
            { id: 'driver-messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', section: 'driver' },
            { id: 'driver-settings', label: 'Settings', icon: Settings, href: '/settings', section: 'driver' },
        ] : []),
        // Common
        { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', section: 'common' },
    ];

    // Filter nav items based on current section - show only items for current dashboard type
    const visibleNavItems = navItemsWithSections.filter(item => {
        // Always show section headers
        if (item.isHeader) return true;
        // Always show common items (Settings)
        if (item.section === 'common') return true;
        // Only show items that match current section
        if (item.section === currentSection) return true;
        return false;
    });

    // Check if nav item is active based on current URL
    const isActive = (href: string) => {
        if (href.includes('?')) {
            const [base, queryString] = href.split('?');
            const params = new URLSearchParams(queryString);
            const tabParam = params.get('tab');
            
            // Check if we're on the same base path
            if (pathname !== base) return false;
            
            // For dashboard with tab param, check if current tab matches
            if (base === '/dashboard' && tabParam) {
                return currentTab === tabParam;
            }
            
            // For other paths with query params, just check base
            return true;
        }
        // Special case: /dashboard without params should match overview
        if (href === '/dashboard') {
            return pathname === '/dashboard' && !currentTab;
        }
        return pathname === href;
    };

    const NavItem = ({ item }: { item: typeof visibleNavItems[0] }) => {
        // Render section header - make it clickable to switch section
        if ('isHeader' in item && item.isHeader) {
            const sectionType = item.label.replace('HEADER-', '').toLowerCase().replace('buyer', 'buyer').replace('vendor', 'vendor').replace('driver', 'driver');
            return (
                <div className="pt-4 pb-2">
                    <button
                        onClick={() => handleSectionChange(sectionType as 'buyer' | 'vendor' | 'driver')}
                        className="flex items-center gap-2 px-4 w-full hover:bg-slate-800/50 rounded-lg py-1 transition-colors"
                    >
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-[10px] font-black text-slate-500 tracking-widest hover:text-teal-400 transition-colors">{item.label}</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </button>
                </div>
            );
        }
        
        // Skip header items - they render differently above
        if (!item.href || !item.icon) return null;
        
        const Icon = item.icon;
        const active = isActive(item.href);
        const isCurrentSection = item.section === currentSection || (item.section === 'common');
        
        return (
            <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    active 
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                        : isCurrentSection
                            ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
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

    const handleLogout = () => {
        logout();
        router.push('/');
        toast.success('Logged out');
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: collapsed ? 80 : 280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`
                    fixed left-0 top-0 h-screen bg-slate-950 text-white flex flex-col z-50 
                    transition-all duration-300
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    md:top-18 md:h-[calc(100vh-72px)]
                `}
            >
                {/* Logo & Collapse */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-black text-lg tracking-tight"
                            >
                                {currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : 'Dashboard'}
                            </motion.span>
                        )}
                    </Link>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex p-2 hover:bg-slate-800 rounded-lg transition-colors items-center justify-center"
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={() => setMobileOpen(false)} 
                            className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
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
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate text-white">{user.name}</p>
                                <p className="text-xs text-teal-400 capitalize">{currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : user.role || 'User'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Type Selector */}
                <div className="p-3 border-b border-slate-800">
                    {!collapsed ? (
                        <div className="flex bg-slate-900 p-1 rounded-xl">
                            {(['buyer', 'vendor', 'driver'] as const).map((mode) => {
                                const isAvailable = mode === 'buyer' || 
                                    (mode === 'vendor' && hasVendorRole) ||
                                    (mode === 'driver' && hasDriverRole);
                                if (!isAvailable) return null;
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => handleSectionChange(mode)}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                            currentSection === mode 
                                                ? 'bg-teal-600 text-white' 
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {mode === 'buyer' ? '🛒' : mode === 'vendor' ? '🏪' : '🚗'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            {(['buyer', 'vendor', 'driver'] as const).map((mode) => {
                                const isAvailable = mode === 'buyer' || 
                                    (mode === 'vendor' && hasVendorRole) ||
                                    (mode === 'driver' && hasDriverRole);
                                if (!isAvailable) return null;
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => handleSectionChange(mode)}
                                        className={`p-2 rounded-lg transition-all ${
                                            currentSection === mode 
                                                ? 'bg-teal-600 text-white' 
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                        title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    >
                                        {mode === 'buyer' ? <LayoutDashboard className="w-5 h-5" /> : 
                                         mode === 'vendor' ? <Store className="w-5 h-5" /> : 
                                         <Car className="w-5 h-5" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Back to Home */}
                <div className="p-3 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {!collapsed && <span>Back to Home</span>}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-3 space-y-1">
                        {visibleNavItems.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </div>
                </nav>

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
                md:ml-20 
                xl:ml-[280px] 
                transition-all duration-300
            ">
                {/* Mobile Header */}
                <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between sticky top-18 z-30">
                    <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="font-black text-slate-900 dark:text-white">
                        {currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : 'Dashboard'}
                    </span>
                    <div className="w-8" />
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-500">Loading...</div></div>}>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    );
}