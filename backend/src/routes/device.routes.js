import { Router } from 'express';
import { getAllDevices, addDevice, deleteDevice, updateDeviceStatus } from '../controllers/device.controller.js';

const router = Router();

router.get('/', getAllDevices);
router.post('/', addDevice);
router.delete('/:id', deleteDevice);
router.put('/:id/status', updateDeviceStatus);

export default router;