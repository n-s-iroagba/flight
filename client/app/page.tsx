'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeaturedFlights, getStats } from '../lib/api';
import { Plane, ShieldCheck, Tag, Globe, Smartphone, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(origin && destination && date) {
      router.push(`/search?origin=${origin}&destination=${destination}&date=${date}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-dark to-oxblood py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            Find Your Next Adventure
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-12">
            Search and book flights from hundreds of airlines
          </p>

          {/* Search Form */}
          <div className="bg-slate-dark p-6 rounded-2xl border border-border-slate max-w-4xl mx-auto shadow-2xl relative z-10">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col text-left">
                <label className="text-sm text-text-secondary mb-1">From</label>
                <input 
                  type="text" 
                  placeholder="e.g. LHR"
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
                  placeholder="e.g. JFK"
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
                  Search Flights
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-main border-b border-border-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-dark p-6 rounded-xl border-l-4 border-oxblood flex flex-col items-center">
              <span className="text-3xl font-bold text-text-primary">{stats?.totalFlights?.toLocaleString() || '2,500'}+</span>
              <span className="text-sm text-text-secondary mt-1">Flights</span>
            </div>
            <div className="bg-slate-dark p-6 rounded-xl border-l-4 border-oxblood flex flex-col items-center">
              <span className="text-3xl font-bold text-text-primary">{stats?.airlines || '45'}</span>
              <span className="text-sm text-text-secondary mt-1">Airlines</span>
            </div>
            <div className="bg-slate-dark p-6 rounded-xl border-l-4 border-oxblood flex flex-col items-center">
              <span className="text-3xl font-bold text-text-primary">{stats?.destinations || '120'}</span>
              <span className="text-sm text-text-secondary mt-1">Cities</span>
            </div>
            <div className="bg-slate-dark p-6 rounded-xl border-l-4 border-oxblood flex flex-col items-center">
              <span className="text-3xl font-bold text-text-primary">{stats?.averageRating || '4.8'}★</span>
              <span className="text-sm text-text-secondary mt-1">Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flights */}
      <section className="py-16 bg-slate-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-primary mb-8 border-b-2 border-oxblood inline-block pb-2">
            Featured Flights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.length > 0 ? (
              featured.map((flight: any) => (
                <div key={flight.id} className="bg-slate-dark border border-border-slate rounded-xl p-6 hover:shadow-lg transition-shadow">
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
                    <Link href={`/search?origin=${flight.origin}&destination=${flight.destination}&date=${flight.departure_time?.substring(0,10)}`} className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-4 py-2 rounded-lg font-medium transition-colors">
                      Select
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Fallback Featured Flights
              <div className="bg-slate-dark border border-border-slate rounded-xl p-6 hover:shadow-lg transition-shadow">
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
      <section className="py-16 bg-slate-dark border-t border-border-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 bg-slate-main rounded-xl border border-border-slate hover:shadow-md transition-all">
              <ShieldCheck className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Safe & Secure</h3>
              <p className="text-sm text-text-secondary text-center">Your data and payments are fully protected with industry-leading security.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-main rounded-xl border border-border-slate hover:shadow-md transition-all">
              <Tag className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Best Prices</h3>
              <p className="text-sm text-text-secondary text-center">We compare hundreds of airlines to guarantee you the lowest fares.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-main rounded-xl border border-border-slate hover:shadow-md transition-all">
              <Globe className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Wide Coverage</h3>
              <p className="text-sm text-text-secondary text-center">Book flights to over 120 destinations globally with ease.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-main rounded-xl border border-border-slate hover:shadow-md transition-all">
              <Smartphone className="w-12 h-12 text-oxblood mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Easy Booking</h3>
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
