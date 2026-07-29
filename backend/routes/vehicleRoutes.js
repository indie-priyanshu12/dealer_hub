import express from 'express';
import { getVehicles, searchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVehicles);
// Must stay before any future '/:id' route, or Express will match "search" as an id.
router.get('/search', protect, searchVehicles);
router.post('/', protect, createVehicle);
// Deviates from requirements.md's literal "Authenticated user" access for this
// endpoint — restricted to Admin only per explicit user decision.
router.put('/:id', protect, admin, updateVehicle);
router.delete('/:id', protect, admin, deleteVehicle);

export default router;
