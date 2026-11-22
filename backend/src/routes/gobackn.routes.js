import { Router } from 'express';
import { simulateGoBackN } from '../controllers/gobackn.controller.js';

const router = Router();

router.post('/simulate', simulateGoBackN);

export default router;