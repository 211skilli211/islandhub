'use client';

import { useState } from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
}

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}

export function DashboardSidebar({ navItems, activeTab, onTabChange, expandedItems, onToggleExpand }: {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <nav className="p-2 flex lg:flex-col gap-1 overflow-x-auto">
      {navItems.map(item => (
        <div key={item.id}>
          <button
            onClick={() => {
              if (item.children?.length) {
                onToggleExpand(item.id);
              } else {
                onTabChange(item.id);
              }
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id || (item.children?.some(c => c.id === activeTab))
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}</span>
            {item.children?.length ? (
              <svg className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : null}
          </button>
          {item.children?.length && expandedItems.has(item.id) && (
            <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
              {item.children.map(child => (
                <button
                  key={child.id}
                  onClick={() => onTabChange(child.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === child.id
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {child.icon}
                  <span className="whitespace-nowrap">{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

export default function DashboardLayout({
  title,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  children,
  headerActions,
  sidebarFooter,
}: DashboardLayoutProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-full lg:w-60 bg-white dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 flex-shrink-0 ${
        mobileMenuOpen ? 'block' : 'hidden lg:block'
      }`}>
        <div className="hidden lg:block p-4 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <DashboardSidebar
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={(id) => { onTabChange(id); setMobileMenuOpen(false); }}
          expandedItems={expandedItems}
          onToggleExpand={toggleExpand}
        />
        {sidebarFooter && (
          <div className="mt-auto p-3 border-t border-slate-200 dark:border-slate-700">
            {sidebarFooter}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {headerActions && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div />
            {headerActions}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
