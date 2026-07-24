'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeaturedFlights, getStats, getPublicPrivateJets, initiatePrivateJetBooking } from '../lib/api';
import { Plane, ShieldCheck, Tag, Globe, Smartphone, Search, Crown, Plus, Trash2, CheckSquare, Square, MessageCircle, Radar, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Mode Selection State ('commercial' | 'private_jet')
  const [bookingMode, setBookingMode] = useState<'commercial' | 'private_jet'>('commercial');

  // Commercial Flight State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  // Private Jet State
  const [tripType, setTripType] = useState<'single' | 'round-trip' | 'multileg'>('single');
  const [legs, setLegs] = useState<Array<{ origin: string; destination: string; departureDate: string; returnDate?: string }>>([
    { origin: 'LHR', destination: 'JFK', departureDate: '', returnDate: '' }
  ]);
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passengersCount, setPassengersCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmittingJet, setIsSubmittingJet] = useState(false);

  // Ticket Tracking Widget State
  const [ticketSearch, setTicketSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    initialData: { totalFlights: 2500, airlines: 45, destinations: 120, averageRating: 4.8 }
  });

  const { data: featured } = useQuery({
    queryKey: ['featured-flights'],
    queryFn: getFeaturedFlights,
    initialData: []
  });

  const { data: privateJets } = useQuery({
    queryKey: ['public-private-jets'],
    queryFn: getPublicPrivateJets,
    initialData: []
  });

  const handleCommercialSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && date) {
      router.push(`/search?origin=${origin}&destination=${destination}&date=${date}`);
    }
  };

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

  const handlePrivateJetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJet(true);
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
        alert('Booking request created! Please contact support via WhatsApp.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit private jet booking inquiry.');
    } finally {
      setIsSubmittingJet(false);
    }
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketSearch.trim()) {
      router.push(`/track?ticket=${encodeURIComponent(ticketSearch.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-dark via-slate-900 to-oxblood py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">


          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary mb-4 tracking-tight">
            Elevate Your Travel Experience
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Book luxury private jet charters or search global commercial airlines with real-time flight telemetry tracking.
          </p>

          {/* Booking Card Container */}
          <div className="bg-slate-dark/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-border-slate max-w-5xl mx-auto shadow-2xl relative z-10 text-left">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border-slate pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBookingMode('commercial')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${bookingMode === 'commercial'
                    ? 'bg-oxblood text-white shadow-lg'
                    : 'bg-slate-main text-text-secondary hover:text-white'
                    }`}
                >
                  <Plane className="w-4 h-4" /> Commercial Flights
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('private_jet')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${bookingMode === 'private_jet'
                    ? 'bg-amber-100 text-slate-950 shadow-lg font-extrabold'
                    : 'bg-amber-100/10 text-text-secondary border border-amber-100/30 hover:bg-amber-200/20'
                    }`}
                >
                  <Crown className="w-4 h-4 text-text-secondary" /> Private Jet Charter
                </button>
              </div>

              <div className="text-xs text-text-secondary flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" /> Instant WhatsApp Confirmation
              </div>
            </div>

            {/* COMMERCIAL SEARCH FORM */}
            {bookingMode === 'commercial' && (
              <form onSubmit={handleCommercialSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col text-left">
                  <label className="text-sm font-semibold text-text-secondary mb-1.5">Origin (IATA)</label>
                  <input
                    type="text"
                    placeholder="e.g. LHR"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    maxLength={3}
                    className="bg-slate-main border border-border-slate rounded-xl p-3.5 text-text-primary focus:outline-none focus:border-oxblood uppercase font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col text-left">
                  <label className="text-sm font-semibold text-text-secondary mb-1.5">Destination (IATA)</label>
                  <input
                    type="text"
                    placeholder="e.g. JFK"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    maxLength={3}
                    className="bg-slate-main border border-border-slate rounded-xl p-3.5 text-text-primary focus:outline-none focus:border-oxblood uppercase font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col text-left">
                  <label className="text-sm font-semibold text-text-secondary mb-1.5">Departure Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-main border border-border-slate rounded-xl p-3.5 text-text-primary focus:outline-none focus:border-oxblood"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <button type="submit" className="bg-oxblood hover:bg-oxblood-bright text-text-primary font-bold rounded-xl p-3.5 flex justify-center items-center gap-2 transition-all shadow-lg">
                    <Search className="w-5 h-5" />
                    Search Flights
                  </button>
                </div>
              </form>
            )}

            {/* PRIVATE JET BOOKING FORM */}
            {bookingMode === 'private_jet' && (
              <form onSubmit={handlePrivateJetSubmit} className="space-y-6">
                {/* Trip Type Toggle Checkboxes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">
                    1. Select Trip Type
                  </label>
                  <div className="flex flex-wrap gap-4 bg-slate-main/60 p-3 rounded-xl border border-slate-800">
                    <label
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer font-medium text-sm transition-all ${tripType === 'single' ? 'bg-amber-100/20 text-text-primary border border-amber-100/40' : 'text-text-secondary hover:text-white'
                        }`}
                      onClick={() => setTripType('single')}
                    >
                      {tripType === 'single' ? <CheckSquare className="w-4 h-4 text-text-secondary" /> : <Square className="w-4 h-4 text-slate-500" />}
                      Single Flight
                    </label>

                    <label
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer font-medium text-sm transition-all ${tripType === 'round-trip' ? 'bg-amber-100/20 text-text-primary border border-amber-100/40' : 'text-text-secondary hover:text-white'
                        }`}
                      onClick={() => setTripType('round-trip')}
                    >
                      {tripType === 'round-trip' ? <CheckSquare className="w-4 h-4 text-text-secondary" /> : <Square className="w-4 h-4 text-slate-500" />}
                      Round-Trip Flight
                    </label>

                    <label
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer font-medium text-sm transition-all ${tripType === 'multileg' ? 'bg-amber-100/20 text-text-primary border border-amber-100/40' : 'text-text-secondary hover:text-white'
                        }`}
                      onClick={() => setTripType('multileg')}
                    >
                      {tripType === 'multileg' ? <CheckSquare className="w-4 h-4 text-text-secondary" /> : <Square className="w-4 h-4 text-slate-500" />}
                      Multileg Trip
                    </label>
                  </div>
                </div>

                {/* Destination & Date Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">
                    2. Destination & Date Itinerary
                  </label>
                  <div className="space-y-3">
                    {legs.map((leg, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-main p-4 rounded-xl border border-slate-800 relative">
                        <div>
                          <label className="text-xs text-text-secondary mb-1 block">Origin (e.g. LHR, JFK)</label>
                          <input
                            type="text"
                            placeholder="Origin City/IATA"
                            value={leg.origin}
                            onChange={(e) => handleLegChange(idx, 'origin', e.target.value.toUpperCase())}
                            className="w-full bg-slate-dark border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm uppercase"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-secondary mb-1 block">Destination (e.g. DXB, NCE)</label>
                          <input
                            type="text"
                            placeholder="Destination City/IATA"
                            value={leg.destination}
                            onChange={(e) => handleLegChange(idx, 'destination', e.target.value.toUpperCase())}
                            className="w-full bg-slate-dark border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm uppercase"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-secondary mb-1 block">Departure Date</label>
                          <input
                            type="date"
                            value={leg.departureDate}
                            onChange={(e) => handleLegChange(idx, 'departureDate', e.target.value)}
                            className="w-full bg-slate-dark border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                            required
                          />
                        </div>
                        {tripType === 'round-trip' && idx === 0 ? (
                          <div>
                            <label className="text-xs text-text-secondary mb-1 block">Return Date</label>
                            <input
                              type="date"
                              value={leg.returnDate || ''}
                              onChange={(e) => handleLegChange(idx, 'returnDate', e.target.value)}
                              className="w-full bg-slate-dark border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex items-end justify-between">
                            <span className="text-xs font-mono text-slate-400 pb-2">LEG #{idx + 1}</span>
                            {legs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLeg(idx)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                                title="Remove Leg"
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
                        className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100/10 border border-amber-100/20"
                      >
                        <Plus className="w-4 h-4" /> Add Another Flight Leg
                      </button>
                    )}
                  </div>
                </div>

                {/* Passenger Contact Info */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">
                    3. Passenger & Contact Information
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full bg-slate-main border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Email</label>
                      <input
                        type="email"
                        placeholder="passenger@swiftwings.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-main border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Phone (WhatsApp)</label>
                      <input
                        type="tel"
                        placeholder="+1 555 019 2831"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-main border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Passengers Count</label>
                      <input
                        type="number"
                        min={1}
                        max={19}
                        value={passengersCount}
                        onChange={(e) => setPassengersCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-main border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingJet}
                    className="w-full bg-gradient-to-r from-amber-100 to-amber-600 hover:from-amber-400 hover:to-amber-100 text-slate-950 font-extrabold text-base py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <MessageCircle className="w-5 h-5 fill-slate-950" />
                    {isSubmittingJet ? 'Initiating Charter Booking...' : 'Book Private Jet via WhatsApp →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Flight Radar Quick Ticket Tracker Bar */}
      <section className="py-8 bg-slate-900 border-y border-slate-800 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-dark/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Radar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Flight Telemetry Tracker</h3>
              <p className="text-xs text-slate-400">Track flight radar map and live location with your ticket number or PNR.</p>
            </div>
          </div>

          <form onSubmit={handleTrackSearch} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Enter Ticket Number or PNR..."
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              className="bg-slate-main border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              Track Map <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Private Jet Charter Showcase Section */}
      <section className="py-16 bg-slate-main px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-text-secondary font-bold text-xs uppercase tracking-wider mb-1">
                <Crown className="w-4 h-4" /> VIP Executive Fleet
              </div>
              <h2 className="text-3xl font-extrabold text-white">Featured Private Jet Charters</h2>
            </div>
            <Link
              href="/private-jets"
              className="text-text-secondary hover:text-text-primary font-semibold text-sm flex items-center gap-1 bg-amber-100/10 border border-amber-100/30 px-4 py-2 rounded-xl transition-colors"
            >
              View All Private Jets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {privateJets.length > 0 ? (
              privateJets.slice(0, 3).map((jet: any) => (
                <div key={jet.id} className="bg-slate-dark border border-slate-800 hover:border-amber-100/50 rounded-2xl p-6 transition-all shadow-xl group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-mono bg-amber-100/20 text-text-primary px-2 py-0.5 rounded font-bold">
                        {jet.aircraft || 'Luxury Jet'}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">{jet.flight_number}</h3>
                    </div>
                    <Crown className="w-6 h-6 text-text-secondary" />
                  </div>

                  <div className="flex items-center justify-between text-slate-300 font-mono my-4 bg-slate-main/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-lg text-white">{jet.origin}</span>
                    <Plane className="w-5 h-5 text-text-secondary rotate-45" />
                    <span className="font-bold text-lg text-white">{jet.destination}</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-6">{jet.airline} • Up to {jet.total_seats} passengers</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">CHARTER PRICE</span>
                      <span className="text-2xl font-black text-text-secondary">${Number(jet.price).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        setBookingMode('private_jet');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-amber-100 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback Seed Cards */
              [
                { aircraft: 'Gulfstream G650ER', code: 'PJ-808', from: 'LHR', to: 'JFK', price: 25000 },
                { aircraft: 'Bombardier Global 7500', code: 'PJ-707', from: 'DXB', to: 'NCE', price: 18500 },
                { aircraft: 'Cessna Citation X+', code: 'PJ-505', from: 'JFK', to: 'MIA', price: 12000 },
              ].map((jet, idx) => (
                <div key={idx} className="bg-slate-dark border border-slate-800 hover:border-amber-100/50 rounded-2xl p-6 transition-all shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-mono bg-amber-100/20 text-text-primary px-2 py-0.5 rounded font-bold">
                        {jet.aircraft}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">{jet.code}</h3>
                    </div>
                    <Crown className="w-6 h-6 text-text-secondary" />
                  </div>

                  <div className="flex items-center justify-between text-slate-300 font-mono my-4 bg-slate-main/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-lg text-white">{jet.from}</span>
                    <Plane className="w-5 h-5 text-text-secondary rotate-45" />
                    <span className="font-bold text-lg text-white">{jet.to}</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-6">VIP Executive Handling • Direct Flight</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">CHARTER PRICE</span>
                      <span className="text-2xl font-black text-text-secondary">${jet.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        setBookingMode('private_jet');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-amber-100 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Commercial Flights */}
      <section className="py-16 bg-slate-dark border-t border-border-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-primary mb-8 border-b-2 border-oxblood inline-block pb-2">
            Featured Commercial Flights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.length > 0 ? (
              featured.map((flight: any) => (
                <div key={flight.id} className="bg-slate-main border border-border-slate rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-text-primary">{flight.origin}</span>
                      <Plane className="w-5 h-5 text-text-secondary" />
                      <span className="text-xl font-bold text-text-primary">{flight.destination}</span>
                    </div>
                    <span className="bg-amber-warning/20 text-amber-warning text-xs font-semibold px-2 py-1 rounded">
                      Featured
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary mb-4">
                    {flight.airline} • Direct
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-text-primary">
                      ${flight.price}
                    </span>
                    <Link href={`/search?origin=${flight.origin}&destination=${flight.destination}&date=${flight.departure_time?.substring(0, 10)}`} className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-4 py-2 rounded-lg font-medium transition-colors">
                      Select
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-main border border-border-slate rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-text-primary">LHR</span>
                    <Plane className="w-5 h-5 text-text-secondary" />
                    <span className="text-xl font-bold text-text-primary">JFK</span>
                  </div>
                  <span className="bg-amber-warning/20 text-amber-warning text-xs font-semibold px-2 py-1 rounded">
                    Featured
                  </span>
                </div>
                <div className="text-sm text-text-secondary mb-4">
                  British Airways • Direct
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold text-text-primary">
                    $499
                  </span>
                  <Link href="/search?origin=LHR&destination=JFK&date=2026-07-20" className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-4 py-2 rounded-lg font-medium transition-colors">
                    Select
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-main border-t border-border-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-12">Why Choose Swift Wings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 bg-slate-dark rounded-xl border border-border-slate hover:shadow-md transition-all">
              <ShieldCheck className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Safe & Secure</h3>
              <p className="text-sm text-text-secondary text-center">Your data and payments are fully protected with industry-leading security.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-dark rounded-xl border border-border-slate hover:shadow-md transition-all">
              <Tag className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Best Prices</h3>
              <p className="text-sm text-text-secondary text-center">We compare hundreds of airlines to guarantee you the lowest fares.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-dark rounded-xl border border-border-slate hover:shadow-md transition-all">
              <Globe className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Wide Coverage</h3>
              <p className="text-sm text-text-secondary text-center">Book flights to over 120 destinations globally with ease.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-dark rounded-xl border border-border-slate hover:shadow-md transition-all">
              <Smartphone className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">WhatsApp Booking</h3>
              <p className="text-sm text-text-secondary text-center">Complete your booking in minutes with our seamless WhatsApp integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-oxblood text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">Ready to find your perfect flight?</h2>
        <Link href="/search" className="inline-block bg-text-primary text-slate-dark font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
          Start Your Journey →
        </Link>
      </section>
    </div>
  );
}
