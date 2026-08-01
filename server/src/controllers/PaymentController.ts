import { Request, Response } from 'express';
import { z } from 'zod';
import paymentService from '../services/PaymentService';
import { sendSuccess, sendError } from '../utils/response';

export class PaymentController {
  /**
   * GET /admin/payments
   * Returns all bookings as the payment queue, with Flight included.
   * Supports ?status=pending,processing filter.
   */
  async list(req: Request, res: Response) {
    try {
      const statusParam = req.query.status as string;
      const statuses = statusParam ? statusParam.split(',') : undefined;

      const payments = await paymentService.getPayments(statuses);

      const summary = {
        pending: payments.filter(p => p.status === 'pending').length,
        processing: payments.filter(p => p.status === 'processing').length,
        paid: payments.filter(p => p.status === 'paid').length,
        failed: payments.filter(p => p.status === 'failed').length,
        cancelled: payments.filter(p => p.status === 'cancelled').length,
        totalRevenue: payments
          .filter(p => p.status === 'paid')
          .reduce((acc, curr) => acc + Number(curr.amount), 0),
        currency: 'USD'
      };

      return sendSuccess(res, { payments, total: payments.length, summary });
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  /**
   * GET /admin/payments/:id
   * Fetches a single booking with all associations.
   * Used by the admin/payments/[id] detail page.
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);
      if (!payment) {
        return sendError(res, 'Payment/Booking not found', 'NOT_FOUND', null, 404);
      }
      return sendSuccess(res, payment);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  /**
   * PATCH /admin/payments/:id/mark-paid
   * Confirms payment and generates ticket.
   * Also handles cancel if status field is 'cancelled'.
   */
  async markPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if this is a cancel request (sent by frontend Cancel Booking button)
      if (req.body?.status === 'cancelled') {
        // @ts-ignore
        const confirmedBy = req.user?.email || 'admin';
        const result = await paymentService.cancelBooking(id, confirmedBy);
        return sendSuccess(res, result, 'Booking cancelled successfully');
      }

      const schema = z.object({
        paymentConfirmation: z.object({
          method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'whatsapp']),
          reference: z.string().optional(),
          notes: z.string().optional(),
          amount: z.number().positive(),
          currency: z.string().default('USD')
        })
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      // @ts-ignore - using user from auth middleware
      const confirmedBy = req.user?.email || 'admin';

      const result = await paymentService.markPaid(id, {
        ...parsed.data.paymentConfirmation,
        confirmedBy
      });

      return sendSuccess(res, result, 'Payment confirmed successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  /**
   * PATCH /admin/payments/:id/confirm-delivery
   * Marks ticket as delivered to passenger.
   */
  async confirmDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const schema = z.object({
        confirmationCode: z.string(),
        deliveredTo: z.string()
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      // @ts-ignore
      const confirmedBy = req.user?.email || 'admin';

      const result = await paymentService.confirmTicketDelivery(id, {
        ...parsed.data,
        confirmedBy
      });

      return sendSuccess(res, result, 'Ticket delivery confirmed');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  /**
   * POST /admin/payments/:id/send-ticket/whatsapp
   * Sends ticket via WhatsApp and marks delivery status.
   */
  async sendTicketWhatsapp(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        message: z.string(),
        includeETicket: z.boolean()
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const result = await paymentService.sendTicketWhatsapp(id, parsed.data);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  /**
   * POST /admin/payments/:id/send-ticket/email
   * Sends ticket via email and marks delivery status.
   */
  async sendTicketEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        subject: z.string(),
        message: z.string(),
        includeETicket: z.boolean()
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const result = await paymentService.sendTicketEmail(id, parsed.data);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export default new PaymentController();
