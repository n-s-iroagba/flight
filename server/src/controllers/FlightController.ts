import { Request, Response } from 'express';
import { z } from 'zod';
import flightService from '../services/FlightService';
import { sendSuccess, sendError } from '../utils/response';
import { Flight } from '../models';

export class FlightController {
  async getFeatured(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const flights = await flightService.getFeaturedFlights(limit);
      return sendSuccess(res, flights);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async search(req: Request, res: Response) {
    try {
      const schema = z.object({
        origin: z.string().length(3),
        destination: z.string().length(3),
        departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        passengers: z.object({
          adults: z.number().min(1),
          children: z.number().min(0).optional(),
          infants: z.number().min(0).optional(),
        }).optional(),
        tripType: z.enum(['one-way', 'round-trip']).optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const startTime = Date.now();
      const flights = await flightService.searchFlights(
        parsed.data.origin,
        parsed.data.destination,
        parsed.data.departureDate
      );

      const executionTime = Date.now() - startTime;

      const metadata = {
        sources: {
          admin: { count: flights.filter(f => f.source === 'admin').length },
          letsfg: { count: flights.filter(f => f.source === 'letsfg').length }
        },
        searchId: Math.random().toString(36).substring(7),
        executionTime
      };

      return sendSuccess(res, { flights, total: flights.length, page: 1, limit: flights.length }, undefined, metadata);
    } catch (error: any) {

      return sendError(res, error.message);
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const flight = await flightService.getFlightDetails(id);
      if (!flight) {
        return sendError(res, 'Flight not found', 'NOT_FOUND', null, 404);
      }
      return sendSuccess(res, flight);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // Admin Routes
  async listAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const { rows, count } = await Flight.findAndCountAll({
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return sendSuccess(res, {
        flights: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      });
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const schema = z.object({
        origin: z.string().length(3),
        destination: z.string().length(3),
        departureTime: z.string(),
        arrivalTime: z.string(),
        airline: z.string(),
        airlineCode: z.string(),
        flightNumber: z.string(),
        price: z.number().positive(),
        currency: z.string().default('USD'),
        totalSeats: z.number().positive(),
        aircraft: z.string().optional(),
        baggage: z.string().optional(),
        cancellationPolicy: z.string().optional(),
        cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const flight = await Flight.create({
        ...parsed.data,
        departure_time: new Date(parsed.data.departureTime),
        arrival_time: new Date(parsed.data.arrivalTime),
        total_seats: parsed.data.totalSeats,
        available_seats: parsed.data.totalSeats,
        airline_code: parsed.data.airlineCode,
        flight_number: parsed.data.flightNumber,
        cabin_class: parsed.data.cabinClass
      });

      return sendSuccess(res, flight, 'Flight created successfully', undefined, 201);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const flight = await Flight.findByPk(id);
      if (!flight) return sendError(res, 'Flight not found', 'NOT_FOUND', null, 404);

      await flight.update(req.body);
      return sendSuccess(res, flight, 'Flight updated successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const flight = await Flight.findByPk(id);
      if (!flight) return sendError(res, 'Flight not found', 'NOT_FOUND', null, 404);

      await flight.destroy();
      return sendSuccess(res, null, 'Flight deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // Private Jet Controllers
  async listPrivateJets(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await flightService.listPrivateJets(page, limit);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async createPrivateJet(req: Request, res: Response) {
    try {
      const flight = await flightService.createPrivateJet(req.body);
      return sendSuccess(res, flight, 'Private Jet flight created successfully', undefined, 201);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async updatePrivateJet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const flight = await flightService.updatePrivateJet(id, req.body);
      return sendSuccess(res, flight, 'Private Jet flight updated successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletePrivateJet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await flightService.deletePrivateJet(id);
      return sendSuccess(res, null, 'Private Jet flight deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async seedPrivateJets(req: Request, res: Response) {
    try {
      const jets = await flightService.seedPrivateJets();
      return sendSuccess(res, jets, 'Private Jet flights seeded successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // Flight Tracking & Location Updates
  async trackFlightByTicket(req: Request, res: Response) {
    try {
      const { ticketNumber } = req.params;
      if (!ticketNumber) {
        return sendError(res, 'Ticket number is required', 'BAD_REQUEST', null, 400);
      }
      const trackingData = await flightService.trackFlightByTicket(ticketNumber);
      if (!trackingData) {
        return sendError(res, 'No flight found for the provided ticket number', 'NOT_FOUND', null, 404);
      }
      return sendSuccess(res, trackingData);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { latitude, longitude, currentLocation } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return sendError(res, 'Both latitude and longitude are required', 'BAD_REQUEST', null, 400);
      }

      const flight = await flightService.updateFlightLocation(id, Number(latitude), Number(longitude), currentLocation);
      return sendSuccess(res, flight, 'Flight location updated successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export default new FlightController();
