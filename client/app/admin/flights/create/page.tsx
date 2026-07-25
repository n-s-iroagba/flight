'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminFlight } from '../../../../lib/api';
import Link from 'next/link';

export default function CreateFlight() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    airline: '',
    airlineCode: '',
    flightNumber: '',
    price: 0,
    currency: 'USD',
    totalSeats: 50,
    cabinClass: 'economy',
    aircraft: '',
    baggage: '',
    cancellationPolicy: '',
    stops: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'totalSeats' || name === 'stops' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAdminFlight(formData);
      router.push('/admin/flights');
    } catch (err) {
      alert('Failed to create flight');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          ✈️ Add New Flight
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-main border border-border-slate rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border-slate">
          <h2 className="text-lg font-bold text-text-primary mb-4">Route Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Origin (3 Letter Code) *</label>
              <input type="text" name="origin" value={formData.origin} onChange={handleChange} maxLength={3} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary uppercase focus:border-oxblood" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Destination (3 Letter Code) *</label>
              <input type="text" name="destination" value={formData.destination} onChange={handleChange} maxLength={3} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary uppercase focus:border-oxblood" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-border-slate">
          <h2 className="text-lg font-bold text-text-primary mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Departure Time *</label>
              <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Arrival Time *</label>
              <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-border-slate">
          <h2 className="text-lg font-bold text-text-primary mb-4">Flight Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Airline *</label>
              <input type="text" name="airline" value={formData.airline} onChange={handleChange} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Airline Code (2 Letters) *</label>
              <input type="text" name="airlineCode" value={formData.airlineCode} onChange={handleChange} maxLength={2} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary uppercase focus:border-oxblood" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Flight Number *</label>
              <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-border-slate">
          <h2 className="text-lg font-bold text-text-primary mb-4">Pricing & Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Price *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Total Seats *</label>
              <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} min={1} required className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Stops (0 = Direct)</label>
              <input type="number" name="stops" value={formData.stops ?? 0} onChange={handleChange} min={0} className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:border-oxblood" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-main/50 flex justify-between items-center">
          <Link href="/admin/flights" className="px-6 py-3 rounded-lg border border-border-slate text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="bg-oxblood hover:bg-oxblood-bright text-text-primary px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating...' : '✈️ Create Flight'}
          </button>
        </div>
      </form>
    </div>
  );
}
