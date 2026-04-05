'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, User, Package, ShoppingCart, Store, 
    Settings, Bell, CreditCard, MessageSquare, Truck,
    FileText, ChevronLeft, ChevronRight, LogOut, ArrowLeft,
    X, Menu, Home
} from 'lucide-react';

const dashboardNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'activity', label: 'Activity', icon: FileText, href: '/dashboard?tab=activity' },
    { id: 'posts', label: 'Posts', icon: Package, href: '/dashboard?tab=posts' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { id: 'wallet', label: 'Wallet', icon: CreditCard, href: '/dashboard?tab=wallet' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'profile', label: 'Profile', icon: User, href: '/settings?tab=account' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
        }
        return false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('dashboard-sidebar-collapsed', String(collapsed));
    }, [collapsed]);

    // Don't show sidebar on messages page
    if (pathname.includes('/messages')) {
        return <>{children}</>;
    }

    const isActive = (href: string) => {
        if (href.includes('?')) {
            const [base] = href.split('?');
            return pathname === base;
        }
        return pathname === href || href === '/dashboard';
    };

    const handleLogout = () => {
        logout();
        router.push('/');
        toast.success('Logged out');
    };

    const NavItem = ({ item }: { item: typeof dashboardNavItems[0] }) => {
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
                                Dashboard
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
                                <p className="text-xs text-teal-400 capitalize">{user.role || 'User'}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                        {dashboardNavItems.map((item) => (
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
                xl:ml-72 
                transition-all duration-300
            ">
                {/* Mobile Header */}
                <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="font-black text-slate-900 dark:text-white">Dashboard</span>
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