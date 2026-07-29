import express from 'express';
import { getVehicles, createVehicle } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVehicles);
router.post('/', protect, createVehicle);

export default router;
