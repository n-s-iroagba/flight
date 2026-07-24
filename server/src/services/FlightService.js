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
exports.FlightService = void 0;
const models_1 = require("../models");
const LetsFGService_1 = __importDefault(require("./LetsFGService"));
const sequelize_1 = require("sequelize");
class FlightService {
    getFeaturedFlights() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            const flights = yield models_1.Flight.findAll({
                where: { status: 'active', is_private_jet: false },
                order: [['price', 'ASC']],
                limit,
            });
            return flights.map(f => (Object.assign(Object.assign({}, f.toJSON()), { source: 'admin' })));
        });
    }
    searchFlights(origin, destination, departureDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(`${departureDate}T00:00:00.000Z`);
            const endDate = new Date(`${departureDate}T23:59:59.999Z`);
            const adminFlightsP = models_1.Flight.findAll({
                where: {
                    origin,
                    destination,
                    status: 'active',
                    is_private_jet: false,
                    departure_time: {
                        [sequelize_1.Op.between]: [startDate, endDate],
                    },
                },
            });
            const externalFlightsP = LetsFGService_1.default.searchFlights(origin, destination, departureDate);
            const [adminFlights, externalFlights] = yield Promise.all([adminFlightsP, externalFlightsP]);
            const formattedAdminFlights = adminFlights.map((f) => (Object.assign(Object.assign({}, f.toJSON()), { source: 'admin', stops: 0, duration: this.calculateDuration(f.departure_time, f.arrival_time) })));
            const formattedExternalFlights = externalFlights.map((f) => (Object.assign(Object.assign({}, f), { source: 'letsfg' })));
            const allFlights = [...formattedAdminFlights, ...formattedExternalFlights].sort((a, b) => a.price - b.price);
            return allFlights;
        });
    }
    getFlightDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const flight = yield models_1.Flight.findByPk(id);
            if (!flight)
                return null;
            return Object.assign(Object.assign({}, flight.toJSON()), { source: 'admin' });
        });
    }
    // Private Jet Management
    listPrivateJets() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20) {
            const offset = (page - 1) * limit;
            const { rows, count } = yield models_1.Flight.findAndCountAll({
                where: { is_private_jet: true },
                limit,
                offset,
                order: [['created_at', 'DESC']],
            });
            return { flights: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
        });
    }
    createPrivateJet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const flight = yield models_1.Flight.create(Object.assign(Object.assign({}, data), { is_private_jet: true, departure_time: new Date(data.departureTime), arrival_time: new Date(data.arrivalTime), total_seats: data.totalSeats || 12, available_seats: data.availableSeats || data.totalSeats || 12, airline_code: data.airlineCode || 'PJ', flight_number: data.flightNumber || `PJ-${Math.floor(1000 + Math.random() * 9000)}`, cabin_class: data.cabinClass || 'first', current_latitude: (_a = data.current_latitude) !== null && _a !== void 0 ? _a : 51.5074, current_longitude: (_b = data.current_longitude) !== null && _b !== void 0 ? _b : -0.1278, current_location: data.current_location || 'En Route (London Terminal)' }));
            return flight;
        });
    }
    updatePrivateJet(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const flight = yield models_1.Flight.findByPk(id);
            if (!flight)
                throw new Error('Private Jet flight not found');
            if (data.departureTime)
                data.departure_time = new Date(data.departureTime);
            if (data.arrivalTime)
                data.arrival_time = new Date(data.arrivalTime);
            yield flight.update(data);
            return flight;
        });
    }
    deletePrivateJet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const flight = yield models_1.Flight.findByPk(id);
            if (!flight)
                throw new Error('Private Jet flight not found');
            yield flight.destroy();
            return true;
        });
    }
    seedPrivateJets() {
        return __awaiter(this, void 0, void 0, function* () {
            const sampleJets = [
                {
                    origin: 'LHR',
                    destination: 'JFK',
                    departure_time: new Date(Date.now() + 86400000),
                    arrival_time: new Date(Date.now() + 86400000 + 25200000),
                    airline: 'Royal Jet Charter',
                    airline_code: 'PJ',
                    flight_number: 'PJ-808',
                    price: 25000,
                    currency: 'USD',
                    total_seats: 14,
                    available_seats: 14,
                    aircraft: 'Gulfstream G650ER',
                    baggage: 'Unlimited hold baggage',
                    cancellation_policy: 'Full refund 48h prior',
                    cabin_class: 'first',
                    status: 'active',
                    is_private_jet: true,
                    current_latitude: 51.4700,
                    current_longitude: -0.4543,
                    current_location: 'London Heathrow Jet Centre',
                },
                {
                    origin: 'DXB',
                    destination: 'NCE',
                    departure_time: new Date(Date.now() + 172800000),
                    arrival_time: new Date(Date.now() + 172800000 + 21600000),
                    airline: 'ExecuJet Private',
                    airline_code: 'PJ',
                    flight_number: 'PJ-707',
                    price: 18500,
                    currency: 'USD',
                    total_seats: 12,
                    available_seats: 12,
                    aircraft: 'Bombardier Global 7500',
                    baggage: 'VIP concierge handling',
                    cancellation_policy: 'Flexible rebooking',
                    cabin_class: 'first',
                    status: 'active',
                    is_private_jet: true,
                    current_latitude: 25.2532,
                    current_longitude: 55.3657,
                    current_location: 'Dubai Al Maktoum Executive Terminal',
                },
                {
                    origin: 'JFK',
                    destination: 'MIA',
                    departure_time: new Date(Date.now() + 43200000),
                    arrival_time: new Date(Date.now() + 43200000 + 10800000),
                    airline: 'NetJets Sovereign',
                    airline_code: 'PJ',
                    flight_number: 'PJ-505',
                    price: 12000,
                    currency: 'USD',
                    total_seats: 8,
                    available_seats: 8,
                    aircraft: 'Cessna Citation X+',
                    baggage: 'Pet-friendly cabin storage',
                    cancellation_policy: 'Full refund 24h prior',
                    cabin_class: 'first',
                    status: 'active',
                    is_private_jet: true,
                    current_latitude: 40.6413,
                    current_longitude: -73.7781,
                    current_location: 'New York JFK Signature Flight Support',
                },
                {
                    origin: 'VCE',
                    destination: 'GVA',
                    departure_time: new Date(Date.now() + 259200000),
                    arrival_time: new Date(Date.now() + 259200000 + 7200000),
                    airline: 'VistaJet Elite',
                    airline_code: 'PJ',
                    flight_number: 'PJ-303',
                    price: 14500,
                    currency: 'USD',
                    total_seats: 10,
                    available_seats: 10,
                    aircraft: 'Dassault Falcon 8X',
                    baggage: 'High capacity luggage bay',
                    cancellation_policy: 'Free cancellation',
                    cabin_class: 'first',
                    status: 'active',
                    is_private_jet: true,
                    current_latitude: 45.5053,
                    current_longitude: 12.3519,
                    current_location: 'Venice Marco Polo Private Aviation',
                },
                {
                    origin: 'LAS',
                    destination: 'LAX',
                    departure_time: new Date(Date.now() + 36000000),
                    arrival_time: new Date(Date.now() + 36000000 + 3600000),
                    airline: 'Air Charter Service',
                    airline_code: 'PJ',
                    flight_number: 'PJ-101',
                    price: 8900,
                    currency: 'USD',
                    total_seats: 6,
                    available_seats: 6,
                    aircraft: 'Embraer Phenom 300E',
                    baggage: 'Standard luxury luggage allowance',
                    cancellation_policy: 'Flexible',
                    cabin_class: 'first',
                    status: 'active',
                    is_private_jet: true,
                    current_latitude: 36.0840,
                    current_longitude: -115.1537,
                    current_location: 'Las Vegas Harry Reid Executive Terminal',
                }
            ];
            const created = [];
            for (const jetData of sampleJets) {
                const [jet] = yield models_1.Flight.findOrCreate({
                    where: { flight_number: jetData.flight_number },
                    defaults: jetData,
                });
                created.push(jet);
            }
            return created;
        });
    }
    // Flight Tracking & Location Updates
    trackFlightByTicket(ticketNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const trimmedNumber = ticketNumber.trim();
            // First search ticket table
            const ticket = yield models_1.Ticket.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { ticket_number: trimmedNumber },
                        { pnr: trimmedNumber }
                    ]
                },
                include: [
                    {
                        model: models_1.Booking,
                        as: 'booking',
                        include: [{ model: models_1.Flight, as: 'flight' }]
                    }
                ]
            });
            const ticketObj = ticket;
            if (ticketObj && ticketObj.booking && ticketObj.booking.flight) {
                const flight = ticketObj.booking.flight;
                return {
                    ticketNumber: ticketObj.ticket_number,
                    pnr: ticketObj.pnr,
                    deliveryStatus: ticketObj.delivery_status,
                    passengerName: ticketObj.booking.passenger_name,
                    bookingReference: ticketObj.booking.booking_reference,
                    bookingStatus: ticketObj.booking.status,
                    flight: {
                        id: flight.id,
                        origin: flight.origin,
                        destination: flight.destination,
                        departureTime: flight.departure_time,
                        arrivalTime: flight.arrival_time,
                        airline: flight.airline,
                        airlineCode: flight.airline_code,
                        flightNumber: flight.flight_number,
                        aircraft: flight.aircraft,
                        status: flight.status,
                        isPrivateJet: flight.is_private_jet,
                        latitude: (_a = flight.current_latitude) !== null && _a !== void 0 ? _a : 51.5074,
                        longitude: (_b = flight.current_longitude) !== null && _b !== void 0 ? _b : -0.1278,
                        currentLocation: flight.current_location || `${flight.origin} International Airport`
                    }
                };
            }
            // Fallback: Check direct booking reference or flight number for quick lookup
            const booking = yield models_1.Booking.findOne({
                where: { booking_reference: trimmedNumber },
                include: [{ model: models_1.Flight, as: 'flight' }]
            });
            const bookingObj = booking;
            if (bookingObj && bookingObj.flight) {
                const flight = bookingObj.flight;
                return {
                    ticketNumber: `TCK-${bookingObj.booking_reference}`,
                    pnr: bookingObj.booking_reference,
                    deliveryStatus: 'confirmed',
                    passengerName: bookingObj.passenger_name,
                    bookingReference: bookingObj.booking_reference,
                    bookingStatus: bookingObj.status,
                    flight: {
                        id: flight.id,
                        origin: flight.origin,
                        destination: flight.destination,
                        departureTime: flight.departure_time,
                        arrivalTime: flight.arrival_time,
                        airline: flight.airline,
                        airlineCode: flight.airline_code,
                        flightNumber: flight.flight_number,
                        aircraft: flight.aircraft,
                        status: flight.status,
                        isPrivateJet: flight.is_private_jet,
                        latitude: (_c = flight.current_latitude) !== null && _c !== void 0 ? _c : 51.5074,
                        longitude: (_d = flight.current_longitude) !== null && _d !== void 0 ? _d : -0.1278,
                        currentLocation: flight.current_location || `${flight.origin} International Airport`
                    }
                };
            }
            // Secondary Fallback: Lookup flight directly by flight_number
            const flightDirect = yield models_1.Flight.findOne({
                where: { flight_number: trimmedNumber }
            });
            if (flightDirect) {
                return {
                    ticketNumber: `TCK-DEMO-${flightDirect.flight_number}`,
                    pnr: `PNR-${flightDirect.flight_number}`,
                    deliveryStatus: 'confirmed',
                    passengerName: 'Valued Passenger',
                    bookingReference: `REF-${flightDirect.flight_number}`,
                    bookingStatus: 'paid',
                    flight: {
                        id: flightDirect.id,
                        origin: flightDirect.origin,
                        destination: flightDirect.destination,
                        departureTime: flightDirect.departure_time,
                        arrivalTime: flightDirect.arrival_time,
                        airline: flightDirect.airline,
                        airlineCode: flightDirect.airline_code,
                        flightNumber: flightDirect.flight_number,
                        aircraft: flightDirect.aircraft,
                        status: flightDirect.status,
                        isPrivateJet: flightDirect.is_private_jet,
                        latitude: (_e = flightDirect.current_latitude) !== null && _e !== void 0 ? _e : 51.5074,
                        longitude: (_f = flightDirect.current_longitude) !== null && _f !== void 0 ? _f : -0.1278,
                        currentLocation: flightDirect.current_location || `${flightDirect.origin} International Airport`
                    }
                };
            }
            return null;
        });
    }
    updateFlightLocation(id, latitude, longitude, currentLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const flight = yield models_1.Flight.findByPk(id);
            if (!flight)
                throw new Error('Flight not found');
            yield flight.update(Object.assign({ current_latitude: latitude, current_longitude: longitude }, (currentLocation ? { current_location: currentLocation } : {})));
            return flight;
        });
    }
    calculateDuration(start, end) {
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}
exports.FlightService = FlightService;
exports.default = new FlightService();
