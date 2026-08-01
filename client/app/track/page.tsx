'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackFlightByTicket } from '../../lib/api';
import Map from '../../components/Map';
import { Radar, Search, AlertCircle, CheckCircle2, Plane, MapPin } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialTicket = searchParams.get('flight') || '';

  const [ticketNumber, setTicketNumber] = useState(initialTicket);
  const [loading, setLoading] = useState(false);
  const [flightData, setFlightData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketNumber.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await trackFlightByTicket(ticketNumber.trim());
      setFlightData(data.flight);
    } catch (err: any) {
      setFlightData(null);
      setError(err.response?.data?.message || err.message || 'Flight Number not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicket) {
      handleTrack();
    }
  }, [initialTicket]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-4rem-120px)]">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
          <Radar className="w-4 h-4 animate-pulse" /> Live Telemetry Radar
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Flight Location Tracker</h1>
        <p className="text-slate-400 text-sm mt-2">
          Enter your Flight Number to view live radar position and flight telemetry.
        </p>
      </div>

      {/* Track Search Box */}
      <div className="bg-slate-dark p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl mx-auto mb-10">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. SW-JET-901, PJ-808"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="w-full bg-slate-main border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm uppercase"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Radar className="w-4 h-4" />
            {loading ? 'Locating...' : 'Track Flight'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Tracked Results Display */}
      {flightData && (
        <div className="space-y-6">
          {/* Status Bar Header */}
          <div className="bg-slate-dark border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${flightData.isPrivateJet ? 'bg-amber-100/20 text-text-secondary border border-amber-100/30' : 'bg-oxblood/20 text-oxblood-bright border border-oxblood/30'}`}>
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{flightData.flightNumber}</h2>
                  {flightData.isPrivateJet && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100/20 text-text-primary border border-amber-100/40 rounded-full">
                      PRIVATE JET
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {flightData.airline} ({flightData.airlineCode}) • {flightData.aircraft}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block font-mono">STATUS</span>
                <span className="text-emerald-400 font-extrabold text-sm uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {flightData.status || 'Active In-Flight'}
                </span>
              </div>
            </div>
          </div>

          {/* Map Component Edits Display */}
          <Map
            latitude={flightData.latitude}
            longitude={flightData.longitude}
            currentLocation={flightData.currentLocation || `${flightData.origin} → ${flightData.destination}`}
            flightNumber={flightData.flightNumber}
            origin={flightData.origin}
            destination={flightData.destination}
            status={flightData.status}
            isPrivateJet={flightData.isPrivateJet}
            aircraft={flightData.aircraft}
            onRefresh={handleTrack}
          />
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading Flight Telemetry Radar...</div>}>
      <TrackContent />
    </Suspense>
  );
}
