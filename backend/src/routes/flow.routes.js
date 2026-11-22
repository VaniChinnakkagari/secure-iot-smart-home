import { Router } from 'express';
import { simulateSlidingWindow } from '../controllers/flow.controller.js';

const router = Router();

router.post('/simulate', simulateSlidingWindow);

export default router;