import { Router } from 'express';
import { processFrame } from '../controllers/crc.controller.js';

const router = Router();

router.post('/process', processFrame);

export default router;