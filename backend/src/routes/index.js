import { Router } from 'express';
import healthRoutes from './health.routes.js';
import deviceRoutes from './device.routes.js';
import crcRoutes from './crc.routes.js';
import flowRoutes from './flow.routes.js';
import gobacknRoutes from './gobackn.routes.js';
import routingRoutes from './routing.routes.js';
import dashboardRoutes from './dashboard.routes.js'; // <-- MUST BE HERE
import securityRoutes from './security.routes.js';
const router = Router();

router.use('/health', healthRoutes);
router.use('/devices', deviceRoutes);
router.use('/crc', crcRoutes);
router.use('/flow', flowRoutes);
router.use('/gobackn', gobacknRoutes);
router.use('/routing', routingRoutes);
router.use('/dashboard', dashboardRoutes); // <-- MUST BE HERE
router.use('/security', securityRoutes);
export default router;