"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    booking_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: sequelize_1.DataTypes.STRING(3), defaultValue: 'USD' },
    method: { type: sequelize_1.DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'whatsapp'), allowNull: false },
    reference: { type: sequelize_1.DataTypes.STRING(100) },
    status: { type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
    confirmed_by: { type: sequelize_1.DataTypes.STRING(100) },
    confirmed_at: { type: sequelize_1.DataTypes.DATE },
    notes: { type: sequelize_1.DataTypes.TEXT },
}, {
    sequelize: database_1.default,
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});
