'use client';

import { useQuery } from '@tanstack/react-query';
import { getStats, getAdminPayments } from '../../lib/api';
import { Plane, CreditCard, Users, TrendingUp, Mail, Crown } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getStats,
    initialData: { totalFlights: 0, airlines: 0, destinations: 0, averageRating: 0 }
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getAdminPayments(),
  });

  const summary = paymentsData?.summary || { pending: 0, processing: 0, paid: 0, failed: 0 };
  const activeBookings = (summary.pending || 0) + (summary.processing || 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Dashboard Overview</h1>
        <div className="text-sm text-text-secondary">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-main border border-border-slate rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-oxblood/20 p-3 rounded-lg text-oxblood">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Total Flights</div>
              <div className="text-2xl font-bold text-text-primary">{stats.totalFlights}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-main border border-border-slate rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-success/20 p-3 rounded-lg text-emerald-success">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Revenue</div>
              <div className="text-2xl font-bold text-text-primary">$124,500</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-main border border-border-slate rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-warning/20 p-3 rounded-lg text-amber-warning">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Active Bookings</div>
              <div className="text-2xl font-bold text-text-primary">{activeBookings}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-main border border-border-slate rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Conversion Rate</div>
              <div className="text-2xl font-bold text-text-primary">3.2%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-slate-main border border-border-slate rounded-xl p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/admin/mail" className="flex items-center justify-between p-4 rounded-lg bg-slate-dark hover:bg-slate-dark/80 transition-colors group border border-border-slate hover:border-oxblood">
              <div className="flex items-center gap-3 text-text-primary font-medium">
                <Mail className="w-5 h-5 text-oxblood group-hover:text-oxblood-bright" />
                Dispatch Email (booking@swiftwings.online)
              </div>
              <span className="text-text-secondary">→</span>
            </Link>
            <Link href="/admin/private-jets" className="flex items-center justify-between p-4 rounded-lg bg-slate-dark hover:bg-slate-dark/80 transition-colors group border border-border-slate hover:border-oxblood">
              <div className="flex items-center gap-3 text-text-primary font-medium">
                <Crown className="w-5 h-5 text-amber-400" />
                Manage Private Jet Charters
              </div>
              <span className="text-text-secondary">→</span>
            </Link>
            <Link href="/admin/flights/create" className="flex items-center justify-between p-4 rounded-lg bg-slate-dark hover:bg-slate-dark/80 transition-colors group border border-border-slate hover:border-oxblood">
              <div className="flex items-center gap-3 text-text-primary font-medium">
                <Plane className="w-5 h-5 text-oxblood group-hover:text-oxblood-bright" />
                Add New Commercial Flight
              </div>
              <span className="text-text-secondary">→</span>
            </Link>
            <Link href="/admin/payments" className="flex items-center justify-between p-4 rounded-lg bg-slate-dark hover:bg-slate-dark/80 transition-colors group border border-border-slate hover:border-oxblood">
              <div className="flex items-center gap-3 text-text-primary font-medium">
                <CreditCard className="w-5 h-5 text-oxblood group-hover:text-oxblood-bright" />
                Process Payments
              </div>
              <span className="text-text-secondary">→</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
