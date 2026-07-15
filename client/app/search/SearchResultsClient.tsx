'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { searchFlights } from '../../lib/api';
import { Plane, Filter, Clock, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialOrigin = searchParams.get('origin') || '';
  const initialDestination = searchParams.get('destination') || '';
  const initialDate = searchParams.get('date') || '';

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(initialDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ['flights', initialOrigin, initialDestination, initialDate],
    queryFn: () => searchFlights({
      origin: initialOrigin,
      destination: initialDestination,
      departureDate: initialDate
    }),
    enabled: !!(initialOrigin && initialDestination && initialDate)
  });

  const flights = data?.data?.flights || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && date) {
      router.push(`/search?origin=${origin}&destination=${destination}&date=${date}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem-120px)]">
      {/* Search Header Form */}
      <div className="bg-slate-dark p-6 rounded-2xl border border-border-slate mb-8 shadow-xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col text-left">
            <label className="text-sm text-text-secondary mb-1">From</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              className="bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood uppercase"
              required
            />
          </div>
          <div className="flex flex-col text-left">
            <label className="text-sm text-text-secondary mb-1">To</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
              className="bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood uppercase"
              required
            />
          </div>
          <div className="flex flex-col text-left">
            <label className="text-sm text-text-secondary mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-main border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood"
              required
            />
          </div>
          <div className="flex flex-col justify-end">
            <button type="submit" className="bg-oxblood hover:bg-oxblood-bright text-text-primary font-semibold rounded-lg p-3 flex justify-center items-center gap-2 transition-colors">
              <Search className="w-5 h-5" />
              Update Search
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-slate-dark border border-border-slate rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6 border-b border-border-slate pb-4">
              <Filter className="text-oxblood w-5 h-5" />
              <h3 className="text-lg font-bold text-text-primary">Filters</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Stops</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer">
                    <input type="checkbox" className="rounded border-border-slate text-oxblood focus:ring-oxblood bg-slate-main" />
                    Direct
                  </label>
                  <label className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer">
                    <input type="checkbox" className="rounded border-border-slate text-oxblood focus:ring-oxblood bg-slate-main" />
                    1 Stop
                  </label>
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">
              {isLoading ? 'Searching...' : `Results (${flights.length} found)`}
            </h2>
          </div>

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
          ) : flights.length === 0 ? (
            <div className="bg-slate-dark border border-border-slate rounded-xl p-12 text-center">
              <Plane className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-primary mb-2">No flights found</h3>
              <p className="text-text-secondary">Try adjusting your search criteria or dates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flights.map((flight: any) => (
                <div key={flight.id || flight.offerId} className="bg-slate-dark border border-border-slate rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-text-primary flex items-center gap-2">
                          {flight.airline}
                          {flight.isFeatured && <span className="bg-amber-warning/20 text-amber-warning text-xs px-2 py-0.5 rounded">Featured</span>}
                        </span>
                        <span className="text-xs text-text-secondary bg-slate-main px-2 py-1 rounded">
                          Source: {flight.source}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg sm:text-2xl font-bold text-text-primary">{new Date(flight.departure_time || flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-text-secondary text-xs sm:text-base">{flight.origin}</div>
                        </div>

                        <div className="flex-1 px-3 sm:px-8 relative">
                          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border-slate -translate-y-1/2" />
                          <div className="flex justify-center relative">
                            <span className="bg-slate-dark px-2 text-xs text-text-secondary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {flight.duration || 'Direct'}
                            </span>
                          </div>
                        </div>

                        <div className="text-center min-w-[60px]">
                          <div className="text-lg sm:text-2xl font-bold text-text-primary">{new Date(flight.arrival_time || flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-text-secondary text-xs sm:text-base">{flight.destination}</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-border-slate pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto gap-3">
                      <div className="text-2xl sm:text-3xl font-bold text-text-primary">
                        ${flight.price}
                      </div>
                      <Link
                        href={`/book/${flight.id}?source=${flight.source}&offerId=${flight.offerId || ''}`}
                        className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-6 py-2 rounded-lg font-medium transition-colors text-center whitespace-nowrap"
                      >
                        Select
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
