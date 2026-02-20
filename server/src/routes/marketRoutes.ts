import { Router } from 'express';
import { getMarkets, getMarket, createMarket, updateMarket, deleteMarket } from '../controllers/marketController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getMarkets);
router.get('/:id', getMarket);
router.post('/', protect, authorize('Admin'), createMarket);
router.put('/:id', protect, authorize('Admin'), updateMarket);
router.delete('/:id', protect, authorize('Admin'), deleteMarket);

export default router;
