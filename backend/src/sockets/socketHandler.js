import { logger } from '../utils/logger.js';

export function initSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.emit('server:hello', {
      message: 'Secure IoT Smart Home realtime channel ready',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // Listen for a request to start the packet simulation
    let packetInterval = null;
    let simulationState = { running: false, speed: 1500, loss: 0.05 };

    socket.on('sim:start', (config) => {
      if (packetInterval) clearInterval(packetInterval);
      
      simulationState = { ...simulationState, ...config, running: true };
      logger.info(`Simulation started for socket ${socket.id}`);

      const protocols = ['TCP', 'UDP', 'MQTT', 'HTTP', 'DNS'];
      const ips = ['192.168.1.101', '192.168.1.102', '192.168.1.103', '10.0.0.1', '8.8.8.8'];

      packetInterval = setInterval(() => {
        if (!simulationState.running) return;

        const isCorrupted = Math.random() < simulationState.loss;
        
        const packet = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          source: ips[Math.floor(Math.random() * ips.length)],
          dest: ips[Math.floor(Math.random() * ips.length)],
          protocol: protocols[Math.floor(Math.random() * protocols.length)],
          length: Math.floor(Math.random() * 1000) + 64,
          status: isCorrupted ? 'corrupted' : 'ok'
        };

        // Send the packet to the frontend
        socket.emit('sim:packet', packet);
      }, simulationState.speed);
    });

    socket.on('sim:pause', () => {
      simulationState.running = false;
      logger.info(`Simulation paused for socket ${socket.id}`);
    });

    socket.on('sim:resume', () => {
      simulationState.running = true;
      logger.info(`Simulation resumed for socket ${socket.id}`);
    });

    socket.on('sim:stop', () => {
      if (packetInterval) clearInterval(packetInterval);
      simulationState.running = false;
      logger.info(`Simulation stopped for socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      if (packetInterval) clearInterval(packetInterval);
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}