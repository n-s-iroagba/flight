'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Plane, CreditCard, FileText, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && !pathname.includes('/login')) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (pathname.includes('/login')) {
    return <div className="min-h-screen bg-slate-dark">{children}</div>;
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Flights', href: '/admin/flights', icon: Plane },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-dark">
      {/* Admin Header */}
      <header className="bg-slate-main border-b border-border-slate sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-6 h-6 text-oxblood shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-text-primary truncate">Admin Dashboard</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-text-secondary hover:text-red-error transition-colors text-sm font-medium shrink-0 ml-4"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          
          {/* Admin Nav Tabs */}
          <div className="flex space-x-6 sm:space-x-8 -mb-px overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-oxblood text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-slate'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-oxblood' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
