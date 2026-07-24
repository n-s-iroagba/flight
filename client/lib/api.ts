import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStats = async () => {
  const response = await api.get('/public/stats');
  return response.data.data;
};

export const getFeaturedFlights = async () => {
  const response = await api.get('/public/flights/featured');
  return response.data.data;
};

export const searchFlights = async (params: any) => {
  const response = await api.post('/flights/search', params);
  return response.data;
};

export const getFlightDetails = async (id: string) => {
  const response = await api.get(`/flights/${id}/details`);
  return response.data.data;
};

export const initiateBooking = async (data: any) => {
  const response = await api.post('/bookings/initiate', data);
  return response.data.data;
};

export const initiatePrivateJetBooking = async (data: any) => {
  const response = await api.post('/bookings/initiate-private-jet', data);
  return response.data.data;
};

export const getPublicPrivateJets = async () => {
  const response = await api.get('/public/private-jets');
  return response.data.data;
};

export const trackFlightByTicket = async (ticketNumber: string) => {
  const response = await api.get(`/flights/track/${encodeURIComponent(ticketNumber)}`);
  return response.data.data;
};

// Admin API
export const adminLogin = async (credentials: any) => {
  const response = await api.post('/admin/auth/login', credentials);
  return response.data;
};

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token && config.url?.startsWith('/admin')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getAdminFlights = async (params?: any) => {
  const response = await api.get('/admin/flights', { params });
  return response.data.data;
};

export const createAdminFlight = async (data: any) => {
  const response = await api.post('/admin/flights', data);
  return response.data.data;
};

export const getAdminPrivateJets = async (params?: any) => {
  const response = await api.get('/admin/private-jets', { params });
  return response.data.data;
};

export const createAdminPrivateJet = async (data: any) => {
  const response = await api.post('/admin/private-jets', data);
  return response.data.data;
};

export const updateAdminPrivateJet = async (id: string, data: any) => {
  const response = await api.patch(`/admin/private-jets/${id}`, data);
  return response.data.data;
};

export const deleteAdminPrivateJet = async (id: string) => {
  const response = await api.delete(`/admin/private-jets/${id}`);
  return response.data.data;
};

export const seedAdminPrivateJets = async () => {
  const response = await api.post('/admin/private-jets/seed');
  return response.data.data;
};

export const updateFlightLocation = async (id: string, locationData: { latitude: number; longitude: number; currentLocation?: string }) => {
  const response = await api.patch(`/admin/flights/${id}/location`, locationData);
  return response.data.data;
};

export const getAdminPayments = async (params?: any) => {
  const response = await api.get('/admin/payments', { params });
  return response.data.data;
};

export const markPaymentPaid = async (id: string, data: any) => {
  const response = await api.patch(`/admin/payments/${id}/mark-paid`, data);
  return response.data.data;
};

export const sendTicketWhatsapp = async (id: string, data: any) => {
  const response = await api.post(`/admin/payments/${id}/send-ticket/whatsapp`, data);
  return response.data.data;
};

export const sendTicketEmail = async (id: string, data: any) => {
  const response = await api.post(`/admin/payments/${id}/send-ticket/email`, data);
  return response.data.data;
};

export const confirmTicketDelivery = async (id: string, data: any) => {
  const response = await api.patch(`/admin/payments/${id}/confirm-delivery`, data);
  return response.data.data;
};

export default api;
