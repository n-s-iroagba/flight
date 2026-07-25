'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getFlightDetails, initiateBooking } from '../../../lib/api';
import { Plane, ShieldCheck, MessageCircle, FileText, Landmark, Camera, Users, Clock, Crown } from 'lucide-react';
import { useState, use, Suspense } from 'react';

export default function BookPageContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'admin';
  const offerId = searchParams.get('offerId') || '';
  const tripType = searchParams.get('tripType') || 'one-way';
  const paramOrigin = searchParams.get('origin') || '';
  const paramDestination = searchParams.get('destination') || '';
  const paramPrice = parseFloat(searchParams.get('price') || '0') || 0;
  const paramReturnDate = searchParams.get('returnDate') || '';
  const paramPassengers = parseInt(searchParams.get('passengers') || '1') || 1;
  const paramLegs = searchParams.get('legs') || '';

  const [formData, setFormData] = useState({
    passengerName: '',
    email: '',
    phone: '',
    passengersCount: paramPassengers,
    travelTime: '10:00',
    aircraftChoice: 'Gulfstream G650ER',
    specialRequests: ''
  });

  const { data: flight, isLoading } = useQuery({
    queryKey: ['flight', id],
    queryFn: () => getFlightDetails(id),
    enabled: source === 'admin' && !!id && id !== 'undefined'
  });

  const openWhatsApp = (ref?: string) => {
    const waNumber = '12152682645';
    const origin = flight?.origin || paramOrigin || 'LHR';
    const destination = flight?.destination || paramDestination || 'JFK';
    const aircraft = flight?.aircraft || formData.aircraftChoice || 'Preferred Aircraft';
    const basePrice = flight?.price || paramPrice || 499;
    const totalPrice = Number(basePrice) * (formData.passengersCount || 1);
    const depTime = flight?.departure_time ? new Date(flight.departure_time).toLocaleString() : `Time: ${formData.travelTime}`;

    const refText = ref ? `\n📋 Booking Ref: ${ref}` : '';
    const tripLabel =
      tripType === 'round-trip' ? 'ROUND-TRIP FLIGHT' :
        tripType === 'multileg' ? 'MULTILEG ITINERARY' :
          'DIRECT / ONE-WAY FLIGHT';

    let routeLine = `${origin} → ${destination}`;
    if (tripType === 'round-trip' && paramReturnDate) {
      routeLine += ` (Return: ${paramReturnDate})`;
    } else if (tripType === 'multileg' && paramLegs) {
      try {
        const legs = JSON.parse(paramLegs);
        routeLine = legs.map((l: any, i: number) => `Leg ${i + 1}: ${l.origin} → ${l.destination} (${l.departureDate})`).join(' | ');
      } catch { /* use default */ }
    }

    const message = `*SWIFT WINGS ${tripLabel} BOOKING*\n\n` +
      `📍 Route: ${routeLine}\n` +
      `🔄 Trip Type: ${tripType.toUpperCase()}\n` +
      `✈️ Aircraft / Airline: ${flight?.airline || aircraft}\n` +
      `📅 Travel Date & Time: ${depTime}\n` +
      `👥 Total Passengers: ${formData.passengersCount}\n` +
      `💰 Total Price: $${totalPrice}\n\n` +
      `*PASSENGER INFORMATION*\n` +
      `👤 Name: ${formData.passengerName}\n` +
      `📧 Email: ${formData.email}\n` +
      `📱 Phone: ${formData.phone}${refText}\n` +
      (formData.specialRequests ? `📝 Special Requests: ${formData.specialRequests}\n` : '') +
      `\n*WHATSAPP PAYMENT FLOW NEXT STEPS:*\n` +
      `1. Attached below are passenger passport copy(ies).\n` +
      `2. Please send secure bank transfer details.\n` +
      `3. I will send payment confirmation screenshot to finalize booking.`;

    window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(message)}`, '_blank');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-4rem-120px)]">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border-slate">
        <Plane className="w-8 h-8 text-oxblood" />
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Complete Flight & Aircraft Booking</h1>
          <p className="text-sm text-text-secondary">Provide flight details and finish payment seamlessly via WhatsApp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Passenger & Flight Request Form */}
          <div className="bg-slate-dark border border-border-slate rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-border-slate pb-3">
              <ShieldCheck className="w-5 h-5 text-oxblood" />
              1. Passenger & Trip Details
            </h2>
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="passengerName"
                  value={formData.passengerName}
                  onChange={handleChange}
                  placeholder="e.g. Daniel Vance"
                  className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="daniel@example.com"
                    className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555 019 2831"
                    className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5 flex items-center gap-1">
                    <Users className="w-4 h-4 text-oxblood" /> Passenger Count *
                  </label>
                  <input
                    type="number"
                    name="passengersCount"
                    min={1}
                    max={30}
                    value={formData.passengersCount}
                    onChange={handleChange}
                    className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-oxblood" /> Preferred Time
                  </label>
                  <input
                    type="time"
                    name="travelTime"
                    value={formData.travelTime}
                    onChange={handleChange}
                    className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5 flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-400" /> Aircraft Option
                  </label>
                  <select
                    name="aircraftChoice"
                    value={formData.aircraftChoice}
                    onChange={handleChange}
                    className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood text-sm"
                  >
                    <option value="Gulfstream G650ER">Gulfstream G650ER</option>
                    <option value="Bombardier Global 7500">Bombardier Global 7500</option>
                    <option value="Cessna Citation X+">Cessna Citation X+</option>
                    <option value="Boeing 787 Commercial">Boeing 787 Commercial</option>
                    <option value="Airbus A350 First Class">Airbus A350 First Class</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Special Requests & Preferences</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="In-flight catering, passport assistance, ground transport preferences..."
                  className="w-full bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood h-24 resize-none"
                />
              </div>
            </form>
          </div>

          {/* WhatsApp Payment Flow Step Guide */}
          <div className="bg-slate-dark/95 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xl font-extrabold text-emerald-400 mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" /> 2. WhatsApp Payment Flow Instructions
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Follow these simple steps after clicking the WhatsApp booking button to guarantee fast verification and ticket issuance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 bg-slate-main/80 p-4 rounded-xl border border-slate-800">
                <div className="bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg text-sm">1</div>
                <div>
                  <h4 className="font-bold text-white mb-1">Click "Book via WhatsApp"</h4>
                  <p className="text-slate-400 text-xs">Auto-populates a chat template with departure/arrival airports, date, time, passenger count, and selected aircraft.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-main/80 p-4 rounded-xl border border-slate-800">
                <div className="bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg text-sm">2</div>
                <div>
                  <h4 className="font-bold text-white mb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-emerald-400" /> Send Passport Copies
                  </h4>
                  <p className="text-slate-400 text-xs">Attach and send passenger passport copies directly to our support agent in WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-main/80 p-4 rounded-xl border border-slate-800">
                <div className="bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg text-sm">3</div>
                <div>
                  <h4 className="font-bold text-white mb-1 flex items-center gap-1">
                    <Landmark className="w-4 h-4 text-emerald-400" /> Receive Bank Details
                  </h4>
                  <p className="text-slate-400 text-xs">Support will instantly provide official bank transfer account details via secure chat.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-main/80 p-4 rounded-xl border border-slate-800">
                <div className="bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg text-sm">4</div>
                <div>
                  <h4 className="font-bold text-white mb-1 flex items-center gap-1">
                    <Camera className="w-4 h-4 text-emerald-400" /> Send Payment Screenshot
                  </h4>
                  <p className="text-slate-400 text-xs">Send transfer receipt screenshot to finalize booking and receive instant e-ticket / PNR.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-dark border border-border-slate rounded-2xl p-6 sticky top-24 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-text-primary border-b border-border-slate pb-3">Trip Summary</h3>

            {isLoading && source === 'admin' ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-main rounded w-3/4"></div>
                <div className="h-4 bg-slate-main rounded w-1/2"></div>
                <div className="h-8 bg-slate-main rounded w-full mt-4"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-text-primary font-extrabold text-xl">
                  <span>{flight?.origin || 'LHR'}</span>
                  <Plane className="w-5 h-5 text-oxblood mx-2 rotate-45" />
                  <span>{flight?.destination || 'JFK'}</span>
                </div>
                <div className="text-xs text-text-secondary bg-slate-main p-3 rounded-xl border border-slate-800 space-y-1">
                  <div><strong className="text-white">Airline/Provider:</strong> {flight?.airline || 'Swift Wings VIP'}</div>
                  <div><strong className="text-white">Flight Number:</strong> {flight?.flight_number || flight?.flightNumber || 'SW-909'}</div>
                  <div><strong className="text-white">Selected Aircraft:</strong> {flight?.aircraft || formData.aircraftChoice}</div>
                  <div><strong className="text-white">Travel Date:</strong> {flight?.departure_time ? new Date(flight.departure_time).toLocaleDateString() : 'Date TBD'}</div>
                  <div><strong className="text-white">Travel Time:</strong> {formData.travelTime}</div>
                  <div><strong className="text-white">Passengers:</strong> {formData.passengersCount} Person(s)</div>
                </div>

                <div className="pt-2 border-t border-border-slate">
                  <div className="flex justify-between items-center mb-2 text-sm text-text-secondary">
                    <span>Base Fare / Rate</span>
                    <span className="text-text-primary">${flight?.price || paramPrice || 499}</span>
                  </div>
                  {tripType === 'round-trip' && paramReturnDate && (
                    <div className="flex justify-between items-center mb-2 text-sm text-text-secondary">
                      <span>Return Date</span>
                      <span className="text-text-primary font-mono">{paramReturnDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2 text-sm text-text-secondary">
                    <span>Taxes & Handling</span>
                    <span className="text-emerald-400 font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-black border-t border-border-slate pt-4">
                    <span className="text-text-primary">Total Price</span>
                    <span className="text-oxblood">${((flight?.price || paramPrice || 499) * (formData.passengersCount || 1)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    form="booking-form"
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold py-4 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-xl disabled:opacity-50 text-base"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    {bookingMutation.isPending ? 'Preparing Chat...' : 'Book via WhatsApp'}
                  </button>
                  <p className="text-[11px] text-text-secondary text-center mt-3">
                    Auto-populates chat template & opens WhatsApp support chat directly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
