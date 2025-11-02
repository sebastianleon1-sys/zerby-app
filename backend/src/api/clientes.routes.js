import { Router } from 'express';
import {
  getClienteProfile,
  updateClienteProfile,
} from '../controllers/cliente.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas protegidas
router.use(verifyToken, verifyRole(['CLIENTE']));

// GET /api/clientes/profile
router.get('/profile', getClienteProfile);

// PUT /api/clientes/profile
router.put('/profile', updateClienteProfile);

export default router;