import { Router } from 'express';
import {
  getAdminStats,
  getAllRequests,
  getAllAgents,
  getAllTransactions,
  getAuditLogs,
  getRecyclers,
  routeToRecycler,
  getProfitRules,
  updateProfitRule,
  getMapLocations,
  createAgent,
  updateAgent,
  getAllRetailers,
  createRetailer,
} from '../controllers/admin.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT, requireRole(Role.ADMIN));

router.get('/stats', getAdminStats);
router.get('/requests', getAllRequests);
router.get('/agents', getAllAgents);
router.post('/agents', createAgent);
router.patch('/agents/:id', updateAgent);
router.get('/retailers', getAllRetailers);
router.post('/retailers', createRetailer);
router.get('/transactions', getAllTransactions);
router.get('/audit-logs', getAuditLogs);

// Recyclers & Circular Routing
router.get('/recyclers', getRecyclers);
router.post('/recyclers/route-product', routeToRecycler);

// Profit Sharing Rules
router.get('/profit-rules', getProfitRules);
router.patch('/profit-rules/:id', updateProfitRule);

// Geographic Mapping & Fleet Routing
router.get('/map-locations', getMapLocations);

export default router;
