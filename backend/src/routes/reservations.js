import express from 'express';
import {
  createReservation,
  getUserReservations,
  getAllReservations,
  getReservationById,
  cancelReservation
} from '../controllers/reservationsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createReservation);
router.get('/my-reservations', authMiddleware, getUserReservations);
router.get('/', authMiddleware, getAllReservations);
router.get('/:id', authMiddleware, getReservationById);
router.delete('/:id', authMiddleware, cancelReservation);

export default router;
