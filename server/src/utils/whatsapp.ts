import { env } from '../config/env';

export const formatWhatsAppMessage = (
  number: string,
  message: string
): string => {
  const encodedMessage = encodeURIComponent(message);
  const baseUrl = env.WHATSAPP_API_URL;
  return `${baseUrl}?phone=${number.replace('+', '')}&text=${encodedMessage}`;
};

export const generateBookingReference = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${date}-${randomStr}`;
};
