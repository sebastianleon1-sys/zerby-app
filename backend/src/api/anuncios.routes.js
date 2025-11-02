import { Router } from 'express';
import {
  createAnuncio,
  getAnuncios,
  getAnuncioById,
  updateAnuncio,
  deleteAnuncio,
} from '../controllers/anuncio.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/anuncios 
router.get('/', getAnuncios);

// GET /api/anuncios/:id
router.get('/:id', getAnuncioById);

// Rutas protegidas, solo proveedores
router.post(
  '/',
  verifyToken,
  verifyRole(['PROVEEDOR']),
  createAnuncio
);

router.put(
  '/:id',
  verifyToken,
  verifyRole(['PROVEEDOR']),
  updateAnuncio
);

router.delete(
  '/:id',
  verifyToken,
  verifyRole(['PROVEEDOR']),
  deleteAnuncio
);

export default router;