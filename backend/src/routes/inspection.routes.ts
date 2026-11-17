import { Router } from 'express';
import { submitInspection, adminApproveInspection } from '../controllers/inspection.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', authenticateJWT, requireRole(Role.AGENT, Role.ADMIN), submitInspection);
router.patch('/:id/approve', authenticateJWT, requireRole(Role.ADMIN), adminApproveInspection);

export default router;

