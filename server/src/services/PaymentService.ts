import { Booking, Payment, Ticket } from '../models';

export class PaymentService {
  async getPayments(statusFilters?: string[]) {
    const where: any = {};
    if (statusFilters && statusFilters.length > 0) {
      // bookings dictate the overall status, but payments hold the actual payment info
      where.status = statusFilters;
    }

    const bookings = await Booking.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: Payment, as: 'payments' },
        { model: Ticket, as: 'tickets' },
      ],
    });

    return bookings;
  }

  async markPaid(bookingId: string, data: {
    method: 'cash' | 'bank_transfer' | 'mobile_money' | 'whatsapp';
    reference?: string;
    notes?: string;
    amount: number;
    currency: string;
    confirmedBy: string;
  }) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw new Error('Booking not found');

    const payment = await Payment.create({
      booking_id: booking.id,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      status: 'completed',
      confirmed_by: data.confirmedBy,
      confirmed_at: new Date(),
    });

    await booking.update({
      status: 'paid',
      paid_at: new Date(),
      confirmed_by: data.confirmedBy,
    });

    // Generate Ticket placeholder
    const ticketNumber = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();

    const ticket = await Ticket.create({
      booking_id: booking.id,
      ticket_number: ticketNumber,
      pnr,
      delivery_status: 'pending'
    });

    return {
      id: payment.id,
      bookingReference: booking.booking_reference,
      status: 'paid',
      paidAt: booking.paid_at,
      confirmedBy: booking.confirmed_by,
      amount: payment.amount,
      currency: payment.currency,
      ticketDelivery: {
        status: ticket.delivery_status,
        ticketNumber: ticket.ticket_number,
        pnr: ticket.pnr,
      }
    };
  }

  async confirmTicketDelivery(bookingId: string, deliveryData: {
    confirmationCode: string;
    deliveredTo: string;
    confirmedBy: string;
  }) {
    const ticket = await Ticket.findOne({ where: { booking_id: bookingId } });
    if (!ticket) throw new Error('Ticket not found for booking');

    await ticket.update({
      delivery_status: 'confirmed',
      confirmed_at: new Date(),
    });

    return {
      status: 'confirmed',
      confirmedAt: ticket.confirmed_at,
      confirmedBy: deliveryData.confirmedBy,
      ticketNumber: ticket.ticket_number,
      pnr: ticket.pnr,
    };
  }

  async sendTicketWhatsapp(bookingId: string, data: { message: string, includeETicket: boolean }) {
    const ticket = await Ticket.findOne({ where: { booking_id: bookingId } });
    if (!ticket) throw new Error('Ticket not found for booking');

    await ticket.update({
      delivery_status: 'sent',
      sent_via: 'whatsapp',
      sent_at: new Date(),
    });

    return {
      sentAt: ticket.sent_at,
      whatsappMessageId: `msg_${Math.random().toString(36).substring(2, 9)}`,
      status: 'sent',
      deliveryMethod: 'whatsapp',
      ticketUrl: ticket.e_ticket_url || 'https://example.com/ticket.pdf'
    };
  }

  async sendTicketEmail(bookingId: string, data: { subject: string, message: string, includeETicket: boolean }) {
    const ticket = await Ticket.findOne({ where: { booking_id: bookingId } });
    if (!ticket) throw new Error('Ticket not found for booking');

    await ticket.update({
      delivery_status: 'sent',
      sent_via: 'email',
      sent_at: new Date(),
    });

    return {
      sentAt: ticket.sent_at,
      emailId: `eml_${Math.random().toString(36).substring(2, 9)}`,
      status: 'sent',
      deliveryMethod: 'email',
    };
  }
}

export default new PaymentService();
