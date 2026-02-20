import { Router } from 'express';
import { getCrops, getCrop, createCrop, updateCrop, deleteCrop } from '../controllers/cropController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getCrops);
router.get('/:id', getCrop);
router.post('/', protect, authorize('Admin'), createCrop);
router.put('/:id', protect, authorize('Admin'), updateCrop);
router.delete('/:id', protect, authorize('Admin'), deleteCrop);

export default router;
