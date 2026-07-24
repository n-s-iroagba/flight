import { Booking, Flight } from '../models';
import { generateBookingReference, formatWhatsAppMessage } from '../utils/whatsapp';
import { env } from '../config/env';

export class BookingService {
  async createBooking(data: {
    flightId: string;
    passengerName: string;
    email: string;
    phone: string;
    specialRequests?: string;
    source: 'admin' | 'letsfg';
    offerId?: string;
  }) {
    // Determine price based on source (mock external flight details if letsfg)
    let flight;
    if (data.source === 'admin') {
      flight = await Flight.findByPk(data.flightId);
      if (!flight) throw new Error('Flight not found');
    }

    const price = flight ? flight.price : 0; // For letsfg, we would fetch price from LetsFGService using offerId
    const currency = flight ? flight.currency : 'USD';
    const airline = flight ? flight.airline : 'External Airline';
    const flightNumber = flight ? flight.flight_number : 'EXT-123';
    const origin = flight ? flight.origin : 'ORG';
    const destination = flight ? flight.destination : 'DST';
    const departureTime = flight ? flight.departure_time.toISOString() : new Date().toISOString();

    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
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

    const whatsappNumber = env.WHATSAPP_BUSINESS_NUMBER || '+1234567890';
    
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

    const whatsappUrl = formatWhatsAppMessage(whatsappNumber, whatsappMessage);

    // Save conversation log implicitly by keeping track of the message
    await booking.update({ whatsapp_conversation: whatsappMessage });

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
  }

  async createPrivateJetBooking(data: {
    tripType: 'single' | 'round-trip' | 'multileg';
    legs: Array<{ origin: string; destination: string; departureDate: string; returnDate?: string }>;
    passengerName: string;
    email: string;
    phone: string;
    passengersCount: number;
    specialRequests?: string;
    flightId?: string;
  }) {
    let flight;
    if (data.flightId) {
      flight = await Flight.findByPk(data.flightId);
    }

    if (!flight) {
      flight = await Flight.findOne({ where: { is_private_jet: true } });
    }

    const bookingReference = generateBookingReference();
    const whatsappNumber = env.WHATSAPP_BUSINESS_NUMBER || '+1234567890';

    let legSummaryText = '';
    if (data.tripType === 'single') {
      const firstLeg = data.legs[0] || { origin: 'LHR', destination: 'JFK', departureDate: '2026-08-01' };
      legSummaryText = `📍 Route: ${firstLeg.origin} → ${firstLeg.destination}\n📅 Date: ${firstLeg.departureDate}`;
    } else if (data.tripType === 'round-trip') {
      const firstLeg = data.legs[0] || { origin: 'LHR', destination: 'JFK', departureDate: '2026-08-01', returnDate: '2026-08-10' };
      legSummaryText = `📍 Route: ${firstLeg.origin} ⇄ ${firstLeg.destination}\n📅 Departure: ${firstLeg.departureDate}\n📅 Return: ${firstLeg.returnDate || 'Open'}`;
    } else {
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

    const whatsappUrl = formatWhatsAppMessage(whatsappNumber, whatsappMessage);

    let createdBooking;
    if (flight) {
      createdBooking = await Booking.create({
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
      bookingReference: createdBooking?.booking_reference || bookingReference,
      whatsappNumber,
      whatsappMessage,
      whatsappUrl,
      tripType: data.tripType,
      legs: data.legs,
      passengersCount: data.passengersCount,
      jetInfo
    };
  }
}

export default new BookingService();
