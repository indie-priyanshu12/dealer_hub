import express from 'express';
import { getMyPurchases, getAllPurchases } from '../controllers/purchaseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every signed-in user can read their own history; the full ledger across all
// customers is admin-only, same tier as the other management surfaces.
router.get('/mine', protect, getMyPurchases);
router.get('/', protect, admin, getAllPurchases);

export default router;
