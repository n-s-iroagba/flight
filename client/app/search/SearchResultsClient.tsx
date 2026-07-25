'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchFlights } from '../../lib/api';
import { Plane, Filter, Clock, Search, Users, MessageCircle, Crown, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTripType = (searchParams.get('tripType') as 'one-way' | 'direct' | 'round-trip' | 'multileg') || 'one-way';
  const initialOrigin = searchParams.get('origin') || '';
  const initialDestination = searchParams.get('destination') || '';
  const initialDate = searchParams.get('date') || '';
  const initialReturnDate = searchParams.get('returnDate') || '';
  const initialDirectOnly = searchParams.get('directOnly') === 'true';
  const initialLegs = searchParams.get('legs') || '';
  const initialPassengers = searchParams.get('passengers') || '1';

  const [tripType, setTripType] = useState(initialTripType);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(initialDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [directOnly, setDirectOnly] = useState(initialDirectOnly);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [selectedAircraft, setSelectedAircraft] = useState<string>('all');

  let parsedLegs: any[] = [];
  try {
    if (initialLegs) parsedLegs = JSON.parse(initialLegs);
  } catch (e) { }

  const { data, isLoading, error } = useQuery({
    queryKey: ['flights', tripType, initialOrigin, initialDestination, initialDate, initialReturnDate, initialDirectOnly, initialLegs],
    queryFn: () => searchFlights({
      tripType,
      origin: initialOrigin,
      destination: initialDestination,
      departureDate: initialDate,
      returnDate: initialReturnDate,
      directOnly: initialDirectOnly,
      legs: parsedLegs
    }),
    enabled: !!((initialOrigin && initialDestination && initialDate) || parsedLegs.length > 0)
  });

  const responseData = data?.data || data || {};
  const flights = responseData?.flights || [];
  const outboundFlights = responseData?.outbound || [];
  const inboundFlights = responseData?.inbound || [];
  const legsResults = responseData?.legsResults || [];

  const handleSearchUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tripType === 'multileg' && parsedLegs.length > 0) {
      const legsParam = encodeURIComponent(JSON.stringify(parsedLegs));
      router.push(`/search?tripType=multileg&legs=${legsParam}&directOnly=${directOnly}&passengers=${passengers}`);
      return;
    }

    if (origin && destination && date) {
      let query = `/search?tripType=${tripType}&origin=${origin}&destination=${destination}&date=${date}&directOnly=${directOnly}&passengers=${passengers}`;
      if (tripType === 'round-trip' && returnDate) {
        query += `&returnDate=${returnDate}`;
      }
      router.push(query);
    }
  };

  const filterFlightList = (list: any[]) => {
    return list.filter((flight: any) => {
      if (directOnly && (flight.stops || 0) > 0) return false;
      if (selectedAircraft === 'all') return true;
      return (flight.aircraft || flight.airline || '').toLowerCase().includes(selectedAircraft.toLowerCase());
    });
  };

  const renderFlightCard = (flight: any, tag?: string) => (
    <div key={flight.id || flight.offerId} className="bg-slate-dark border border-border-slate rounded-2xl p-6 hover:shadow-xl transition-all hover:border-oxblood/40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-text-primary flex items-center gap-2 text-base">
              {flight.airline}
              <span className="text-xs font-normal text-slate-400 bg-slate-main px-2 py-0.5 rounded border border-slate-800">
                {flight.aircraft || 'Commercial Aircraft'}
              </span>
              {flight.stops === 0 ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Direct Non-Stop
                </span>
              ) : (
                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {flight.stops || 1} Stop
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {tag && (
                <span className="text-xs font-bold bg-oxblood/20 text-oxblood border border-oxblood/40 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              )}
              <span className="text-xs text-text-secondary bg-slate-main px-2.5 py-1 rounded-full border border-slate-800">
                {flight.source === 'letsfg' ? 'Global Offer' : 'Direct Booking'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center min-w-[70px]">
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {(flight.departureTime || flight.departure_time)
                  ? new Date(flight.departureTime || flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '10:00 AM'}
              </div>
              <div className="text-text-secondary text-xs sm:text-sm font-bold">{flight.origin}</div>
            </div>

            <div className="flex-1 px-3 sm:px-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border-slate -translate-y-1/2" />
              <div className="flex justify-center relative">
                <span className="bg-slate-dark px-2.5 py-0.5 rounded-full border border-border-slate text-xs text-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3 text-oxblood" />
                  {flight.duration || 'Non-Stop'}
                </span>
              </div>
            </div>

            <div className="text-center min-w-[70px]">
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {(flight.arrivalTime || flight.arrival_time)
                  ? new Date(flight.arrivalTime || flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '02:30 PM'}
              </div>
              <div className="text-text-secondary text-xs sm:text-sm font-bold">{flight.destination}</div>
            </div>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-border-slate pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto gap-3">
          <div className="text-2xl sm:text-3xl font-black text-text-primary">
            ${flight.price}
          </div>
          <Link
            href={`/book/${flight.id}?source=${flight.source}&offerId=${flight.offerId || ''}&tripType=${tripType}&origin=${flight.origin}&destination=${flight.destination}&price=${flight.price}${initialReturnDate ? `&returnDate=${initialReturnDate}` : ''}${initialLegs ? `&legs=${encodeURIComponent(initialLegs)}` : ''}&passengers=${passengers}`}
            className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-6 py-2.5 rounded-xl font-bold transition-all text-center whitespace-nowrap shadow-md flex items-center gap-2 text-sm"
          >
            <MessageCircle className="w-4 h-4" /> Select & Book
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem-120px)]">
      {/* Search Header Form */}
      <div className="bg-slate-dark p-6 rounded-2xl border border-border-slate mb-8 shadow-xl">
        <form onSubmit={handleSearchUpdate} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-slate pb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTripType('one-way')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tripType === 'one-way' ? 'bg-oxblood text-white' : 'bg-slate-main text-text-secondary'}`}
              >
                Direct / One-Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('round-trip')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tripType === 'round-trip' ? 'bg-oxblood text-white' : 'bg-slate-main text-text-secondary'}`}
              >
                Round-Trip
              </button>
              <button
                type="button"
                onClick={() => setTripType('multileg')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tripType === 'multileg' ? 'bg-oxblood text-white' : 'bg-slate-main text-text-secondary'}`}
              >
                Multileg
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={directOnly}
                onChange={(e) => setDirectOnly(e.target.checked)}
                className="rounded border-border-slate text-oxblood focus:ring-oxblood bg-slate-main"
              />
              Direct Non-Stop Only
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-text-secondary mb-1">Departure Airport</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="e.g. LHR"
                className="bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood uppercase font-mono text-sm"
                required={tripType !== 'multileg'}
              />
            </div>
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-text-secondary mb-1">Arrival Airport</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="e.g. JFK"
                className="bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood uppercase font-mono text-sm"
                required={tripType !== 'multileg'}
              />
            </div>
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-text-secondary mb-1">Departure Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood text-sm"
                required={tripType !== 'multileg'}
              />
            </div>

            {tripType === 'round-trip' ? (
              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-text-secondary mb-1">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood text-sm"
                  required
                />
              </div>
            ) : (
              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-oxblood" /> Passengers
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="bg-slate-main border border-border-slate rounded-xl p-3 text-text-primary focus:outline-none focus:border-oxblood text-sm"
                  required
                />
              </div>
            )}

            <div className="flex flex-col justify-end">
              <button type="submit" className="bg-oxblood hover:bg-oxblood-bright text-text-primary font-bold rounded-xl p-3 flex justify-center items-center gap-2 transition-colors shadow-md text-sm">
                <Search className="w-4 h-4" />
                Update Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <div className="bg-slate-dark border border-border-slate rounded-2xl p-6 sticky top-24 shadow-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-border-slate pb-4">
              <Filter className="text-oxblood w-5 h-5" />
              <h3 className="text-lg font-bold text-text-primary">Flight Filters</h3>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-3 text-sm flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> Aircraft Carrier
              </h4>
              <select
                value={selectedAircraft}
                onChange={(e) => setSelectedAircraft(e.target.value)}
                className="w-full bg-slate-main border border-border-slate rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-oxblood"
              >
                <option value="all">All Aircraft Types</option>
                <option value="Gulfstream">Gulfstream Executive Jets</option>
                <option value="Bombardier">Bombardier Global</option>
                <option value="Boeing">Boeing 787 Commercial</option>
                <option value="Airbus">Airbus A350</option>
                <option value="British Airways">British Airways</option>
              </select>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-3 text-sm">Routing Direct Preference</h4>
              <label className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={(e) => setDirectOnly(e.target.checked)}
                  className="rounded border-border-slate text-oxblood focus:ring-oxblood bg-slate-main"
                />
                Show Direct Non-Stop Flights Only
              </label>
            </div>

            <div className="pt-4 border-t border-border-slate bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <MessageCircle className="w-4 h-4" /> WhatsApp Booking Flow
              </div>
              <p className="text-[11px] text-slate-300">
                Book any direct, round-trip, or multileg option with instant bank transfer details & WhatsApp ticket delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Results Main Section */}
        <div className="lg:w-3/4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-dark border border-border-slate rounded-xl p-6 h-40 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-error/10 border border-red-error text-red-error p-4 rounded-xl">
              Failed to load flights. Please try again.
            </div>
          ) : tripType === 'round-trip' ? (
            /* Round-Trip Display */
            <div className="space-y-8">
              {/* Outbound Segment */}
              <div>
                <div className="mb-4 flex items-center justify-between bg-slate-dark/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Plane className="w-5 h-5 text-oxblood" /> Outbound Flight: {initialOrigin} <ArrowRight className="w-4 h-4 text-text-secondary" /> {initialDestination}
                  </h3>
                  <span className="text-xs text-text-secondary font-mono">{initialDate}</span>
                </div>

                {filterFlightList(outboundFlights).length === 0 ? (
                  <div className="bg-slate-dark border border-border-slate rounded-xl p-8 text-center text-text-secondary">
                    No outbound flights found for this route.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterFlightList(outboundFlights).map((f) => renderFlightCard(f, 'Outbound Leg'))}
                  </div>
                )}
              </div>

              {/* Inbound Segment */}
              <div>
                <div className="mb-4 flex items-center justify-between bg-slate-dark/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-oxblood" /> Return Flight: {initialDestination} <ArrowRight className="w-4 h-4 text-text-secondary" /> {initialOrigin}
                  </h3>
                  <span className="text-xs text-text-secondary font-mono">{initialReturnDate || 'Return Date'}</span>
                </div>

                {filterFlightList(inboundFlights).length === 0 ? (
                  <div className="bg-slate-dark border border-border-slate rounded-xl p-8 text-center text-text-secondary">
                    No return flights found for this route.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterFlightList(inboundFlights).map((f) => renderFlightCard(f, 'Return Leg'))}
                  </div>
                )}
              </div>
            </div>
          ) : tripType === 'multileg' ? (
            /* Multileg Display */
            <div className="space-y-8">
              {legsResults.map((legItem: any) => (
                <div key={legItem.legIndex} className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-dark/80 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-oxblood text-white text-xs flex items-center justify-center font-bold">
                        {legItem.legIndex}
                      </span>
                      Leg #{legItem.legIndex}: {legItem.origin} <ArrowRight className="w-4 h-4 text-text-secondary" /> {legItem.destination}
                    </h3>
                    <span className="text-xs text-text-secondary font-mono">{legItem.departureDate}</span>
                  </div>

                  {filterFlightList(legItem.flights || []).length === 0 ? (
                    <div className="bg-slate-dark border border-border-slate rounded-xl p-8 text-center text-text-secondary">
                      No flights found for Leg #{legItem.legIndex}.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filterFlightList(legItem.flights || []).map((f) => renderFlightCard(f, `Leg #${legItem.legIndex}`))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* One-Way / Direct Display */
            <div className="space-y-4">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary">
                  Available Flights ({filterFlightList(flights).length} found)
                </h2>
              </div>

              {filterFlightList(flights).length === 0 ? (
                <div className="bg-slate-dark border border-border-slate rounded-xl p-12 text-center">
                  <Plane className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">No flights found</h3>
                  <p className="text-text-secondary">Try adjusting your search criteria or toggling direct flight filters.</p>
                </div>
              ) : (
                filterFlightList(flights).map((flight: any) => renderFlightCard(flight))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
