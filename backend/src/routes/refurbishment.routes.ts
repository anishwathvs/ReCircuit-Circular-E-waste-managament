import { Router } from 'express';
import { updateRefurbishment, qualityApprove } from '../controllers/refurbishment.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.post('/:productId/log', authenticateJWT, requireRole(Role.ADMIN), updateRefurbishment);
router.post('/:productId/quality-approve', authenticateJWT, requireRole(Role.ADMIN), qualityApprove);

export default router;

