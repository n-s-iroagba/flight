'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminPayments } from '../../../lib/api';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminPaymentsQueue() {
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getAdminPayments()
  });

  const payments = data?.payments || [];
  const summary = data?.summary || { pending: 0, processing: 0, paid: 0, failed: 0 };

  const filteredPayments = payments.filter((p: any) => {
    if (activeFilter === 'All') return true;
    return p.status === activeFilter.toLowerCase();
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
          💳 Payment Queue
        </h1>
      </div>

      <div className="bg-slate-main border border-border-slate rounded-xl p-4 mb-6 flex flex-wrap gap-3 sm:gap-4 items-center font-semibold text-sm sm:text-base">
        <div className="text-text-secondary pr-4 border-r border-border-slate">Summary:</div>
        <div className="text-amber-warning">🟡 {summary.pending} Pending</div>
        <div className="text-blue-500">🔵 {summary.processing} Processing</div>
        <div className="text-emerald-success">✅ {summary.paid} Paid</div>
        <div className="text-red-error">❌ {summary.failed} Failed</div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        {['All', 'Pending', 'Processing', 'Paid', 'Failed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeFilter === tab
                ? 'bg-oxblood text-text-primary'
                : 'bg-slate-dark text-text-secondary hover:text-text-primary border border-border-slate'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-slate-main border border-border-slate rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-dark border-b border-border-slate">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Booking Ref</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Passenger</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Route</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Amount</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-slate">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-text-secondary">Loading payments...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-text-secondary">
                  {activeFilter === 'All' ? 'No payments in queue.' : `No ${activeFilter.toLowerCase()} payments found.`}
                </td></tr>
              ) : filteredPayments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-slate-dark/50 transition-colors">
                  <td className="p-4 font-mono text-sm text-text-primary">{payment.booking_reference || payment.bookingReference}</td>
                  <td className="p-4">
                    <div className="text-text-primary font-medium">{payment.passenger_name || payment.passengerName}</div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {payment.flight?.origin} → {payment.flight?.destination}
                  </td>
                  <td className="p-4 font-bold text-text-primary">
                    ${payment.amount}
                  </td>
                  <td className="p-4">
                    {payment.status === 'pending' && <span className="inline-block bg-amber-warning/10 text-amber-warning text-xs px-2 py-1 rounded w-fit">🟡 Pending</span>}
                    {payment.status === 'processing' && <span className="inline-block bg-blue-500/10 text-blue-500 text-xs px-2 py-1 rounded w-fit">🔵 Processing</span>}
                    {payment.status === 'paid' && <span className="inline-block bg-emerald-success/10 text-emerald-success text-xs px-2 py-1 rounded w-fit">✅ Paid</span>}
                    {payment.status === 'failed' && <span className="inline-block bg-red-error/10 text-red-error text-xs px-2 py-1 rounded w-fit">❌ Failed</span>}
                    {payment.status === 'cancelled' && <span className="inline-block bg-slate-700/60 text-text-secondary text-xs px-2 py-1 rounded w-fit">🚫 Cancelled</span>}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/payments/${payment.id}`} className="bg-slate-dark hover:bg-slate-dark/80 border border-border-slate text-text-primary px-3 py-1 rounded text-sm transition-colors">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
