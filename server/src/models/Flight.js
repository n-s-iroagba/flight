"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flight = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Flight extends sequelize_1.Model {
}
exports.Flight = Flight;
Flight.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    origin: { type: sequelize_1.DataTypes.STRING(3), allowNull: false },
    destination: { type: sequelize_1.DataTypes.STRING(3), allowNull: false },
    departure_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    arrival_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    airline: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
    airline_code: { type: sequelize_1.DataTypes.STRING(2), allowNull: false },
    flight_number: { type: sequelize_1.DataTypes.STRING(10), allowNull: false },
    price: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: sequelize_1.DataTypes.STRING(3), defaultValue: 'USD' },
    total_seats: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    available_seats: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    aircraft: { type: sequelize_1.DataTypes.STRING(100) },
    baggage: { type: sequelize_1.DataTypes.TEXT },
    cancellation_policy: { type: sequelize_1.DataTypes.TEXT },
    cabin_class: {
        type: sequelize_1.DataTypes.ENUM('economy', 'premium_economy', 'business', 'first'),
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'sold_out'),
        defaultValue: 'active'
    },
    is_private_jet: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    current_latitude: {
        type: sequelize_1.DataTypes.DECIMAL(10, 6),
        allowNull: true
    },
    current_longitude: {
        type: sequelize_1.DataTypes.DECIMAL(10, 6),
        allowNull: true
    },
    current_location: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    }
}, {
    sequelize: database_1.default,
    tableName: 'flights',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
