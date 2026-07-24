"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Booking extends sequelize_1.Model {
}
exports.Booking = Booking;
Booking.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    booking_reference: { type: sequelize_1.DataTypes.STRING(20), unique: true, allowNull: false },
    flight_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    passenger_name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    passenger_email: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    passenger_phone: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    special_requests: { type: sequelize_1.DataTypes.TEXT },
    source: { type: sequelize_1.DataTypes.ENUM('admin', 'letsfg'), allowNull: false },
    offer_id: { type: sequelize_1.DataTypes.STRING(100) },
    amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: sequelize_1.DataTypes.STRING(3), defaultValue: 'USD' },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'processing', 'paid', 'failed', 'cancelled'),
        defaultValue: 'pending'
    },
    whatsapp_conversation: { type: sequelize_1.DataTypes.TEXT },
    paid_at: { type: sequelize_1.DataTypes.DATE },
    confirmed_by: { type: sequelize_1.DataTypes.STRING(100) },
    notes: { type: sequelize_1.DataTypes.TEXT },
}, {
    sequelize: database_1.default,
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});
