import { Router } from 'express';
import {
    createListing,
    getListings,
    getListingById,
    updateListingStatus,
    deleteListing,
    markInterested,
    getMyListings,
    adminGetAllListings,
    adminRemoveListing,
    suspendUser,
} from '../controllers/listingController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getListings);

// Protected routes (must be logged in) — specific paths before parameterized
router.post('/', protect, authorize('Farmer', 'Trader', 'Seller'), createListing);
router.get('/user/my-listings', protect, getMyListings);

// Admin routes (before :id to avoid conflicts)
router.get('/admin/all', protect, authorize('Admin'), adminGetAllListings);
router.delete('/admin/:id', protect, authorize('Admin'), adminRemoveListing);
router.patch('/admin/users/:id/suspend', protect, authorize('Admin'), suspendUser);

// Parameterized routes (must come last)
router.get('/:id', getListingById);
router.patch('/:id/status', protect, updateListingStatus);
router.delete('/:id', protect, deleteListing);
router.post('/:id/interest', protect, authorize('Buyer', 'Trader'), markInterested);

// Admin routes
router.get('/admin/all', protect, authorize('Admin'), adminGetAllListings);
router.delete('/admin/:id', protect, authorize('Admin'), adminRemoveListing);
router.patch('/admin/users/:id/suspend', protect, authorize('Admin'), suspendUser);

export default router;
