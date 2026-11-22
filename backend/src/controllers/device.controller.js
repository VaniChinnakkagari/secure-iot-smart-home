import { query } from '../database/pool.js';
import { logger } from '../utils/logger.js';

// GET all devices
export async function getAllDevices(req, res, next) {
  try {
    const devices = await query('SELECT * FROM iot_devices ORDER BY id DESC');
    res.json({ success: true, count: devices.length, data: devices });
  } catch (err) {
    logger.error(`Failed to get devices: ${err.message}`);
    next(err);
  }
}

// POST add a new device
export async function addDevice(req, res, next) {
  try {
    const { name, device_type, ip_address, mac_address, room, status } = req.body;

    if (!name || !device_type || !ip_address || !mac_address) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields', status: 400 },
      });
    }

    const result = await query(
      `INSERT INTO iot_devices 
        (device_uid, name, device_type, ip_address, mac_address, room, status, is_encrypted) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1)`,
      [name, device_type, ip_address, mac_address, room || 'Unknown', status || 'offline']
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, message: 'Device added successfully' },
    });
  } catch (err) {
    logger.error(`Failed to add device: ${err.message}`);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: { message: 'IP or MAC address already exists', status: 409 },
      });
    }
    next(err);
  }
}

// DELETE a device
export async function deleteDevice(req, res, next) {
  try {
    const { id } = req.params;
    await query('DELETE FROM iot_devices WHERE id = ?', [id]);
    res.json({ success: true, data: { message: 'Device deleted' } });
  } catch (err) {
    logger.error(`Failed to delete device: ${err.message}`);
    next(err);
  }
}

// UPDATE Device Status
export async function updateDeviceStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: "Invalid status" } });
    }

    await query('UPDATE iot_devices SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, data: { message: 'Status updated' } });
  } catch (err) {
    next(err);
  }
}