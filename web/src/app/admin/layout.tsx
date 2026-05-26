     1|'use client';
     2|
     3|import { useState, useEffect, ReactNode } from 'react';
     4|import Link from 'next/link';
     5|import { usePathname, useRouter } from 'next/navigation';
     6|import { motion, AnimatePresence } from 'framer-motion';
     7|import { useAuthStore } from '@/lib/auth';
     8|import toast from '@/lib/toast';
     9|import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';
    10|import {
    11|  LayoutDashboard, Users, Package, ShoppingCart, Store,
    12|  Settings, BarChart3, Truck, Megaphone, Shield,
    13|  FileText, CreditCard, Radio, DollarSign, Car,
    14|  Image, UserCheck, Building2, Bot,
    15|  ClipboardList, ChevronLeft, ChevronRight, LogOut,
    16|  Home, ArrowLeft, Menu, X, Ticket, ChevronDown, User
    17|} from 'lucide-react';
    18|
    19|const adminNavItems = [
    20|  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin/overview' },
    21|  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    22|  { id: 'events', label: 'Events', icon: Ticket, href: '/admin/events' },
    23|  { id: 'listings', label: 'Listings', icon: Package, href: '/admin/listings' },
    24|  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    25|  { id: 'stores', label: 'Stores', icon: Store, href: '/admin/stores' },
    26|  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    27|  { id: 'dispatch', label: 'Dispatch', icon: Truck, href: '/admin/dispatch' },
    28|  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/admin/campaigns' },
    29|  { id: 'compliance', label: 'Compliance', icon: Shield, href: '/admin/compliance' },
    30|  { id: 'revenue', label: 'Revenue', icon: DollarSign, href: '/admin/revenue' },
    31|  { id: 'payouts', label: 'Payouts', icon: CreditCard, href: '/admin/payouts' },
    32|  { id: 'drivers', label: 'Drivers', icon: Car, href: '/admin/drivers' },
    33|  { id: 'broadcasts', label: 'Broadcasts', icon: Radio, href: '/admin/broadcasts' },
    34|  { id: 'logistics', label: 'Logistics', icon: Truck, href: '/admin/logistics' },
    35|  { id: 'media', label: 'Media', icon: Image, href: '/admin/assets' },
    36|  { id: 'ibt-partners', label: 'IBT Partners', icon: Building2, href: '/admin/ibt-partners' },
    37|  { id: 'ads', label: 'Ads', icon: Megaphone, href: '/admin/ads' },
    38|  { id: 'agent', label: 'Agent', icon: Bot, href: '/admin/agent' },
    39|  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    40|];
    41|
    42|const secondaryNavItems = [
    43|  { id: 'kyc', label: 'KYC Requests', icon: UserCheck, href: '/admin/kyc', parent: 'compliance' },
    44|  { id: 'kyb', label: 'KYB Verification', icon: Building2, href: '/admin/kyb-verification', parent: 'compliance' },
    45|  { id: 'logs', label: 'Audit Logs', icon: ClipboardList, href: '/admin/logs', parent: 'compliance' },
    46|  { id: 'compliance-analytics', label: 'Analytics', icon: BarChart3, href: '/admin/compliance-analytics', parent: 'compliance' },
    47|  { id: 'campaigns-pending', label: 'Pending', icon: Megaphone, href: '/admin/campaigns/pending', parent: 'campaigns' },
    48|  { id: 'assets-hero', label: 'Hero Assets', icon: Image, href: '/admin/assets-hero', parent: 'media' },
    49|  { id: 'ibt-partners-stores', label: 'Stores', icon: Store, href: '/admin/ibt-partners/stores', parent: 'ibt-partners' },
    50|  { id: 'ibt-partners-products', label: 'Products', icon: Package, href: '/admin/ibt-partners/products', parent: 'ibt-partners' },
    51|];
    52|
    53|const navGroups = [
    54|  { id: 'compliance', label: 'Compliance', items: secondaryNavItems.filter(i => i.parent === 'compliance') },
    55|  { id: 'campaigns', label: 'Campaigns', items: secondaryNavItems.filter(i => i.parent === 'campaigns') },
    56|  { id: 'media', label: 'Media', items: secondaryNavItems.filter(i => i.parent === 'media') },
    57|  { id: 'ibt-partners', label: 'IBT Partners', items: secondaryNavItems.filter(i => i.parent === 'ibt-partners') },
    58|];
    59|
    60|type SidebarState = 'closed' | 'rail' | 'expanded';
    61|const RAIL_WIDTH = 56;
    62|const EXPANDED_WIDTH = 260;
    63|
    64|export default function AdminLayout({ children }: { children: ReactNode }) {
    65|  const pathname = usePathname();
    66|  const router = useRouter();
    67|  const { user, logout } = useAuthStore();
    68|  const [state, setState] = useState<SidebarState>('rail');
    69|  const [mobileOpen, setMobileOpen] = useState(false);
    70|  const [expandedGroups, setExpandedGroups] = useState<string[]>(['compliance']);
    71|  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    72|
    73|  // Restore persisted state
    74|  useEffect(() => {
    75|    if (typeof window !== 'undefined') {
    76|      const saved = localStorage.getItem('admin-sidebar-state');
    77|      if (saved === 'closed' || saved === 'rail' || saved === 'expanded') {
    78|        setState(saved);
    79|      }
    80|    }
    81|  }, []);
    82|
    83|  // Persist state
    84|  useEffect(() => {
    85|    if (typeof window !== 'undefined') {
    86|      localStorage.setItem('admin-sidebar-state', state);
    87|    }
    88|  }, [state]);
    89|
    90|  // Close mobile on route change
    91|  useEffect(() => { setMobileOpen(false); }, [pathname]);
    92|
    93|  // Lock body scroll
    94|  useEffect(() => {
    95|    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    96|    return () => { document.body.style.overflow = ''; };
    97|  }, [mobileOpen]);
    98|
    99|  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
   100|
   101|  const toggleGroup = (groupId: string) => {
   102|    setExpandedGroups(prev =>
   103|      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
   104|    );
   105|  };
   106|
   107|  const handleLogout = () => {
   108|    logout();
   109|    router.push('/');
   110|    toast.success('Logged out');
   111|  };
   112|
   113|  const isRail = state === 'rail';
   114|  const isExpanded = state === 'expanded';
   115|  const isClosed = state === 'closed';
   116|  const showSidebar = isRail || isExpanded;
   117|
   118|  return (
   119|    <div className="min-h-screen bg-surface-primary">
   120|
   121|      {/* ═══ EDGE TAB: visible when closed ═══ */}
   122|      {isClosed && (
   123|        <button
   124|          onClick={() => setState('rail')}
   125|          className="fixed left-0 top-0 bottom-0 z-[60] w-3 bg-surface-elevated/80 hover:bg-surface-tertiary transition-colors cursor-pointer group"
   126|          aria-label="Open sidebar"
   127|        >
   128|          <div className="absolute top-1/2 -translate-y-1/2 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
   129|            <ChevronRight size={10} className="text-ink-secondary" />
   130|          </div>
   131|        </button>
   132|      )}
   133|
   134|      {/* ═══ HAMBURGER TOGGLE: fixed at top-left ═══ */}
   135|      {showSidebar && (
   136|        <button
   137|          onClick={() => setState(isExpanded ? 'rail' : 'expanded')}
   138|          className="fixed z-[70] p-2 rounded-lg bg-surface-elevated/95 hover:bg-surface-tertiary text-ink-secondary hover:text-ink-primary transition-all shadow-lg backdrop-blur-sm border border-border-primary"
   139|          style={{
   140|            top: '12px',
   141|            left: isRail ? `${RAIL_WIDTH - 2}px` : `${EXPANDED_WIDTH - 36}px`,
   142|            transform: isRail ? 'translateX(-50%)' : 'none',
   143|          }}
   144|          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
   145|        >
   146|          {isExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
   147|        </button>
   148|      )}
   149|
   150|      {/* ═══ MOBILE OVERLAY ═══ */}
   151|      <AnimatePresence>
   152|        {mobileOpen && (
   153|          <>
   154|            <motion.div
   155|              initial={{ opacity: 0 }}
   156|              animate={{ opacity: 1 }}
   157|              exit={{ opacity: 0 }}
   158|              className="fixed inset-0 z-[55] bg-surface-overlay backdrop-blur-sm lg:hidden"
   159|              onClick={() => setMobileOpen(false)}
   160|            />
   161|            <motion.aside
   162|              initial={{ x: -EXPANDED_WIDTH }}
   163|              animate={{ x: 0 }}
   164|              exit={{ x: -EXPANDED_WIDTH }}
   165|              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
   166|              className="fixed left-0 top-0 bottom-0 z-[60] w-[280px] bg-surface-elevated text-ink-primary flex flex-col lg:hidden overflow-y-auto"
   167|            >
   168|              {/* Mobile header */}
   169|              <div className="flex items-center justify-between px-4 py-4 border-b border-border-primary shrink-0">
   170|                <div className="flex items-center gap-2.5">
   171|                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
   172|                    <Settings size={15} className="text-accent-500" />
   173|                  </div>
   174|                  <span className="font-bold text-sm">Admin</span>
   175|                </div>
   176|                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-tertiary text-ink-secondary">
   177|                  <X size={16} />
   178|                </button>
   179|              </div>
   180|              {/* Mobile user */}
   181|              {user && (
   182|                <Link
   183|                  href="/profile"
   184|                  onClick={() => setMobileOpen(false)}
   185|                  className="flex items-center gap-2.5 px-4 py-3 border-b border-border-primary text-ink-secondary hover:text-ink-primary"
   186|                >
   187|                  <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 overflow-hidden">
   188|                    {user.avatar_url ? (
   189|                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
   190|                    ) : (
   191|                      <User size={14} className="text-accent-500" />
   192|                    )}
   193|                  </div>
   194|                  <div className="min-w-0">
   195|                    <div className="text-[12px] font-semibold text-ink-primary truncate">{user.name}</div>
   196|                    <div className="text-[10px] text-ink-tertiary">{user.role || 'Admin'}</div>
   197|                  </div>
   198|                </Link>
   199|              )}
   200|              {/* Mobile nav */}
   201|              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
   202|                {adminNavItems.map((item) => {
   203|                  const Icon = item.icon;
   204|                  const active = isActive(item.href);
   205|                  const hasChildren = navGroups.find(g => g.id === item.id);
   206|                  return (
   207|                    <div key={item.id}>
   208|                      <Link
   209|                        href={item.href}
   210|                        onClick={() => setMobileOpen(false)}
   211|                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
   212|                          active
   213|                            ? 'bg-accent-500/10 text-accent-500'
   214|                            : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'
   215|                        }`}
   216|                      >
   217|                        <Icon size={17} className="shrink-0" />
   218|                        <span className="font-medium text-[13px] truncate">{item.label}</span>
   219|                      </Link>
   220|                      {hasChildren && (
   221|                        <div className="ml-5 mt-0.5 space-y-0.5">
   222|                          {hasChildren.items.map(sub => {
   223|                            const SubIcon = sub.icon;
   224|                            const subActive = isActive(sub.href);
   225|                            return (
   226|                              <Link
   227|                                key={sub.id}
   228|                                href={sub.href}
   229|                                onClick={() => setMobileOpen(false)}
   230|                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${
   231|                                  subActive
   232|                                    ? 'text-accent-500 bg-accent-500/10'
   233|                                    : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-tertiary'
   234|                                }`}
   235|                              >
   236|                                <SubIcon size={15} className="shrink-0" />
   237|                                <span className="font-medium truncate">{sub.label}</span>
   238|                              </Link>
   239|                            );
   240|                          })}
   241|                        </div>
   242|                      )}
   243|                    </div>
   244|                  );
   245|                })}
   246|              </nav>
   247|              {/* Mobile footer */}
   248|              <div className="p-3 border-t border-border-primary shrink-0 space-y-1">
   249|                <Link
   250|                  href="/profile"
   251|                  onClick={() => setMobileOpen(false)}
   252|                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary transition-colors"
   253|                >
   254|                  <User size={15} className="shrink-0" />
   255|                  <span className="text-[12px] font-medium">Profile</span>
   256|                </Link>
   257|                <button
   258|                  onClick={() => { handleLogout(); setMobileOpen(false); }}
   259|                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary transition-colors w-full"
   260|                >
   261|                  <LogOut size={15} className="shrink-0" />
   262|                  <span className="text-[12px] font-medium">Log out</span>
   263|                </button>
   264|              </div>
   265|            </motion.aside>
   266|          </>
   267|        )}
   268|      </AnimatePresence>
   269|
   270|      {/* ═══ DESKTOP SIDEBAR ═══ */}
   271|      <AnimatePresence>
   272|        {showSidebar && (
   273|          <motion.aside
   274|            initial={{ x: -EXPANDED_WIDTH, opacity: 0 }}
   275|            animate={{ x: 0, opacity: 1 }}
   276|            exit={{ x: -EXPANDED_WIDTH, opacity: 0 }}
   277|            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
   278|            className="fixed left-0 top-0 bottom-0 z-[60] bg-surface-elevated text-ink-primary flex flex-col border-r border-border-primary hidden lg:flex"
   279|            style={{ width: isRail ? RAIL_WIDTH : EXPANDED_WIDTH }}
   280|            onMouseLeave={() => setHoveredItem(null)}
   281|          >
   282|            {/* Header */}
   283|            <div className={`shrink-0 flex items-center border-b border-border-primary ${isRail ? 'justify-center px-0 py-4' : 'px-4 py-4'}`}>
   284|              {!isRail && (
   285|                <div className="flex items-center gap-2.5 min-w-0">
   286|                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
   287|                    <Settings size={15} className="text-accent-500" />
   288|                  </div>
   289|                  <span className="font-bold text-sm tracking-tight truncate">Admin</span>
   290|                </div>
   291|              )}
   292|              {isRail && (
   293|                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
   294|                  <Settings size={15} className="text-accent-500" />
   295|                </div>
   296|              )}
   297|            </div>
   298|
   299|            {/* User */}
   300|            {user && (
   301|              <Link
   302|                href="/profile"
   303|                className={`shrink-0 border-b border-border-primary flex items-center transition-colors text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary ${isRail ? 'justify-center p-2' : 'gap-2.5 px-3 py-2.5'}`}
   304|                title={isRail ? user.name : undefined}
   305|              >
   306|                <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
   307|                  {user.avatar_url ? (
   308|                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
   309|                  ) : (
   310|                    user.name?.charAt(0).toUpperCase() || 'U'
   311|                  )}
   312|                </div>
   313|                {!isRail && (
   314|                  <div className="min-w-0 flex-1">
   315|                    <p className="font-semibold text-[12px] truncate text-ink-primary">{user.name}</p>
   316|                    <p className="text-[10px] text-ink-tertiary capitalize">{user.role || 'Admin'}</p>
   317|                  </div>
   318|                )}
   319|              </Link>
   320|            )}
   321|
   322|            {/* Back to Home */}
   323|            <div className={`shrink-0 border-b border-border-primary ${isRail ? 'py-2' : 'py-2 px-3'}`}>
   324|              <Link
   325|                href="/"
   326|                className={`flex items-center text-ink-tertiary hover:text-ink-secondary transition-colors ${isRail ? 'justify-center' : 'gap-1.5'}`}
   327|                title={isRail ? 'Back to Home' : undefined}
   328|              >
   329|                <ArrowLeft size={12} />
   330|                {!isRail && <span className="text-[11px]">Back to Home</span>}
   331|              </Link>
   332|            </div>
   333|
   334|            {/* Nav */}
   335|            <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
   336|              <div className="px-2">
   337|                {adminNavItems.map((item) => {
   338|                  const Icon = item.icon;
   339|                  const active = isActive(item.href);
   340|                  const hasChildren = navGroups.find(g => g.id === item.id);
   341|                  const isGroupExpanded = expandedGroups.includes(item.id);
   342|                  const isHovered = hoveredItem === item.id;
   343|
   344|                  const itemClass = isRail
   345|                    ? 'flex items-center justify-center rounded-lg transition-all duration-150 group relative px-0 py-2.5' + (active ? ' bg-accent-500/10 text-accent-500' : ' text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary')
   346|                    : 'flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative px-3 py-2.5' + (active ? ' bg-accent-500/10 text-accent-500' : ' text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary');
   347|
   348|                  return (
   349|                    <div
   350|                      key={item.id}
   351|                      onMouseEnter={() => isRail && setHoveredItem(item.id)}
   352|                      onMouseLeave={() => setHoveredItem(null)}
   353|                    >
   354|                      <div className="flex items-center gap-1">
   355|                        <Link
   356|                          href={item.href}
   357|                          className={itemClass}
   358|                          title={isRail ? item.label : undefined}
   359|                        >
   360|                          {active && (
   361|                            <motion.div
   362|                              layoutId="admin-sidebar-active"
   363|                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-r-full"
   364|                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
   365|                            />
   366|                          )}
   367|                          <Icon size={isRail ? 20 : 17} className="shrink-0" />
   368|                          {!isRail && <span className="font-medium text-[13px] truncate">{item.label}</span>}
   369|                        </Link>
   370|                        {hasChildren && !isRail && (
   371|                          <button
   372|                            onClick={() => toggleGroup(item.id)}
   373|                            className="p-1 rounded-md hover:bg-surface-tertiary transition-colors"
   374|                          >
   375|                            <ChevronDown size={14} className={`text-ink-tertiary transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
   376|                          </button>
   377|                        )}
   378|                      </div>
   379|
   380|                      {/* Rail tooltip */}
   381|                      {isRail && isHovered && (
   382|                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-surface-tertiary text-ink-primary text-[12px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
   383|                          {item.label}
   384|                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-elevated" />
   385|                        </div>
   386|                      )}
   387|
   388|                      {/* Secondary items */}
   389|                      {hasChildren && isGroupExpanded && !isRail && (
   390|                        <div className="ml-5 mt-0.5 space-y-0.5">
   391|                          {hasChildren.items.map(sub => {
   392|                            const SubIcon = sub.icon;
   393|                            const subActive = isActive(sub.href);
   394|                            return (
   395|                              <Link
   396|                                key={sub.id}
   397|                                href={sub.href}
   398|                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${
   399|                                  subActive
   400|                                    ? 'text-accent-500 bg-accent-500/10'
   401|                                    : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-tertiary'
   402|                                }`}
   403|                              >
   404|                                <SubIcon size={15} className="shrink-0" />
   405|                                <span className="font-medium truncate">{sub.label}</span>
   406|                              </Link>
   407|                            );
   408|                          })}
   409|                        </div>
   410|                      )}
   411|                    </div>
   412|                  );
   413|                })}
   414|              </div>
   415|            </nav>
   416|
   417|            {/* Footer */}
   418|            <div className={`shrink-0 border-t border-border-primary ${isRail ? 'p-2' : 'p-3'}`}>
   419|              <button
   420|                onClick={handleLogout}
   421|                className={`flex items-center rounded-lg text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary transition-colors ${isRail ? 'justify-center p-2 w-full' : 'gap-2.5 px-3 py-2 w-full'}`}
   422|                title={isRail ? 'Log out' : undefined}
   423|              >
   424|                <LogOut size={isRail ? 18 : 15} className="shrink-0" />
   425|                {!isRail && <span className="font-medium text-[12px]">Log out</span>}
   426|              </button>
   427|            </div>
   428|          </motion.aside>
   429|        )}
   430|      </AnimatePresence>
   431|
   432|      {/* ═══ MAIN CONTENT ═══ */}
   433|      <main
   434|        className="transition-all duration-300 ease-out"
   435|        style={{ marginLeft: isRail ? RAIL_WIDTH : 0 }}
   436|      >
   437|        {/* Mobile header */}
   438|        <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-surface-elevated/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
   439|          <button
   440|            onClick={() => setMobileOpen(true)}
   441|            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-tertiary text-slate-600 dark:text-ink-secondary transition-colors"
   442|          >
   443|            <Menu size={20} />
   444|          </button>
   445|          <span className="font-bold text-sm text-slate-900 dark:text-ink-primary">Admin</span>
   446|          <div className="w-8" />
   447|        </div>
   448|
   449|        <AdminBreadcrumb />
   450|        <div className="p-4 md:p-6 lg:p-8">{children}</div>
   451|      </main>
   452|    </div>
   453|  );
   454|}
   455|