'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminPrivateJets,
  createAdminPrivateJet,
  updateAdminPrivateJet,
  deleteAdminPrivateJet,
  seedAdminPrivateJets,
  updateFlightLocation,
} from '../../../lib/api';
import Map from '../../../components/Map';
import { Crown, Plus, RefreshCw, Trash2, MapPin, Navigation, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminPrivateJetsPage() {
  const [jets, setJets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Location update modal/form state
  const [selectedJetForLocation, setSelectedJetForLocation] = useState<any>(null);
  const [latInput, setLatInput] = useState<number>(51.5074);
  const [lngInput, setLngInput] = useState<number>(-0.1278);
  const [locationNameInput, setLocationNameInput] = useState<string>('Cruising over Atlantic Ocean');

  // Create/Edit Jet Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    airline: 'Swift Wings Private',
    flight_number: '',
    price: 15000,
    total_seats: 8,
    available_seats: 8,
    aircraft: 'Gulfstream G650ER',
  });

  const fetchJets = async () => {
    setLoading(true);
    try {
      const data = await getAdminPrivateJets();
      setJets(data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load private jet flights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJets();
  }, []);

  const handleSeed = async () => {
    try {
      setMessage('Seeding sample private jet flights...');
      await seedAdminPrivateJets();
      setMessage('Private jets successfully seeded!');
      fetchJets();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed private jets.');
    }
  };

  const handleCreateJet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminPrivateJet(formData);
      setMessage('Private jet created successfully!');
      setShowCreateModal(false);
      fetchJets();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create private jet.');
    }
  };

  const handleDeleteJet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this private jet flight?')) return;
    try {
      await deleteAdminPrivateJet(id);
      setMessage('Private jet deleted successfully.');
      fetchJets();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete private jet.');
    }
  };

  const handleOpenLocationModal = (jet: any) => {
    setSelectedJetForLocation(jet);
    setLatInput(jet.current_latitude ? Number(jet.current_latitude) : 51.5074);
    setLngInput(jet.current_longitude ? Number(jet.current_longitude) : -0.1278);
    setLocationNameInput(jet.current_location || 'En route to destination');
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJetForLocation) return;
    try {
      await updateFlightLocation(selectedJetForLocation.id, {
        latitude: Number(latInput),
        longitude: Number(lngInput),
        currentLocation: locationNameInput,
      });
      setMessage(`Flight ${selectedJetForLocation.flight_number} location updated!`);
      setSelectedJetForLocation(null);
      fetchJets();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update flight location.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-text-secondary font-bold text-xs uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4" /> Admin Operations
          </div>
          <h1 className="text-3xl font-extrabold text-white">Private Jet Management & Radar Updates</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            className="bg-slate-800 hover:bg-slate-700 text-text-primary border border-amber-100/30 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Seed Private Jets
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-100 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Private Jet Flight
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> {errorMessage}
        </div>
      )}

      {/* Private Jets List */}
      <div className="bg-slate-dark border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-12">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Active Private Jets ({jets.length})</h2>
          <button onClick={fetchJets} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading Private Jets data...</div>
        ) : jets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No Private Jet flights found. Click &quot;Seed Private Jets&quot; to populate.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {jets.map((jet) => (
              <div key={jet.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-main/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100/10 border border-amber-100/30 rounded-xl text-text-secondary">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{jet.flight_number}</h3>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {jet.aircraft}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {jet.origin} → {jet.destination} • ${Number(jet.price).toLocaleString()} • {jet.available_seats}/{jet.total_seats} seats
                    </p>
                    <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Current Coordinates: Lat {jet.current_latitude || '51.5074'}, Lng {jet.current_longitude || '-0.1278'} ({jet.current_location || 'In Transit'})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => handleOpenLocationModal(jet)}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Update Location (Lat/Lng)
                  </button>
                  <button
                    onClick={() => handleDeleteJet(jet.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-slate-800 rounded-xl"
                    title="Delete Jet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Update Modal */}
      {selectedJetForLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-dark border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" /> Update Flight Telemetry
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Update real-time coordinates for Private Jet flight <span className="text-text-secondary font-mono font-bold">{selectedJetForLocation.flight_number}</span>.
            </p>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Latitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-main border border-slate-700 rounded-xl p-3 text-white font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Longitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-main border border-slate-700 rounded-xl p-3 text-white font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Current Location Description</label>
                <input
                  type="text"
                  value={locationNameInput}
                  onChange={(e) => setLocationNameInput(e.target.value)}
                  className="w-full bg-slate-main border border-slate-700 rounded-xl p-3 text-white text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedJetForLocation(null)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
                >
                  Save Telemetry Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-dark border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-text-secondary" /> Create Private Jet Flight
            </h3>

            <form onSubmit={handleCreateJet} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Origin (IATA)</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Destination (IATA)</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Flight Number</label>
                  <input
                    type="text"
                    value={formData.flight_number}
                    onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Aircraft</label>
                  <input
                    type="text"
                    value={formData.aircraft}
                    onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Departure Time</label>
                  <input
                    type="datetime-local"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Arrival Time</label>
                  <input
                    type="datetime-local"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Total Seats</label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value), available_seats: parseInt(e.target.value) })}
                    className="w-full bg-slate-main border border-slate-700 rounded-xl p-2.5 text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-100 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
                >
                  Create Private Jet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
