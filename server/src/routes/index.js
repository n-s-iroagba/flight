"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FlightController_1 = __importDefault(require("../controllers/FlightController"));
const BookingController_1 = __importDefault(require("../controllers/BookingController"));
const PaymentController_1 = __importDefault(require("../controllers/PaymentController"));
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public Routes
router.get('/public/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalFlights: 2500,
            airlines: 45,
            destinations: 120,
            averageRating: 4.8,
            lastUpdated: new Date().toISOString()
        }
    });
});
router.get('/public/flights/featured', FlightController_1.default.getFeatured);
router.get('/public/private-jets', FlightController_1.default.listPrivateJets);
// Flight Search & Tracking Routes
router.post('/flights/search', FlightController_1.default.search);
router.get('/flights/track/:ticketNumber', FlightController_1.default.trackFlightByTicket);
router.get('/flights/:id/details', FlightController_1.default.getDetails);
// Booking Routes
router.post('/bookings/initiate', BookingController_1.default.initiate);
router.post('/bookings/initiate-private-jet', BookingController_1.default.initiatePrivateJet);
// Admin Auth
router.post('/admin/auth/login', AuthController_1.default.login);
// Admin Protected Routes
router.use('/admin', auth_1.authMiddleware);
router.get('/admin/flights', FlightController_1.default.listAll);
router.post('/admin/flights', FlightController_1.default.create);
router.patch('/admin/flights/:id', FlightController_1.default.update);
router.delete('/admin/flights/:id', FlightController_1.default.remove);
// Admin Private Jet CRUD & Seed
router.get('/admin/private-jets', FlightController_1.default.listPrivateJets);
router.post('/admin/private-jets', FlightController_1.default.createPrivateJet);
router.patch('/admin/private-jets/:id', FlightController_1.default.updatePrivateJet);
router.delete('/admin/private-jets/:id', FlightController_1.default.deletePrivateJet);
router.post('/admin/private-jets/seed', FlightController_1.default.seedPrivateJets);
// Admin Flight Location Update
router.patch('/admin/flights/:id/location', FlightController_1.default.updateLocation);
router.get('/admin/payments', PaymentController_1.default.list);
router.patch('/admin/payments/:id/mark-paid', PaymentController_1.default.markPaid);
router.post('/admin/payments/:id/send-ticket/whatsapp', PaymentController_1.default.sendTicketWhatsapp);
router.post('/admin/payments/:id/send-ticket/email', PaymentController_1.default.sendTicketEmail);
router.patch('/admin/payments/:id/confirm-delivery', PaymentController_1.default.confirmDelivery);
exports.default = router;
