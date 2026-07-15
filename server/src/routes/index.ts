import { Router } from 'express';
import flightController from '../controllers/FlightController';
import bookingController from '../controllers/BookingController';
import paymentController from '../controllers/PaymentController';
import authController from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public Routes
router.get('/public/stats', (req, res) => {
  // Mocked for now, can be implemented properly later
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
router.get('/public/flights/featured', flightController.getFeatured);

// Flight Search Routes
router.post('/flights/search', flightController.search);
router.get('/flights/:id/details', flightController.getDetails);

// Booking Routes
router.post('/bookings/initiate', bookingController.initiate);

// Admin Auth
router.post('/admin/auth/login', authController.login);

// Admin Protected Routes
router.use('/admin', authMiddleware);

router.get('/admin/flights', flightController.listAll);
router.post('/admin/flights', flightController.create);
router.patch('/admin/flights/:id', flightController.update);
router.delete('/admin/flights/:id', flightController.remove);

router.get('/admin/payments', paymentController.list);
router.patch('/admin/payments/:id/mark-paid', paymentController.markPaid);
router.post('/admin/payments/:id/send-ticket/whatsapp', paymentController.sendTicketWhatsapp);
router.post('/admin/payments/:id/send-ticket/email', paymentController.sendTicketEmail);
router.patch('/admin/payments/:id/confirm-delivery', paymentController.confirmDelivery);

export default router;
