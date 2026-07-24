"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Ticket extends sequelize_1.Model {
}
exports.Ticket = Ticket;
Ticket.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    booking_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    ticket_number: { type: sequelize_1.DataTypes.STRING(50), unique: true, allowNull: false },
    pnr: { type: sequelize_1.DataTypes.STRING(10), allowNull: false },
    e_ticket_url: { type: sequelize_1.DataTypes.STRING(255) },
    qr_code: { type: sequelize_1.DataTypes.TEXT },
    delivery_status: { type: sequelize_1.DataTypes.ENUM('pending', 'sent', 'confirmed'), defaultValue: 'pending' },
    sent_via: { type: sequelize_1.DataTypes.ENUM('whatsapp', 'email') },
    sent_at: { type: sequelize_1.DataTypes.DATE },
    confirmed_at: { type: sequelize_1.DataTypes.DATE },
}, {
    sequelize: database_1.default,
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});
