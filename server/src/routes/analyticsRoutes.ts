import { Router } from 'express';
import { getOverviewStats, getPriceTrends, getMarketComparison } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes (no auth — for farmer dashboard)
router.get('/public/trends', getPriceTrends);
router.get('/public/compare', getMarketComparison);

// Protected routes (require auth)
router.get('/overview', protect, getOverviewStats);
router.get('/dashboard', getOverviewStats);
router.get('/trends', protect, getPriceTrends);
router.get('/compare', protect, getMarketComparison);

export default router;
