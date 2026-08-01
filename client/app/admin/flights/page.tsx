'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminFlights, deleteAdminFlight } from '../../../lib/api';
import { Plus, Filter, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminFlights() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-flights'],
    queryFn: () => getAdminFlights()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminFlight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flights'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this flight record?')) {
      deleteMutation.mutate(id);
    }
  };

  const flights = data?.flights || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
          ✈️ Manage Commercial Flights
        </h1>
        <Link 
          href="/admin/flights/create"
          className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add New Flight
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-main border border-border-slate rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-text-secondary border-r border-border-slate pr-4">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <select className="bg-slate-dark border border-border-slate rounded p-2 text-sm text-text-primary focus:outline-none">
          <option>All Airlines</option>
          <option>British Airways</option>
        </select>
        <select className="bg-slate-dark border border-border-slate rounded p-2 text-sm text-text-primary focus:outline-none">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Flights Table */}
      <div className="bg-slate-main border border-border-slate rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-slate bg-slate-main/50">
          <div className="text-sm text-text-secondary font-medium">
            Results: {flights.length} flights found
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-dark border-b border-border-slate">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Flight</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Route</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Stops</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Schedule</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Price</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Status/Seats</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-slate">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">Loading flights...</td>
                </tr>
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">No flights found. Create one above.</td>
                </tr>
              ) : flights.map((flight: any) => (
                <tr key={flight.id} className="hover:bg-slate-dark/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-text-primary flex items-center gap-2">
                      ✈️ {flight.flight_number || flight.flightNumber || 'AA-123'}
                    </div>
                    <div className="text-xs text-text-secondary">{flight.airline}</div>
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {flight.origin} → {flight.destination}
                  </td>
                  <td className="p-4">
                    {(flight.stops ?? 0) === 0 ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded font-medium">
                        Direct
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded font-medium">
                        {flight.stops} Stop(s)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {new Date(flight.departure_time || flight.departureTime).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    ${flight.price}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {flight.status === 'active' ? (
                        <span className="inline-block bg-emerald-success/10 text-emerald-success text-xs px-2 py-1 rounded w-fit">✅ Active</span>
                      ) : (
                        <span className="inline-block bg-amber-warning/10 text-amber-warning text-xs px-2 py-1 rounded w-fit">⚠️ {flight.status}</span>
                      )}
                      <span className="text-xs text-text-secondary">{flight.available_seats ?? flight.availableSeats ?? 0}/{flight.total_seats ?? flight.totalSeats ?? 0} Seats</span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link href={`/admin/flights/${flight.id}/edit`} className="inline-flex items-center justify-center p-2 rounded bg-slate-dark border border-border-slate text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(flight.id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center justify-center p-2 rounded bg-slate-dark border border-border-slate text-red-error hover:bg-red-error/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-border-slate flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-text-secondary">
          <span>Page 1 of 1</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-border-slate disabled:opacity-50">&lt; Previous</button>
            <button className="px-3 py-1 rounded bg-oxblood text-text-primary border border-oxblood">1</button>
            <button className="px-3 py-1 rounded border border-border-slate disabled:opacity-50">Next &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
