'use client';

import Link from 'next/link';
import { Plane, Menu, X, Crown, Radar } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-main border-b border-border-slate sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="h-8 w-8 text-oxblood-bright" />
              <span className="text-xl font-bold text-text-primary">SwiftWings</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              <Link href="/" className="text-text-primary hover:text-text-secondary px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link href="/search" className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium">Commercial Flights</Link>
              <Link href="/private-jets" className="text-text-secondary hover:text-text-text-primary font-semibold px-2 py-1 rounded-md text-sm flex items-center gap-1.5 bg-amber-100/10 border border-amber-100/20">
                <Crown className="w-4 h-4 text-text-secondary" /> Private Jets
              </Link>
              <Link href="/track" className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">
                <Radar className="w-4 h-4 text-emerald-400" /> Flight Radar
              </Link>

            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">

            <Link href="/login" className="text-text-primary hover:underline px-3 py-2 rounded-md text-sm font-medium">
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-secondary hover:text-text-primary p-2 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-slate bg-slate-dark">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-slate-main">Home</Link>
            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-slate-main">Commercial Flights</Link>
            <Link href="/private-jets" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-slate-main flex items-center gap-2">
              <Crown className="w-4 h-4 text-text-secondary" /> Private Jets
            </Link>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-slate-main flex items-center gap-2">
              <Radar className="w-4 h-4 text-emerald-400" /> Flight Radar & Tracking
            </Link>
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-slate-main">Admin Portal</Link>
          </div>
          <div className="border-t border-border-slate px-4 py-3 flex gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center text-text-primary border border-border-slate px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-main">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-oxblood hover:bg-oxblood-bright text-text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
