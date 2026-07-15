import axios from 'axios';
import { env } from '../config/env';
import logger from '../config/logger';

export interface LetsFGFlight {
  id: string;
  offerId: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  segments: Array<{
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    airline: string;
    flightNumber: string;
    duration: string;
  }>;
}

/**
 * LetsFG Developer API Integration
 *
 * Per OpenAPI spec (https://letsfg.co/developers/api/openapi.json):
 *  - Auth: X-API-Key header (NOT Bearer token)
 *  - Search: POST /flights/search (NOT GET)
 *  - Body params: origin, destination, date_from (NOT query params)
 *  - Sandbox: insert "sandbox/" between v1/ and endpoint path for free testing
 *  - Response: { offers: [...], total_results: N }
 */
export class LetsFGService {
  private client = axios.create({
    baseURL: env.LETSFG_BASE_URL,
    timeout: parseInt(env.LETSFG_TIMEOUT, 10),
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': env.LETSFG_API_KEY || '',
    },
  });

  async searchFlights(origin: string, destination: string, departureDate: string): Promise<LetsFGFlight[]> {
    try {
      if (!env.LETSFG_API_KEY) {
        logger.warn('LetsFG API key not configured, returning empty array');
        return [];
      }

      // Use sandbox path in development to avoid billing
      const searchPath = env.NODE_ENV === 'production'
        ? '/flights/search'
        : '/sandbox/flights/search';

      const response = await this.client.post(searchPath, {
        origin,
        destination,
        date_from: departureDate,
        adults: 1,
        currency: 'USD',
        limit: 50,
        sort: 'price',
      });

      const offers = response.data?.offers || [];

      // Map LetsFG offer shape → our internal LetsFGFlight interface
      return offers.map((offer: any) => this.mapOffer(offer));
    } catch (error: any) {
      logger.error(`LetsFG search failed (${error.response?.status || 'network'}): ${error.message}`);
      // Fallback: return empty array so local admin flights still display
      return [];
    }
  }

  /**
   * Maps a raw LetsFG offer to our internal LetsFGFlight shape.
   *
   * Actual LetsFG offer shape (from sandbox):
   *   offer.id, offer.price, offer.currency, offer.airlines[]
   *   offer.outbound.segments[].origin, .destination, .departure, .arrival,
   *     .airline, .airline_name, .flight_no, .duration_seconds, .cabin_class
   *   offer.outbound.stopovers, offer.outbound.total_duration_seconds
   *   offer.booking_url, offer.availability_seats, offer.conditions
   */
  private mapOffer(offer: any): LetsFGFlight {
    const outbound = offer.outbound || {};
    const segments = outbound.segments || [];
    const firstSeg = segments[0] || {};
    const lastSeg = segments[segments.length - 1] || firstSeg;

    return {
      id: offer.id || `lfg_${Math.random().toString(36).substring(2, 10)}`,
      offerId: offer.id || '',
      origin: firstSeg.origin || '',
      destination: lastSeg.destination || '',
      departureTime: firstSeg.departure || '',
      arrivalTime: lastSeg.arrival || '',
      airline: firstSeg.airline_name || firstSeg.airline || offer.airlines?.[0] || 'Unknown',
      airlineCode: firstSeg.airline || offer.owner_airline || offer.airlines?.[0] || '',
      flightNumber: firstSeg.flight_no || '',
      price: offer.price || 0,
      currency: offer.currency || 'USD',
      duration: this.formatDuration(outbound.total_duration_seconds),
      stops: outbound.stopovers ?? Math.max(0, segments.length - 1),
      segments: segments.map((seg: any) => ({
        origin: seg.origin || '',
        destination: seg.destination || '',
        departureTime: seg.departure || '',
        arrivalTime: seg.arrival || '',
        airline: seg.airline_name || seg.airline || '',
        flightNumber: seg.flight_no || '',
        duration: this.formatDuration(seg.duration_seconds),
      })),
    };
  }

  private formatDuration(seconds?: number): string {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

export default new LetsFGService();
