'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAdminPayments, confirmTicketDelivery, sendTicketWhatsapp, sendTicketEmail } from '../../../../../lib/api';
import Link from 'next/link';
import { useState, use } from 'react';

export default function TicketDelivery({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [whatsappStatus, setWhatsappStatus] = useState('Pending');
  const [emailStatus, setEmailStatus] = useState('Pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getAdminPayments()
  });

  const payment = data?.payments?.find((p: any) => p.id === id) || {
    id: id,
    booking_reference: 'BK-2026-07-14-00123',
    passenger_name: 'John Doe',
  };

  const deliveryMutation = useMutation({
    mutationFn: () => confirmTicketDelivery(id, {
      confirmationCode: 'TICKET_SENT',
      deliveredTo: payment.passenger_phone || '+1234567890'
    }),
    onSuccess: () => {
      router.push('/admin/payments');
    }
  });

  const whatsappMutation = useMutation({
    mutationFn: () => sendTicketWhatsapp(id, { message: 'Here is your ticket', includeETicket: true }),
    onSuccess: () => setWhatsappStatus('Sent')
  });

  const emailMutation = useMutation({
    mutationFn: () => sendTicketEmail(id, { subject: 'Your Flight Ticket', message: 'Here is your ticket', includeETicket: true }),
    onSuccess: () => setEmailStatus('Sent')
  });

  if (isLoading) return <div className="text-text-primary">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          🎫 Ticket Delivery
        </h1>
        <Link href={`/admin/payments/${id}`} className="text-text-secondary hover:text-text-primary transition-colors text-sm border border-border-slate px-4 py-2 rounded-lg bg-slate-main">
          Back to Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-main border border-border-slate rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-border-slate pb-4 mb-4">
            <div>
              <div className="text-sm text-text-secondary">Booking Reference</div>
              <div className="font-mono font-bold text-text-primary">{payment.booking_reference || payment.bookingReference}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Passenger</div>
              <div className="font-bold text-text-primary">{payment.passenger_name || payment.passengerName}</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4">Ticket Details</h2>
            <div className="grid grid-cols-2 gap-4 bg-slate-dark p-4 rounded-lg border border-border-slate">
              <div>
                <div className="text-sm text-text-secondary">Ticket Number</div>
                <div className="font-mono text-text-primary">AA-123456789</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">PNR</div>
                <div className="font-mono text-text-primary">ABC123</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4">Delivery Options</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-dark border border-border-slate rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <span className="font-medium text-text-primary">WhatsApp</span>
                </div>
                <div className="flex items-center gap-4">
                  {whatsappStatus === 'Sent' ? (
                    <span className="text-sm text-emerald-success flex items-center gap-1">✅ Sent</span>
                  ) : (
                    <span className="text-sm text-amber-warning flex items-center gap-1">⏳ Pending</span>
                  )}
                  <button onClick={() => whatsappMutation.mutate()} disabled={whatsappMutation.isPending} className="px-3 py-1 bg-slate-main border border-border-slate rounded hover:text-text-primary text-text-secondary text-sm disabled:opacity-50">
                    {whatsappMutation.isPending ? 'Sending...' : (whatsappStatus === 'Sent' ? 'Resend' : 'Send Ticket')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-dark border border-border-slate rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <span className="font-medium text-text-primary">Email</span>
                </div>
                <div className="flex items-center gap-4">
                  {emailStatus === 'Sent' ? (
                    <span className="text-sm text-emerald-success flex items-center gap-1">✅ Sent</span>
                  ) : (
                    <span className="text-sm text-amber-warning flex items-center gap-1">⏳ Pending</span>
                  )}
                  <button onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending} className="px-3 py-1 bg-slate-main border border-border-slate rounded hover:text-text-primary text-text-secondary text-sm disabled:opacity-50">
                    {emailMutation.isPending ? 'Sending...' : (emailStatus === 'Sent' ? 'Resend' : 'Send Ticket')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-dark border border-border-slate rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📥</span>
                  <span className="font-medium text-text-primary">Download PDF</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">Available</span>
                  <button className="px-3 py-1 bg-slate-main border border-border-slate rounded hover:text-text-primary text-text-secondary text-sm">Generate</button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border-slate pt-6 flex justify-end">
            <button 
              onClick={() => deliveryMutation.mutate()}
              disabled={deliveryMutation.isPending}
              className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {deliveryMutation.isPending ? 'Confirming...' : '✅ Confirm Delivery'}
            </button>
          </div>
        </div>

        <div className="bg-slate-main border border-border-slate rounded-xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider">Timeline</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-4">
              <span className="text-text-secondary w-16">15:00</span>
              <span className="text-text-primary">Payment confirmed by admin ✅</span>
            </div>
            <div className="flex gap-4">
              <span className="text-text-secondary w-16">15:05</span>
              <span className="text-text-primary">Ticket generated: AA-123456789</span>
            </div>
            {whatsappStatus === 'Sent' && (
              <div className="flex gap-4">
                <span className="text-text-secondary w-16">Just now</span>
                <span className="text-text-primary font-bold text-emerald-success">WhatsApp message sent ✅</span>
              </div>
            )}
            {emailStatus === 'Sent' && (
              <div className="flex gap-4">
                <span className="text-text-secondary w-16">Just now</span>
                <span className="text-text-primary font-bold text-emerald-success">Email sent ✅</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
