import { Router } from 'express';
import { getOverviewStats, getPriceTrends, getMarketComparison } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/overview', protect, getOverviewStats);
router.get('/trends', protect, getPriceTrends);
router.get('/compare', protect, getMarketComparison);

export default router;
