import express from 'express';
import { getVehicles } from '../controllers/vehicleController.js';
// Protect middleware will be added later per requirements

const router = express.Router();

router.get('/', getVehicles);

export default router;
