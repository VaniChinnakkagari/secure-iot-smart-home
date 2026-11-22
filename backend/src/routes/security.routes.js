import { Router } from 'express';
import { getAlerts, resolveAlert } from '../controllers/security.controller.js';

const router = Router();

router.get('/alerts', getAlerts);
router.put('/alerts/:id/resolve', resolveAlert);

export default router;