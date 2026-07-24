"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookingReference = exports.formatWhatsAppMessage = void 0;
const env_1 = require("../config/env");
const formatWhatsAppMessage = (number, message) => {
    const encodedMessage = encodeURIComponent(message);
    const baseUrl = env_1.env.WHATSAPP_API_URL;
    return `${baseUrl}?phone=${number.replace('+', '')}&text=${encodedMessage}`;
};
exports.formatWhatsAppMessage = formatWhatsAppMessage;
const generateBookingReference = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${date}-${randomStr}`;
};
exports.generateBookingReference = generateBookingReference;
