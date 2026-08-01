import { Request, Response } from 'express';
import { z } from 'zod';
import bookingService from '../services/BookingService';
import { sendSuccess, sendError } from '../utils/response';

export class BookingController {
  async initiate(req: Request, res: Response) {
    try {
      const schema = z.object({
        flightId: z.string(),
        passengerName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
        specialRequests: z.string().optional(),
        source: z.enum(['admin', 'letsfg']),
        offerId: z.string().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const result = await bookingService.createBooking(parsed.data);

      return sendSuccess(res, result, 'Booking initiated successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async initiatePrivateJet(req: Request, res: Response) {
    try {
      const schema = z.object({
        tripType: z.enum(['single', 'round-trip', 'multileg']),
        legs: z.array(z.object({
          origin: z.string(),
          destination: z.string(),
          departureDate: z.string(),
          returnDate: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional())
        })).min(1),
        passengerName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
        passengersCount: z.number().min(1).default(1),
        specialRequests: z.string().optional(),
        flightId: z.string().optional()
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const result = await bookingService.createPrivateJetBooking(parsed.data);
      return sendSuccess(res, result, 'Private jet booking request initiated successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export default new BookingController();
