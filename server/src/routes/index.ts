import { Router } from 'express';
import flightController from '../controllers/FlightController';
import bookingController from '../controllers/BookingController';
import paymentController from '../controllers/PaymentController';
import authController from '../controllers/AuthController';
import mailController from '../controllers/MailController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

import { Flight } from '../models';

// Public Routes
router.get('/public/stats', async (req, res) => {
  try {
    const flightCount = await Flight.count({ where: { status: 'active' } });
    res.json({
      success: true,
      data: {
        totalFlights: flightCount,
        airlines: flightCount > 0 ? 45 : 0,
        destinations: flightCount > 0 ? 120 : 0,
        averageRating: 4.8,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch {
    res.json({
      success: true,
      data: {
        totalFlights: 0,
        airlines: 0,
        destinations: 0,
        averageRating: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  }
});
router.get('/public/flights/featured', flightController.getFeatured);
router.get('/public/private-jets', flightController.listPrivateJets);

// Flight Search & Tracking Routes
router.post('/flights/search', flightController.search);
router.get('/flights/track/:ticketNumber', flightController.trackFlightByTicket);
router.get('/flights/:id/details', flightController.getDetails);

// Booking Routes
router.post('/bookings/initiate', bookingController.initiate);
router.post('/bookings/initiate-private-jet', bookingController.initiatePrivateJet);

// Admin Auth
router.post('/admin/auth/login', authController.login);

// Admin Protected Routes
router.use('/admin', authMiddleware);

router.get('/admin/flights', flightController.listAll);
router.post('/admin/flights', flightController.create);
router.patch('/admin/flights/:id', flightController.update);
router.delete('/admin/flights/:id', flightController.remove);

// Admin Private Jet CRUD & Seed
router.get('/admin/private-jets', flightController.listPrivateJets);
router.post('/admin/private-jets', flightController.createPrivateJet);
router.patch('/admin/private-jets/:id', flightController.updatePrivateJet);
router.delete('/admin/private-jets/:id', flightController.deletePrivateJet);
router.post('/admin/private-jets/seed', flightController.seedPrivateJets);

// Admin Flight Location Update
router.patch('/admin/flights/:id/location', flightController.updateLocation);

router.get('/admin/payments', paymentController.list);
router.get('/admin/payments/:id', paymentController.getById);
router.patch('/admin/payments/:id/mark-paid', paymentController.markPaid);
router.post('/admin/payments/:id/send-ticket/whatsapp', paymentController.sendTicketWhatsapp);
router.post('/admin/payments/:id/send-ticket/email', paymentController.sendTicketEmail);
router.patch('/admin/payments/:id/confirm-delivery', paymentController.confirmDelivery);

// Admin Mail Dispatch
router.post('/admin/mail/send', mailController.sendMail);

export default router;
