import { Role, Product, PickupRequest, MarketplaceListing, Order, Transaction, AuditLog } from '../types';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = getApiBase();

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('recircuit_token');
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'API request failed');
  }
  return res.json();
};

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  demoLogin: (role: Role) =>
    fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    }).then(handleResponse),

  register: (data: any) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  verifyEmail: (token: string) =>
    fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    }).then(handleResponse),

  forgotPassword: (email: string) =>
    fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    }).then(handleResponse),

  resetPassword: (token: string, newPassword: string) =>
    fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token, newPassword }),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Products
  submitProduct: (data: any) =>
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  uploadProductImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('recircuit_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/products/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  getMyProducts: () =>
    fetch(`${API_BASE}/products/my-products`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getProductById: (id: string) =>
    fetch(`${API_BASE}/products/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Public Passport
  getProductPassport: (customId: string) =>
    fetch(`${API_BASE}/passport/${customId}`).then(handleResponse),

  // Pickups
  getPickups: (params?: { status?: string; city?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetch(`${API_BASE}/pickups${q ? `?${q}` : ''}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getAgentPickups: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return fetch(`${API_BASE}/pickups/agent${q}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  assignAgent: (pickupId: string, agentId: string) =>
    fetch(`${API_BASE}/pickups/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pickupId, agentId }),
    }).then(handleResponse),

  startPickup: (id: string) =>
    fetch(`${API_BASE}/pickups/${id}/start`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  completePickup: (id: string, data: { collectionNotes?: string; collectionImages?: string[] }) =>
    fetch(`${API_BASE}/pickups/${id}/complete`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Inspection
  submitInspection: (data: any) =>
    fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  approveInspection: (id: string, decision: 'APPROVE_REFURBISH' | 'ROUTE_RECYCLE') =>
    fetch(`${API_BASE}/inspections/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ decision }),
    }).then(handleResponse),

  // Valuation
  respondValuation: (productId: string, accept: boolean, remarks?: string) =>
    fetch(`${API_BASE}/valuations/${productId}/respond`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ accept, userRemarks: remarks }),
    }).then(handleResponse),

  // Refurbishment
  logRefurbishment: (productId: string, data: any) =>
    fetch(`${API_BASE}/refurbishment/${productId}/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  certifyRefurbishment: (productId: string, data: any) =>
    fetch(`${API_BASE}/refurbishment/${productId}/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  approveQualityAndList: (productId: string, data: { warrantyMonths?: number; sellingPrice?: number }) =>
    fetch(`${API_BASE}/refurbishment/${productId}/quality-approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Marketplace & Payments
  getMarketplace: (params?: any) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/marketplace${q ? `?${q}` : ''}`).then(handleResponse);
  },

  getListingById: (id: string) =>
    fetch(`${API_BASE}/marketplace/${id}`).then(handleResponse),

  createPaymentIntent: (amount: number, orderId?: string) =>
    fetch(`${API_BASE}/marketplace/payment-intent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, orderId }),
    }).then(handleResponse),

  placeOrder: (listingIds: string[], shippingAddress?: string, paymentIntentId?: string) =>
    fetch(`${API_BASE}/marketplace/order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ listingIds, shippingAddress, paymentIntentId }),
    }).then(handleResponse),

  getRetailerOrders: () =>
    fetch(`${API_BASE}/marketplace/orders/my-orders`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Notifications
  getNotifications: () =>
    fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(),
    }).then(handleResponse),

  markNotificationRead: (id: string) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  markAllNotificationsRead: () =>
    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  // Admin
  getAdminStats: () =>
    fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminRequests: (params?: any) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/requests${q ? `?${q}` : ''}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getAdminAgents: () =>
    fetch(`${API_BASE}/admin/agents`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminTransactions: () =>
    fetch(`${API_BASE}/admin/transactions`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminAuditLogs: () =>
    fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getRecyclers: () =>
    fetch(`${API_BASE}/admin/recyclers`, {
      headers: getHeaders(),
    }).then(handleResponse),

  routeToRecycler: (productId: string, recyclerId: string, weightKg?: number) =>
    fetch(`${API_BASE}/admin/recyclers/route-product`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, recyclerId, weightKg }),
    }).then(handleResponse),

  getProfitRules: () =>
    fetch(`${API_BASE}/admin/profit-rules`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updateProfitRule: (id: string, data: any) =>
    fetch(`${API_BASE}/admin/profit-rules/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getMapLocations: () =>
    fetch(`${API_BASE}/admin/map-locations`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updateProfile: (data: any) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  createAgent: (data: any) =>
    fetch(`${API_BASE}/admin/agents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateAgent: (id: string, data: any) =>
    fetch(`${API_BASE}/admin/agents/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getAdminRetailers: () =>
    fetch(`${API_BASE}/admin/retailers`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createRetailer: (data: any) =>
    fetch(`${API_BASE}/admin/retailers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};
