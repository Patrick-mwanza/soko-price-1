import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRequired } from '../middleware/validate';

const router = Router();

router.post(
    '/register',
    authLimiter,
    validateRequired(['name', 'email', 'password']),
    register
);

router.post(
    '/login',
    authLimiter,
    validateRequired(['email', 'password']),
    login
);

router.get('/me', protect, getMe);

export default router;
