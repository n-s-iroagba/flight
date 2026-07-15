import { Flight } from './Flight';
import { Booking } from './Booking';
import { Payment } from './Payment';
import { Ticket } from './Ticket';
import { AdminUser } from './AdminUser';

Flight.hasMany(Booking, { foreignKey: 'flight_id', as: 'bookings' });
Booking.belongsTo(Flight, { foreignKey: 'flight_id', as: 'flight' });

Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Booking.hasMany(Ticket, { foreignKey: 'booking_id', as: 'tickets' });
Ticket.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

export { Flight, Booking, Payment, Ticket, AdminUser };
