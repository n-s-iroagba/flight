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
exports.FlightController = void 0;
const zod_1 = require("zod");
const FlightService_1 = __importDefault(require("../services/FlightService"));
const response_1 = require("../utils/response");
const models_1 = require("../models");
class FlightController {
    getFeatured(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const flights = yield FlightService_1.default.getFeaturedFlights(limit);
                return (0, response_1.sendSuccess)(res, flights);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = zod_1.z.object({
                    origin: zod_1.z.string().length(3),
                    destination: zod_1.z.string().length(3),
                    departureDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                    passengers: zod_1.z.object({
                        adults: zod_1.z.number().min(1),
                        children: zod_1.z.number().min(0).optional(),
                        infants: zod_1.z.number().min(0).optional(),
                    }).optional(),
                    tripType: zod_1.z.enum(['one-way', 'round-trip']).optional(),
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const startTime = Date.now();
                const flights = yield FlightService_1.default.searchFlights(parsed.data.origin, parsed.data.destination, parsed.data.departureDate);
                const executionTime = Date.now() - startTime;
                const metadata = {
                    sources: {
                        admin: { count: flights.filter(f => f.source === 'admin').length },
                        letsfg: { count: flights.filter(f => f.source === 'letsfg').length }
                    },
                    searchId: Math.random().toString(36).substring(7),
                    executionTime
                };
                return (0, response_1.sendSuccess)(res, { flights, total: flights.length, page: 1, limit: flights.length }, undefined, metadata);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    getDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const flight = yield FlightService_1.default.getFlightDetails(id);
                if (!flight) {
                    return (0, response_1.sendError)(res, 'Flight not found', 'NOT_FOUND', null, 404);
                }
                return (0, response_1.sendSuccess)(res, flight);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    // Admin Routes
    listAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const offset = (page - 1) * limit;
                const { rows, count } = yield models_1.Flight.findAndCountAll({
                    limit,
                    offset,
                    order: [['created_at', 'DESC']]
                });
                return (0, response_1.sendSuccess)(res, {
                    flights: rows,
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                });
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = zod_1.z.object({
                    origin: zod_1.z.string().length(3),
                    destination: zod_1.z.string().length(3),
                    departureTime: zod_1.z.string(),
                    arrivalTime: zod_1.z.string(),
                    airline: zod_1.z.string(),
                    airlineCode: zod_1.z.string(),
                    flightNumber: zod_1.z.string(),
                    price: zod_1.z.number().positive(),
                    currency: zod_1.z.string().default('USD'),
                    totalSeats: zod_1.z.number().positive(),
                    aircraft: zod_1.z.string().optional(),
                    baggage: zod_1.z.string().optional(),
                    cancellationPolicy: zod_1.z.string().optional(),
                    cabinClass: zod_1.z.enum(['economy', 'premium_economy', 'business', 'first']),
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const flight = yield models_1.Flight.create(Object.assign(Object.assign({}, parsed.data), { departure_time: new Date(parsed.data.departureTime), arrival_time: new Date(parsed.data.arrivalTime), total_seats: parsed.data.totalSeats, available_seats: parsed.data.totalSeats, airline_code: parsed.data.airlineCode, flight_number: parsed.data.flightNumber, cabin_class: parsed.data.cabinClass }));
                return (0, response_1.sendSuccess)(res, flight, 'Flight created successfully', undefined, 201);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const flight = yield models_1.Flight.findByPk(id);
                if (!flight)
                    return (0, response_1.sendError)(res, 'Flight not found', 'NOT_FOUND', null, 404);
                yield flight.update(req.body);
                return (0, response_1.sendSuccess)(res, flight, 'Flight updated successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const flight = yield models_1.Flight.findByPk(id);
                if (!flight)
                    return (0, response_1.sendError)(res, 'Flight not found', 'NOT_FOUND', null, 404);
                yield flight.destroy();
                return (0, response_1.sendSuccess)(res, null, 'Flight deleted successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    // Private Jet Controllers
    listPrivateJets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield FlightService_1.default.listPrivateJets(page, limit);
                return (0, response_1.sendSuccess)(res, result);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    createPrivateJet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const flight = yield FlightService_1.default.createPrivateJet(req.body);
                return (0, response_1.sendSuccess)(res, flight, 'Private Jet flight created successfully', undefined, 201);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    updatePrivateJet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const flight = yield FlightService_1.default.updatePrivateJet(id, req.body);
                return (0, response_1.sendSuccess)(res, flight, 'Private Jet flight updated successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    deletePrivateJet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield FlightService_1.default.deletePrivateJet(id);
                return (0, response_1.sendSuccess)(res, null, 'Private Jet flight deleted successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    seedPrivateJets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jets = yield FlightService_1.default.seedPrivateJets();
                return (0, response_1.sendSuccess)(res, jets, 'Private Jet flights seeded successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    // Flight Tracking & Location Updates
    trackFlightByTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketNumber } = req.params;
                if (!ticketNumber) {
                    return (0, response_1.sendError)(res, 'Ticket number is required', 'BAD_REQUEST', null, 400);
                }
                const trackingData = yield FlightService_1.default.trackFlightByTicket(ticketNumber);
                if (!trackingData) {
                    return (0, response_1.sendError)(res, 'No flight found for the provided ticket number', 'NOT_FOUND', null, 404);
                }
                return (0, response_1.sendSuccess)(res, trackingData);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    updateLocation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { latitude, longitude, currentLocation } = req.body;
                if (latitude === undefined || longitude === undefined) {
                    return (0, response_1.sendError)(res, 'Both latitude and longitude are required', 'BAD_REQUEST', null, 400);
                }
                const flight = yield FlightService_1.default.updateFlightLocation(id, Number(latitude), Number(longitude), currentLocation);
                return (0, response_1.sendSuccess)(res, flight, 'Flight location updated successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
}
exports.FlightController = FlightController;
exports.default = new FlightController();
