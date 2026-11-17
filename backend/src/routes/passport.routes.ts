import { Router } from 'express';
import { getProductPassport } from '../controllers/product.controller.js';

const router = Router();

router.get('/:customId', getProductPassport);

export default router;

