import { Router } from 'express';
import {
    getPrices,
    getLatestPrice,
    createPrice,
    approvePrice,
    rejectPrice,
    getPriceHistory,
} from '../controllers/priceController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getPrices);
router.get('/latest/:cropId/:marketId', getLatestPrice);
router.get('/history/:cropId/:marketId', getPriceHistory);
router.post('/', createPrice);
router.patch('/:id/approve', protect, authorize('Admin'), approvePrice);
router.patch('/:id/reject', protect, authorize('Admin'), rejectPrice);

export default router;
