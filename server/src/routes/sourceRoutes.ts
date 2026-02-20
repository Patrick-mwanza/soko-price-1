import { Router } from 'express';
import { getSources, getSource, createSource, updateSource, getSourceByPhone } from '../controllers/sourceController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, authorize('Admin'), getSources);
router.get('/:id', protect, authorize('Admin'), getSource);
router.get('/phone/:phone', protect, authorize('Admin'), getSourceByPhone);
router.post('/', protect, authorize('Admin'), createSource);
router.put('/:id', protect, authorize('Admin'), updateSource);

export default router;
