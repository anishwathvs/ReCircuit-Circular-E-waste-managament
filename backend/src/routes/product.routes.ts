import { Router } from 'express';
import {
  submitProduct,
  getMyProducts,
  getProductById,
  uploadMiddleware,
  uploadImageHandler,
} from '../controllers/product.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateJWT, submitProduct);
router.post('/upload-image', authenticateJWT, uploadMiddleware.single('image'), uploadImageHandler);
router.get('/my-products', authenticateJWT, getMyProducts);
router.get('/:id', authenticateJWT, getProductById);

export default router;
