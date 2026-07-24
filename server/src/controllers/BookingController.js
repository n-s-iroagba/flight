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
exports.BookingController = void 0;
const zod_1 = require("zod");
const BookingService_1 = __importDefault(require("../services/BookingService"));
const response_1 = require("../utils/response");
class BookingController {
    initiate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = zod_1.z.object({
                    flightId: zod_1.z.string(),
                    passengerName: zod_1.z.string().min(2),
                    email: zod_1.z.string().email(),
                    phone: zod_1.z.string().min(8),
                    specialRequests: zod_1.z.string().optional(),
                    source: zod_1.z.enum(['admin', 'letsfg']),
                    offerId: zod_1.z.string().optional(),
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const result = yield BookingService_1.default.createBooking(parsed.data);
                return (0, response_1.sendSuccess)(res, result, 'Booking initiated successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    initiatePrivateJet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = zod_1.z.object({
                    tripType: zod_1.z.enum(['single', 'round-trip', 'multileg']),
                    legs: zod_1.z.array(zod_1.z.object({
                        origin: zod_1.z.string(),
                        destination: zod_1.z.string(),
                        departureDate: zod_1.z.string(),
                        returnDate: zod_1.z.string().optional()
                    })).min(1),
                    passengerName: zod_1.z.string().min(2),
                    email: zod_1.z.string().email(),
                    phone: zod_1.z.string().min(8),
                    passengersCount: zod_1.z.number().min(1).default(1),
                    specialRequests: zod_1.z.string().optional(),
                    flightId: zod_1.z.string().optional()
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const result = yield BookingService_1.default.createPrivateJetBooking(parsed.data);
                return (0, response_1.sendSuccess)(res, result, 'Private jet booking request initiated successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
}
exports.BookingController = BookingController;
exports.default = new BookingController();
