'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicPrivateJets, initiatePrivateJetBooking } from '../../lib/api';
import Map from '../../components/Map';
import { Crown, Plane, MessageCircle, ShieldCheck, CheckSquare, Square, Plus, Trash2, Calendar, MapPin, Sparkles } from 'lucide-react';

export default function PrivateJetsPage() {
  const [tripType, setTripType] = useState<'single' | 'round-trip' | 'multileg'>('single');
  const [legs, setLegs] = useState<Array<{ origin: string; destination: string; departureDate: string; returnDate?: string }>>([
    { origin: 'LHR', destination: 'JFK', departureDate: '', returnDate: '' }
  ]);
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passengersCount, setPassengersCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: jets = [], isLoading } = useQuery({
    queryKey: ['public-private-jets'],
    queryFn: getPublicPrivateJets,
  });

  const handleAddLeg = () => {
    setLegs([...legs, { origin: '', destination: '', departureDate: '' }]);
  };

  const handleRemoveLeg = (index: number) => {
    if (legs.length > 1) {
      setLegs(legs.filter((_, idx) => idx !== index));
    }
  };

  const handleLegChange = (index: number, field: string, value: string) => {
    const updated = [...legs];
    updated[index] = { ...updated[index], [field]: value };
    setLegs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await initiatePrivateJetBooking({
        tripType,
        legs,
        passengerName,
        email,
        phone,
        passengersCount,
        specialRequests,
      });

      if (res?.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      } else {
        alert('Private Jet booking request submitted successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit booking inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/10 border border-amber-100/30 text-text-primary text-xs font-semibold mb-4">
          <Crown className="w-4 h-4 text-text-secondary" /> Swift Wings VIP Concierge
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Private Jet Charter Portal</h1>
        <p className="text-slate-400 text-base mt-3">
          Custom luxury air travel tailored to your schedule. Single-leg, round-trip, or bespoke multi-destination itineraries.
        </p>
      </div>

      {/* Booking Form Card */}
      <div className="bg-slate-dark border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl mb-16 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Trip Type Checkboxes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">
              1. Select Flight Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border font-semibold text-sm transition-all ${tripType === 'single' ? 'bg-amber-100/20 text-text-primary border-amber-100/50' : 'bg-slate-main border-slate-800 text-slate-400 hover:text-white'
                  }`}
                onClick={() => setTripType('single')}
              >
                {tripType === 'single' ? <CheckSquare className="w-5 h-5 text-text-secondary" /> : <Square className="w-5 h-5 text-slate-600" />}
                Single Flight
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border font-semibold text-sm transition-all ${tripType === 'round-trip' ? 'bg-amber-100/20 text-text-primary border-amber-100/50' : 'bg-slate-main border-slate-800 text-slate-400 hover:text-white'
                  }`}
                onClick={() => setTripType('round-trip')}
              >
                {tripType === 'round-trip' ? <CheckSquare className="w-5 h-5 text-text-secondary" /> : <Square className="w-5 h-5 text-slate-600" />}
                Round-Trip Flight
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border font-semibold text-sm transition-all ${tripType === 'multileg' ? 'bg-amber-100/20 text-text-primary border-amber-100/50' : 'bg-slate-main border-slate-800 text-slate-400 hover:text-white'
                  }`}
                onClick={() => setTripType('multileg')}
              >
                {tripType === 'multileg' ? <CheckSquare className="w-5 h-5 text-text-secondary" /> : <Square className="w-5 h-5 text-slate-600" />}
                Multileg Trip
              </label>
            </div>
          </div>

          {/* Destinations & Dates */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">
              2. Destination & Date Details
            </label>
            <div className="space-y-4">
              {legs.map((leg, idx) => (
                <div key={idx} className="bg-slate-main border border-slate-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Departure Airport / City</label>
                    <input
                      type="text"
                      placeholder="e.g. London Heathrow (LHR)"
                      value={leg.origin}
                      onChange={(e) => handleLegChange(idx, 'origin', e.target.value)}
                      className="w-full bg-slate-dark border border-slate-700 rounded-xl p-3 text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Arrival Airport / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Paris Le Bourget (LBG)"
                      value={leg.destination}
                      onChange={(e) => handleLegChange(idx, 'destination', e.target.value)}
                      className="w-full bg-slate-dark border border-slate-700 rounded-xl p-3 text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Departure Date</label>
                    <input
                      type="date"
                      value={leg.departureDate}
                      onChange={(e) => handleLegChange(idx, 'departureDate', e.target.value)}
                      className="w-full bg-slate-dark border border-slate-700 rounded-xl p-3 text-white text-sm"
                      required
                    />
                  </div>

                  {tripType === 'round-trip' && idx === 0 ? (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Return Date</label>
                      <input
                        type="date"
                        value={leg.returnDate || ''}
                        onChange={(e) => handleLegChange(idx, 'returnDate', e.target.value)}
                        className="w-full bg-slate-dark border border-slate-700 rounded-xl p-3 text-white text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-mono text-text-secondary/80 pb-2">LEG #{idx + 1}</span>
                      {legs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLeg(idx)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {tripType === 'multileg' && (
                <button
                  type="button"
                  onClick={handleAddLeg}
                  className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100/10 border border-amber-100/30"
                >
                  <Plus className="w-4 h-4" /> Add Destination Leg
                </button>
              )}
            </div>
          </div>

          {/* Passenger Info */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">
              3. Passenger & Contact Info
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-main border border-slate-800 rounded-xl p-3 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="booking@swiftwings.online"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-main border border-slate-800 rounded-xl p-3 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">WhatsApp Phone</label>
                <input
                  type="tel"
                  placeholder="+1 555 019 2831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-main border border-slate-800 rounded-xl p-3 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Passenger Count</label>
                <input
                  type="number"
                  min={1}
                  max={19}
                  value={passengersCount}
                  onChange={(e) => setPassengersCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-main border border-slate-800 rounded-xl p-3 text-white text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-100 to-amber-600 hover:from-amber-400 hover:to-amber-100 text-slate-950 font-extrabold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-base"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            {isSubmitting ? 'Generating Booking Link...' : 'Route Booking to WhatsApp Concierge →'}
          </button>
        </form>
      </div>

      {/* Fleet Inventory */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Crown className="w-6 h-6 text-text-secondary" /> Private Jet Fleet Selection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jets.length > 0 ? (
            jets.map((jet: any) => (
              <div key={jet.id} className="bg-slate-dark border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-amber-100/20 text-text-primary font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
                    {jet.aircraft || 'Executive Jet'}
                  </span>
                  <Crown className="w-5 h-5 text-text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{jet.flight_number}</h3>
                <p className="text-xs text-slate-400 mb-4">{jet.origin} → {jet.destination}</p>
                <div className="text-2xl font-black text-text-secondary mb-4">${Number(jet.price).toLocaleString()}</div>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full bg-slate-main hover:bg-slate-800 text-text-secondary border border-amber-100/30 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Reserve Aircraft
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 bg-slate-dark rounded-2xl border border-slate-800 text-slate-400">
              Loading Private Jet fleet inventory...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
