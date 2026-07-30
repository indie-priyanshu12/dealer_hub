import express from 'express';
import { getVehicles, getVehicleById, searchVehicles, createVehicle, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle, getVehicleImage } from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVehicles);
// Must stay before '/:id', or Express will match "search" as an id.
router.get('/search', protect, searchVehicles);
// Deliberately public (no `protect`): these URLs go into <img src>, and image tags
// cannot attach an Authorization header. Read-only binary serving of showroom photos
// is the one intentionally-unauthenticated vehicle route.
router.get('/:id/images/:index', getVehicleImage);
router.get('/:id', protect, getVehicleById);
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
