import { Router } from 'express';
import { handleUSSD } from '../controllers/ussdController';
import { ussdLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', ussdLimiter, handleUSSD);

export default router;
