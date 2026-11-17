import { Router } from 'express';
import { respondToValuation } from '../controllers/valuation.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/:productId/respond', authenticateJWT, respondToValuation);

export default router;

