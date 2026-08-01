'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdminPrivateJets,
  createAdminPrivateJet,
  updateAdminPrivateJet,
  deleteAdminPrivateJet,
  seedAdminPrivateJets,
  updateFlightLocation,
} from '@/lib/api';
import Map from '@/components/Map';
import {
  Crown,
  Plus,
  RefreshCw,
  Trash2,
  MapPin,
  Navigation,
  Edit2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Plane,
  DollarSign,
  Users,
  Eye,
  X
} from 'lucide-react';

export default function AdminPrivateJetsPage() {
  const router = useRouter();
  const [jets, setJets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Location update modal state
  const [selectedJetForLocation, setSelectedJetForLocation] = useState<any>(null);
  const [latInput, setLatInput] = useState<number>(51.5074);
  const [lngInput, setLngInput] = useState<number>(-0.1278);
  const [locationNameInput, setLocationNameInput] = useState<string>('Cruising over Atlantic Ocean');

  // Edit Jet Modal state
  const [editingJet, setEditingJet] = useState<any>(null);

  // Radar map preview jet
  const [radarJet, setRadarJet] = useState<any>(null);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    origin: 'LHR',
    destination: 'JFK',
    departure_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    arrival_time: new Date(Date.now() + 86400000 + 25200000).toISOString().slice(0, 16),
    airline: 'Swift Wings Private',
    flight_number: 'SW-JET-901',
    price: 18500,
    total_seats: 10,
    available_seats: 10,
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

  const handleUpdateJetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJet) return;
    try {
      await updateAdminPrivateJet(editingJet.id, editingJet);
      setMessage(`Private jet ${editingJet.flight_number} updated successfully!`);
      setEditingJet(null);
      fetchJets();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update private jet details.');
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

  // Stats calculation
  const totalFleetSeats = jets.reduce((acc, j) => acc + (j.total_seats || 0), 0);
  const avgCharterPrice = jets.length ? Math.round(jets.reduce((acc, j) => acc + Number(j.price || 0), 0) / jets.length) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen pb-16">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-main p-6 sm:p-8 rounded-2xl border border-border-slate shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4 text-amber-400" /> Executive Private Aviation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Private Jet Management & Fleet Radar</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage VIP charter flights, update live telemetry coordinates, and dispatch instant quotes via email.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            className="bg-slate-dark hover:bg-slate-dark/80 text-text-primary border border-border-slate px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" /> Seed Sample Jets
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-oxblood hover:bg-oxblood-bright text-white px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Private Jet Flight
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </span>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> {errorMessage}
          </span>
          <button onClick={() => setErrorMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-main border border-border-slate rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-secondary uppercase">Active Charter Jets</div>
              <div className="text-xl font-bold text-text-primary">{jets.length} Aircraft</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-main border border-border-slate rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-secondary uppercase">Total Passenger Seats</div>
              <div className="text-xl font-bold text-text-primary">{totalFleetSeats} Seats</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-main border border-border-slate rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-secondary uppercase">Average Charter Rate</div>
              <div className="text-xl font-bold text-text-primary">${avgCharterPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-main border border-border-slate rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-oxblood/20 border border-oxblood/30 text-oxblood rounded-lg">
              <Plane className="w-5 h-5 text-oxblood" />
            </div>
            <div>
              <div className="text-xs text-text-secondary uppercase">Mail Dispatcher</div>
              <div className="text-xs font-mono font-bold text-emerald-400">booking@swiftwings.online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-slate-main border border-border-slate rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border-slate flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" /> Private Jet Fleet Directory ({jets.length})
          </h2>
          <button onClick={fetchJets} className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-secondary text-sm">Loading private jet fleet data...</div>
        ) : jets.length === 0 ? (
          <div className="p-12 text-center text-text-secondary text-sm space-y-3">
            <p>No Private Jet charter flights currently registered.</p>
            <button
              onClick={handleSeed}
              className="bg-oxblood text-white text-xs px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Seed Default Fleet Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-slate">
            {jets.map((jet) => (
              <div key={jet.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-dark/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400 shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-text-primary">{jet.flight_number}</h3>
                      <span className="text-[11px] font-mono bg-slate-dark text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-lg">
                        {jet.aircraft}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                        VIP Charter
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary font-mono mt-1">
                      <span className="text-text-primary font-bold">{jet.origin} → {jet.destination}</span> • ${Number(jet.price).toLocaleString()} • {jet.available_seats}/{jet.total_seats} passenger seats
                    </p>

                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Radar Location: Lat {jet.current_latitude || '51.5074'}, Lng {jet.current_longitude || '-0.1278'} ({jet.current_location || 'In Transit'})
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-border-slate">
                  <button
                    onClick={() => setRadarJet(jet)}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Radar
                  </button>

                  <button
                    onClick={() => handleOpenLocationModal(jet)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Telemetry
                  </button>

                  <button
                    onClick={() => setEditingJet(jet)}
                    className="bg-slate-dark hover:bg-slate-dark/70 text-text-primary border border-border-slate px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Edit
                  </button>

                  <button
                    onClick={() => router.push('/admin/mail')}
                    className="bg-oxblood/20 hover:bg-oxblood/30 text-oxblood border border-oxblood/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Send Quote Email from booking@swiftwings.online"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Quote
                  </button>

                  <button
                    onClick={() => handleDeleteJet(jet.id)}
                    className="p-2 text-red-error hover:text-red-400 hover:bg-red-500/10 border border-border-slate rounded-xl transition-colors"
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

      {/* Radar Map Preview Modal */}
      {radarJet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-main border border-border-slate rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border-slate pb-3">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Real-time Radar: {radarJet.flight_number} ({radarJet.aircraft})
              </h3>
              <button onClick={() => setRadarJet(null)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-text-secondary">
              Current Position: <span className="text-emerald-400 font-mono font-bold">{radarJet.current_location || 'En route'}</span> • Coordinates: {radarJet.current_latitude || '51.5074'}, {radarJet.current_longitude || '-0.1278'}
            </p>

            <div className="h-80 rounded-2xl overflow-hidden border border-border-slate">
              <Map
                latitude={radarJet.current_latitude ? Number(radarJet.current_latitude) : 51.5074}
                longitude={radarJet.current_longitude ? Number(radarJet.current_longitude) : -0.1278}
                locationName={`${radarJet.flight_number} - ${radarJet.current_location || 'In Flight'}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Jet Modal */}
      {editingJet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-main border border-border-slate rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-border-slate pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" /> Edit Private Jet: {editingJet.flight_number}
              </h3>
              <button onClick={() => setEditingJet(null)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateJetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Origin (IATA)</label>
                  <input
                    type="text"
                    value={editingJet.origin || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, origin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary font-mono uppercase text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Destination (IATA)</label>
                  <input
                    type="text"
                    value={editingJet.destination || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, destination: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary font-mono uppercase text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Flight Number</label>
                  <input
                    type="text"
                    value={editingJet.flight_number || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, flight_number: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Aircraft Model</label>
                  <input
                    type="text"
                    value={editingJet.aircraft || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, aircraft: e.target.value })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Price ($)</label>
                  <input
                    type="number"
                    value={editingJet.price || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Total Seats</label>
                  <input
                    type="number"
                    value={editingJet.total_seats || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, total_seats: parseInt(e.target.value) })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">Available Seats</label>
                  <input
                    type="number"
                    value={editingJet.available_seats || ''}
                    onChange={(e) => setEditingJet({ ...editingJet, available_seats: parseInt(e.target.value) })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-slate">
                <button
                  type="button"
                  onClick={() => setEditingJet(null)}
                  className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-oxblood hover:bg-oxblood-bright text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
                >
                  Save Jet Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telemetry Modal */}
      {selectedJetForLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-main border border-border-slate rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" /> Update Jet Telemetry & Coordinates
            </h3>
            <p className="text-xs text-text-secondary">
              Update live coordinates for Private Jet <span className="text-amber-400 font-mono font-bold">{selectedJetForLocation.flight_number}</span>.
            </p>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-text-secondary mb-1 block">Latitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-dark border border-border-slate rounded-xl p-3 text-text-primary font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary mb-1 block">Longitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-dark border border-border-slate rounded-xl p-3 text-text-primary font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1 block">Location Description</label>
                <input
                  type="text"
                  value={locationNameInput}
                  onChange={(e) => setLocationNameInput(e.target.value)}
                  className="w-full bg-slate-dark border border-border-slate rounded-xl p-3 text-text-primary text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-slate">
                <button
                  type="button"
                  onClick={() => setSelectedJetForLocation(null)}
                  className="px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
                >
                  Save Telemetry Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-main border border-border-slate rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" /> Create Private Jet Flight
            </h3>

            <form onSubmit={handleCreateJet} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Origin (IATA)</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary font-mono uppercase text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Destination (IATA)</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary font-mono uppercase text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Flight Number</label>
                  <input
                    type="text"
                    value={formData.flight_number}
                    onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Aircraft Model</label>
                  <input
                    type="text"
                    value={formData.aircraft}
                    onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Total Seats</label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value), available_seats: parseInt(e.target.value) })}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-2.5 text-text-primary text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-slate">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-oxblood hover:bg-oxblood-bright text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
                >
                  Create Private Jet Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
