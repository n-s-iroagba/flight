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
 *  - Auth: X-API-Key and Authorization: Bearer headers
 *  - Search: POST /flights/search or POST /sandbox/flights/search
 */
export class LetsFGService {
  private client = axios.create({
    baseURL: env.LETSFG_BASE_URL,
    timeout: parseInt(env.LETSFG_TIMEOUT, 10),
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': env.LETSFG_API_KEY || '',
      'Authorization': `Bearer ${env.LETSFG_API_KEY || ''}`,
    },
  });

  async searchFlights(origin: string, destination: string, departureDate: string): Promise<LetsFGFlight[]> {
    if (!env.LETSFG_API_KEY) {
      logger.warn('LetsFG API key not configured, returning empty array');
      return [];
    }

    const payload = {
      origin,
      destination,
      date_from: departureDate,
      adults: 1,
      currency: 'USD',
      limit: 50,
      sort: 'price',
    };

    const primaryPath = env.LETSFG_USE_SANDBOX !== 'false' ? '/sandbox/flights/search' : '/flights/search';

    try {
      const response = await this.client.post(primaryPath, payload);
      const offers = response.data?.offers || [];
      return offers.map((offer: any) => this.mapOffer(offer));
    } catch (error: any) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || error.message;

      logger.warn(`LetsFG search on ${primaryPath} failed (${status}): ${detail}`);

      // If production endpoint returned 402 (Payment Required - unfunded prepaid balance) or auth error, fallback to sandbox
      if (primaryPath === '/flights/search' && (status === 402 || status === 401 || status === 403)) {
        logger.info('Falling back to LetsFG sandbox endpoint (/sandbox/flights/search)...');
        try {
          const sandboxResponse = await this.client.post('/sandbox/flights/search', payload);
          const offers = sandboxResponse.data?.offers || [];
          return offers.map((offer: any) => this.mapOffer(offer));
        } catch (sandboxError: any) {
          logger.error(`LetsFG sandbox fallback also failed: ${sandboxError.message}`);
        }
      }

      return [];
    }
  }

  /**
   * Maps a raw LetsFG offer to our internal LetsFGFlight shape.
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
