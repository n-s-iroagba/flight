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
exports.PaymentService = void 0;
const models_1 = require("../models");
class PaymentService {
    getPayments(statusFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (statusFilters && statusFilters.length > 0) {
                // bookings dictate the overall status, but payments hold the actual payment info
                where.status = statusFilters;
            }
            const bookings = yield models_1.Booking.findAll({
                where,
                order: [['created_at', 'DESC']],
                include: [
                    { model: models_1.Payment, as: 'payments' },
                    { model: models_1.Ticket, as: 'tickets' },
                ],
            });
            return bookings;
        });
    }
    markPaid(bookingId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield models_1.Booking.findByPk(bookingId);
            if (!booking)
                throw new Error('Booking not found');
            const payment = yield models_1.Payment.create({
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
            yield booking.update({
                status: 'paid',
                paid_at: new Date(),
                confirmed_by: data.confirmedBy,
            });
            // Generate Ticket placeholder
            const ticketNumber = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
            const ticket = yield models_1.Ticket.create({
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
        });
    }
    confirmTicketDelivery(bookingId, deliveryData) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield models_1.Ticket.findOne({ where: { booking_id: bookingId } });
            if (!ticket)
                throw new Error('Ticket not found for booking');
            yield ticket.update({
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
        });
    }
    sendTicketWhatsapp(bookingId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield models_1.Ticket.findOne({ where: { booking_id: bookingId } });
            if (!ticket)
                throw new Error('Ticket not found for booking');
            yield ticket.update({
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
        });
    }
    sendTicketEmail(bookingId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield models_1.Ticket.findOne({ where: { booking_id: bookingId } });
            if (!ticket)
                throw new Error('Ticket not found for booking');
            yield ticket.update({
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
        });
    }
}
exports.PaymentService = PaymentService;
exports.default = new PaymentService();
