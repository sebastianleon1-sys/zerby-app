import { Router } from 'express';
import { createReview, getReviewsForAnuncio } from '../controllers/review.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/reviews/anuncio/:anuncioId, es publico
router.get('/anuncio/:anuncioId', getReviewsForAnuncio);

// POST /api/reviews/anuncio/:anuncioId, solo para clientes logueados
router.post(
  '/anuncio/:anuncioId',
  verifyToken,
  verifyRole(['CLIENTE']),
  createReview
);

export default router;