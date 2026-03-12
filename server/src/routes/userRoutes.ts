import { Router } from 'express';
import { getUsers, deleteUser, bulkDeleteUsers } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(protect, authorize('Admin'));

router.get('/', getUsers);
router.delete('/bulk', bulkDeleteUsers);
router.delete('/:id', deleteUser);

export default router;
