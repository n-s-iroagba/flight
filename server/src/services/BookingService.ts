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
}

export default new BookingService();
