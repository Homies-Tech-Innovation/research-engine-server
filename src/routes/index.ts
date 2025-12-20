import { Router } from 'express';

// Route imports
import healthRouter from '@/module/health/index.route';

const router = Router();

// Health endpoint
router.use('/health', healthRouter);

// Routes
//

export default router;
