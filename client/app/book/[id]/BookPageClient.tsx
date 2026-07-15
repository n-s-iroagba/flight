'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getFlightDetails, initiateBooking } from '../../../lib/api';
import { Plane, ShieldCheck } from 'lucide-react';
import { useState, use, Suspense } from 'react';

export default function BookPageContent({ id }: { id: string }) {

  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'admin';
  const offerId = searchParams.get('offerId') || '';

  const [formData, setFormData] = useState({
    passengerName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const { data: flight, isLoading } = useQuery({
    queryKey: ['flight', id],
    queryFn: () => getFlightDetails(id),
    enabled: source === 'admin'
  });

  const openWhatsApp = (ref?: string) => {
    const dummyNumber = '1234567890';
    const flightText = flight 
      ? `✈️ ${flight.airline || 'Airline'} - ${flight.flightNumber || flight.flight_number || ''}\n📍 ${flight.origin || 'LHR'} → ${flight.destination || 'JFK'}\n💰 Total: $${flight.price || 499}`
      : `✈️ Flight ID: ${id}`;
    
    const refText = ref ? `\n📋 Reference: ${ref}` : '';
    const message = `I want to book a flight:\n${flightText}\n👤 Passenger: ${formData.passengerName}\n📧 Email: ${formData.email}\n📱 Phone: ${formData.phone}${refText}\n\nPlease confirm availability and payment details.`;
    
    window.location.href = `https://api.whatsapp.com/send?phone=${dummyNumber}&text=${encodeURIComponent(message)}`;
  };

  const bookingMutation = useMutation({
    mutationFn: initiateBooking,
    onSuccess: (data) => {
      openWhatsApp(data.bookingReference);
    },
    onError: () => {
      openWhatsApp();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookingMutation.mutate({
      flightId: id,
      source,
      offerId,
      ...formData
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-4rem-120px)]">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border-slate">
        <Plane className="w-8 h-8 text-oxblood" />
        <h1 className="text-3xl font-bold text-text-primary">Complete Your Booking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Passenger Form */}
          <div className="bg-slate-dark border border-border-slate rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-oxblood" />
              Passenger Details
            </h2>
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="passengerName"
                  value={formData.passengerName}
                  onChange={handleChange}
                  className="w-full bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood"
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Special Requests</label>
                <textarea 
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood h-24 resize-none"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Flight Summary Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-slate-dark border border-border-slate rounded-xl p-6 sticky top-24 shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border-slate pb-2">Flight Summary</h3>
            
            {isLoading && source === 'admin' ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-main rounded w-3/4"></div>
                <div className="h-4 bg-slate-main rounded w-1/2"></div>
                <div className="h-8 bg-slate-main rounded w-full mt-4"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-text-primary font-bold">
                  <span>{flight?.origin || 'LHR'}</span>
                  <Plane className="w-4 h-4 text-text-secondary mx-2" />
                  <span>{flight?.destination || 'JFK'}</span>
                </div>
                <div className="text-sm text-text-secondary">
                  {flight?.airline || 'Airline'} • {flight?.flight_number || flight?.flightNumber || ''}
                </div>
                <div className="text-sm text-text-secondary pb-4 border-b border-border-slate">
                  {flight?.departure_time ? new Date(flight.departure_time).toLocaleString() : 'Date TBD'}
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-text-secondary">Base Fare</span>
                    <span className="text-text-primary">${flight?.price || 499}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-text-secondary">Taxes & Fees</span>
                    <span className="text-text-primary">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t border-border-slate pt-4">
                    <span className="text-text-primary">Total</span>
                    <span className="text-oxblood">${flight?.price || 499}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="text-xs text-text-secondary text-center mb-4">
                    You will be redirected to WhatsApp to complete payment with our team.
                  </p>
                  <button 
                    form="booking-form"
                    type="submit" 
                    disabled={bookingMutation.isPending}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {bookingMutation.isPending ? 'Processing...' : '💬 Book via WhatsApp'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  return (
    <Suspense fallback={<div className="text-text-primary p-8 text-center">Loading booking details...</div>}>
      <BookPageContent id={id} />
    </Suspense>
  );
}
