import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  checkVehicleAvailability
} from '../controllers/vehiclesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAllVehicles);
router.get('/:id', authMiddleware, getVehicleById);
router.get('/:id/availability', authMiddleware, checkVehicleAvailability);

export default router;
