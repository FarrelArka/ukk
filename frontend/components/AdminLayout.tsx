'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell } from 'lucide-react';
import { menuItems } from './sidebar';

// =====================
// TYPES
// =====================

type AdminLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

// =====================
// COMPONENT
// =====================

export default function AdminLayout({ children, title = 'Admin' }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // =====================
  // CALLBACKS
  // =====================

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // =====================
  // UTILS
  // =====================

  const isActiveRoute = (itemId: string, href: string): boolean => {
    if (pathname === href) return true;
    if (itemId !== 'dashboard' && pathname?.startsWith(`/admin/${itemId}`)) return true;
    return false;
  };

  const getHref = (item: any): string => {
    return item.href ?? (item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } z-50 shadow-lg`}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-900">BookingAdmin</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2" aria-label="Main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = getHref(item);
            const isActive = isActiveRoute(item.id, href);

            return (
              <Link
                key={item.id}
                href={href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">Welcome back, Admin</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Button */}
              <button
                className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors"
                aria-label="Notifications"
              >
                <span
                  className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2"
                  aria-hidden="true"
                />
                <Bell className="w-6 h-6 text-gray-700" aria-hidden="true" />
              </button>

              {/* User Avatar */}
              <button
                className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold hover:bg-gray-800 transition-colors shadow-md"
                aria-label="User menu"
              >
                A
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>  
    </div>
  );
}
