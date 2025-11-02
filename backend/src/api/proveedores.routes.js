import { Router } from 'express';
import {
  findNearbyProveedores,
  getProveedorProfile,
  updateProveedorProfile,
} from '../controllers/proveedor.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/proveedores/nearby?lat=...&lng=...&radius=...
router.get('/nearby', findNearbyProveedores);

// GET /api/proveedores/profile
router.get(
  '/profile',
  verifyToken,
  verifyRole(['PROVEEDOR']),
  getProveedorProfile
);

// PUT /api/proveedores/profile
router.put(
  '/profile',
  verifyToken,
  verifyRole(['PROVEEDOR']),
  updateProveedorProfile
);

export default router;