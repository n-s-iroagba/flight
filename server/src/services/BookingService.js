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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const models_1 = require("../models");
const whatsapp_1 = require("../utils/whatsapp");
const env_1 = require("../config/env");
class BookingService {
    createBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Determine price based on source (mock external flight details if letsfg)
            let flight;
            if (data.source === 'admin') {
                flight = yield models_1.Flight.findByPk(data.flightId);
                if (!flight)
                    throw new Error('Flight not found');
            }
            const price = flight ? flight.price : 0; // For letsfg, we would fetch price from LetsFGService using offerId
            const currency = flight ? flight.currency : 'USD';
            const airline = flight ? flight.airline : 'External Airline';
            const flightNumber = flight ? flight.flight_number : 'EXT-123';
            const origin = flight ? flight.origin : 'ORG';
            const destination = flight ? flight.destination : 'DST';
            const departureTime = flight ? flight.departure_time.toISOString() : new Date().toISOString();
            const bookingReference = (0, whatsapp_1.generateBookingReference)();
            const booking = yield models_1.Booking.create({
                booking_reference: bookingReference,
                flight_id: data.flightId || 'external-id', // Use UUID for real implementation
                passenger_name: data.passengerName,
                passenger_email: data.email,
                passenger_phone: data.phone,
                special_requests: data.specialRequests,
                source: data.source,
                offer_id: data.offerId,
                amount: price,
                currency: currency,
                status: 'pending',
            });
            const whatsappNumber = env_1.env.WHATSAPP_BUSINESS_NUMBER || '+1234567890';
            // Formatting the message as per SRS
            const whatsappMessage = `I want to book a flight:
✈️ ${airline} - ${flightNumber}
📍 ${origin} → ${destination}
📅 ${departureTime}
👤 Passenger: ${data.passengerName}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
💰 Total: ${price} ${currency}
📋 Reference: ${bookingReference}

Please confirm availability and payment details.`;
            const whatsappUrl = (0, whatsapp_1.formatWhatsAppMessage)(whatsappNumber, whatsappMessage);
            // Save conversation log implicitly by keeping track of the message
            yield booking.update({ whatsapp_conversation: whatsappMessage });
            return {
                bookingReference: booking.booking_reference,
                whatsappNumber,
                whatsappMessage,
                whatsappUrl,
                flightDetails: {
                    origin,
                    destination,
                    departureTime,
                    airline,
                    price,
                    currency
                },
                expiresAt: booking.expires_at,
            };
        });
    }
    createPrivateJetBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let flight;
            if (data.flightId) {
                flight = yield models_1.Flight.findByPk(data.flightId);
            }
            if (!flight) {
                flight = yield models_1.Flight.findOne({ where: { is_private_jet: true } });
            }
            const bookingReference = (0, whatsapp_1.generateBookingReference)();
            const whatsappNumber = env_1.env.WHATSAPP_BUSINESS_NUMBER || '+1234567890';
            let legSummaryText = '';
            if (data.tripType === 'single') {
                const firstLeg = data.legs[0] || { origin: 'LHR', destination: 'JFK', departureDate: '2026-08-01' };
                legSummaryText = `📍 Route: ${firstLeg.origin} → ${firstLeg.destination}\n📅 Date: ${firstLeg.departureDate}`;
            }
            else if (data.tripType === 'round-trip') {
                const firstLeg = data.legs[0] || { origin: 'LHR', destination: 'JFK', departureDate: '2026-08-01', returnDate: '2026-08-10' };
                legSummaryText = `📍 Route: ${firstLeg.origin} ⇄ ${firstLeg.destination}\n📅 Departure: ${firstLeg.departureDate}\n📅 Return: ${firstLeg.returnDate || 'Open'}`;
            }
            else {
                legSummaryText = `🗺️ Multi-Leg Itinerary:\n` + data.legs.map((l, idx) => `  Leg ${idx + 1}: ${l.origin} → ${l.destination} (${l.departureDate})`).join('\n');
            }
            const jetInfo = flight ? `✈️ Aircraft: ${flight.aircraft || flight.airline} (${flight.flight_number})` : `✈️ Aircraft Type: Private Jet Charter`;
            const whatsappMessage = `🛩️ PRIVATE JET BOOKING REQUEST:
${jetInfo}
Trip Type: ${data.tripType.toUpperCase()}
${legSummaryText}
👥 Passengers: ${data.passengersCount || 1}
👤 Name: ${data.passengerName}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
${data.specialRequests ? `📝 Special Requests: ${data.specialRequests}\n` : ''}📋 Reference: ${bookingReference}

Please provide charter pricing, aircraft availability, and payment details.`;
            const whatsappUrl = (0, whatsapp_1.formatWhatsAppMessage)(whatsappNumber, whatsappMessage);
            let createdBooking;
            if (flight) {
                createdBooking = yield models_1.Booking.create({
                    booking_reference: bookingReference,
                    flight_id: flight.id,
                    passenger_name: data.passengerName,
                    passenger_email: data.email,
                    passenger_phone: data.phone,
                    special_requests: `[Private Jet - ${data.tripType}] ${data.specialRequests || ''}`,
                    source: 'admin',
                    amount: flight.price || 15000,
                    currency: flight.currency || 'USD',
                    status: 'pending',
                    whatsapp_conversation: whatsappMessage
                });
            }
            return {
                bookingReference: (createdBooking === null || createdBooking === void 0 ? void 0 : createdBooking.booking_reference) || bookingReference,
                whatsappNumber,
                whatsappMessage,
                whatsappUrl,
                tripType: data.tripType,
                legs: data.legs,
                passengersCount: data.passengersCount,
                jetInfo
            };
        });
    }
}
exports.BookingService = BookingService;
exports.default = new BookingService();
