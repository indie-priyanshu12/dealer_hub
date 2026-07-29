import express from 'express';
import { getVehicles, searchVehicles, createVehicle, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle } from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVehicles);
// Must stay before any future '/:id' route, or Express will match "search" as an id.
router.get('/search', protect, searchVehicles);
// Both create and update deviate from requirements.md's literal "Authenticated
// user" access — restricted to Admin only so the whole management surface
// (add/update/delete/restock) is consistently admin-gated server-side, matching
// the admin-only visibility §2.2.2.5 requires for their frontend UI.
router.post('/', protect, admin, createVehicle);
router.put('/:id', protect, admin, updateVehicle);
router.delete('/:id', protect, admin, deleteVehicle);
router.post('/:id/purchase', protect, purchaseVehicle);
router.post('/:id/restock', protect, admin, restockVehicle);

export default router;
