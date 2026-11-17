import { Router } from 'express';
import { listPickups, getAgentPickups, assignAgent, startPickup, completePickup } from '../controllers/pickup.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateJWT, requireRole(Role.ADMIN), listPickups);
router.get('/agent', authenticateJWT, requireRole(Role.AGENT, Role.ADMIN), getAgentPickups);
router.post('/assign', authenticateJWT, requireRole(Role.ADMIN), assignAgent);
router.patch('/:id/start', authenticateJWT, requireRole(Role.AGENT, Role.ADMIN), startPickup);
router.patch('/:id/complete', authenticateJWT, requireRole(Role.AGENT, Role.ADMIN), completePickup);

export default router;

