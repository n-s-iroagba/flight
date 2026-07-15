import { Flight } from '../models';
import letsFGService, { LetsFGFlight } from './LetsFGService';
import { Op } from 'sequelize';

export class FlightService {
  async getFeaturedFlights(limit: number = 5) {
    const flights = await Flight.findAll({
      where: { status: 'active' },
      order: [['price', 'ASC']],
      limit,
    });
    return flights.map(f => ({ ...f.toJSON(), source: 'admin' }));
  }

  async searchFlights(origin: string, destination: string, departureDate: string) {
    const startDate = new Date(`${departureDate}T00:00:00.000Z`);
    const endDate = new Date(`${departureDate}T23:59:59.999Z`);

    const adminFlightsP = Flight.findAll({
      where: {
        origin,
        destination,
        status: 'active',
        departure_time: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const externalFlightsP = letsFGService.searchFlights(origin, destination, departureDate);

    const [adminFlights, externalFlights] = await Promise.all([adminFlightsP, externalFlightsP]);

    const formattedAdminFlights = adminFlights.map((f) => ({
      ...f.toJSON(),
      source: 'admin',
      stops: 0, // Assuming admin flights are direct for simplicity, or handle via segments if added
      duration: this.calculateDuration(f.departure_time, f.arrival_time),
    }));

    const formattedExternalFlights = externalFlights.map((f) => ({
      ...f,
      source: 'letsfg',
    }));

    // Merge and deduplicate (simplified by just joining arrays here)
    const allFlights = [...formattedAdminFlights, ...formattedExternalFlights].sort((a, b) => a.price - b.price);
    return allFlights;
  }

  async getFlightDetails(id: string) {
    const flight = await Flight.findByPk(id);
    if (!flight) return null;
    return { ...flight.toJSON(), source: 'admin' };
  }

  private calculateDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export default new FlightService();
