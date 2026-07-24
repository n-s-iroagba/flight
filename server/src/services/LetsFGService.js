"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LetsFGService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../config/logger"));
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
class LetsFGService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.env.LETSFG_BASE_URL,
            timeout: parseInt(env_1.env.LETSFG_TIMEOUT, 10),
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': env_1.env.LETSFG_API_KEY || '',
            },
        });
    }
    searchFlights(origin, destination, departureDate) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (!env_1.env.LETSFG_API_KEY) {
                    logger_1.default.warn('LetsFG API key not configured, returning empty array');
                    return [];
                }
                // Use sandbox path in development to avoid billing
                const searchPath = env_1.env.NODE_ENV === 'production'
                    ? '/flights/search'
                    : '/sandbox/flights/search';
                const response = yield this.client.post(searchPath, {
                    origin,
                    destination,
                    date_from: departureDate,
                    adults: 1,
                    currency: 'USD',
                    limit: 50,
                    sort: 'price',
                });
                const offers = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.offers) || [];
                // Map LetsFG offer shape → our internal LetsFGFlight interface
                return offers.map((offer) => this.mapOffer(offer));
            }
            catch (error) {
                logger_1.default.error(`LetsFG search failed (${((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 'network'}): ${error.message}`);
                // Fallback: return empty array so local admin flights still display
                return [];
            }
        });
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
    mapOffer(offer) {
        var _a, _b, _c;
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
            airline: firstSeg.airline_name || firstSeg.airline || ((_a = offer.airlines) === null || _a === void 0 ? void 0 : _a[0]) || 'Unknown',
            airlineCode: firstSeg.airline || offer.owner_airline || ((_b = offer.airlines) === null || _b === void 0 ? void 0 : _b[0]) || '',
            flightNumber: firstSeg.flight_no || '',
            price: offer.price || 0,
            currency: offer.currency || 'USD',
            duration: this.formatDuration(outbound.total_duration_seconds),
            stops: (_c = outbound.stopovers) !== null && _c !== void 0 ? _c : Math.max(0, segments.length - 1),
            segments: segments.map((seg) => ({
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
    formatDuration(seconds) {
        if (!seconds)
            return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}
exports.LetsFGService = LetsFGService;
exports.default = new LetsFGService();
