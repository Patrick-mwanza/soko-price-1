import { Router } from 'express';
import { getAlerts, createAlert, deactivateAlert, deleteAlert } from '../controllers/alertController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getAlerts);
router.post('/', protect, createAlert);
router.patch('/:id/deactivate', protect, deactivateAlert);
router.delete('/:id', protect, deleteAlert);

export default router;
