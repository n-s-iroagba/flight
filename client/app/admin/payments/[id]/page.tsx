'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAdminPayments, markPaymentPaid } from '../../../../lib/api';
import api from '../../../../lib/api';
import Link from 'next/link';
import { useState, use } from 'react';

export default function PaymentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  
  // Just for this exercise, we are fetching all payments and finding the specific one 
  // since a specific getPayment endpoint wasn't strictly defined in the mock but we have the queue.
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getAdminPayments()
  });

  const payment = data?.payments?.find((p: any) => p.id === id) || {
    id: id,
    booking_reference: 'BK-2026-07-14-00123',
    passenger_name: 'John Doe',
    passenger_email: 'john@example.com',
    passenger_phone: '+1234567890',
    amount: 499,
    status: 'pending',
    flight: { origin: 'LHR', destination: 'JFK', departure_time: '2026-07-20T08:30', airline: 'American Airlines', flight_number: 'AA-123' }
  };

  const markPaidMutation = useMutation({
    mutationFn: () => markPaymentPaid(id, {
      paymentConfirmation: {
        method,
        reference,
        amount: payment.amount,
        currency: 'USD'
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      router.push(`/admin/payments/${id}/delivery`);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/admin/payments/${id}/mark-paid`, {
      paymentConfirmation: { method: 'cancelled', reference: 'ADMIN_CANCELLED', amount: 0, currency: 'USD' },
      status: 'cancelled'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      router.push('/admin/payments');
    }
  });

  const handleConfirm = () => {
    markPaidMutation.mutate();
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      cancelMutation.mutate();
    }
  };

  if (isLoading) return <div className="text-text-primary">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
          💳 Payment Details
        </h1>
        <Link href="/admin/payments" className="text-text-secondary hover:text-text-primary transition-colors text-sm border border-border-slate px-4 py-2 rounded-lg bg-slate-main w-full sm:w-auto text-center">
          Back to Queue
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-main border border-border-slate rounded-xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider">Booking Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border-slate pb-2">
                <span className="text-text-secondary">Reference</span>
                <span className="text-text-primary font-mono">{payment.booking_reference || payment.bookingReference}</span>
              </div>
              <div className="flex justify-between border-b border-border-slate py-2">
                <span className="text-text-secondary">Passenger</span>
                <span className="text-text-primary">{payment.passenger_name || payment.passengerName}</span>
              </div>
              <div className="flex justify-between border-b border-border-slate py-2">
                <span className="text-text-secondary">Email</span>
                <span className="text-text-primary">{payment.passenger_email || payment.passengerEmail}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">Phone</span>
                <span className="text-text-primary">{payment.passenger_phone || payment.passengerPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-main border border-border-slate rounded-xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider">Flight Info</h2>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-text-primary text-lg mb-2">✈️ {payment.flight?.airline} - {payment.flight?.flight_number || payment.flight?.flightNumber}</div>
              <div className="text-text-secondary">{payment.flight?.origin} → {payment.flight?.destination} | {new Date(payment.flight?.departure_time || payment.flight?.departureTime).toLocaleString()}</div>
              <div className="text-xl font-bold text-oxblood mt-4 pt-4 border-t border-border-slate">💰 Total: ${payment.amount} USD</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-main border border-border-slate rounded-xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider">Payment Confirmation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash</option>
                  <option value="whatsapp">WhatsApp Direct</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Reference / Transaction ID</label>
                <input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" placeholder="Optional" />
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={handleConfirm}
                  disabled={markPaidMutation.isPending || payment.status === 'paid'}
                  className="flex-1 bg-oxblood hover:bg-oxblood-bright text-text-primary py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {markPaidMutation.isPending ? 'Confirming...' : '✅ Confirm Payment'}
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending || payment.status === 'cancelled'}
                  className="flex-1 bg-slate-dark hover:bg-red-error/10 text-red-error border border-red-error py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : '❌ Cancel Booking'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-main border border-border-slate rounded-xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider">Timeline</h2>
            <div className="space-y-4 text-sm relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-slate">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-border-slate bg-slate-dark text-slate-dark z-10 shrink-0 shadow-sm md:mx-auto"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-text-secondary">Booking initiated by visitor</div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-border-slate bg-emerald-success text-emerald-success z-10 shrink-0 shadow-sm md:mx-auto"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-text-primary font-medium">WhatsApp conversation started</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
