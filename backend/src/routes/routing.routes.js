import { Router } from 'express';
import { getTopology, calculateRoute } from '../controllers/routing.controller.js';

const router = Router();

router.get('/topology', getTopology);
router.post('/calculate', calculateRoute);

export default router;