import { Router } from 'express';
import {
  listMarketplace,
  getListingById,
  placeOrder,
  getRetailerOrders,
  createPaymentIntentHandler,
  handlePaymentWebhook,
} from '../controllers/marketplace.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Publicly browse listings
router.get('/', listMarketplace);
router.get('/:id', getListingById);

// Payment Gateway Integration (Test / Sandbox mode)
router.post('/payment-intent', authenticateJWT, createPaymentIntentHandler);
router.post('/webhook', handlePaymentWebhook);

// Retailer order actions
router.post('/order', authenticateJWT, requireRole(Role.RETAILER, Role.ADMIN), placeOrder);
router.get('/orders/my-orders', authenticateJWT, requireRole(Role.RETAILER, Role.ADMIN), getRetailerOrders);

export default router;
