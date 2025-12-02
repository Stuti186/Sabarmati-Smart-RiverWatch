import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface AuthSocket extends Socket {
  userId?: string;
}

export const initializeSocketHandlers = (io: SocketIOServer): void => {
  // Authentication middleware for Socket.IO
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Subscribe to sensor updates
    socket.on('subscribe:sensor', (sensorId: string) => {
      socket.join(`sensor:${sensorId}`);
      logger.info(`User ${socket.userId} subscribed to sensor ${sensorId}`);
    });

    // Unsubscribe from sensor updates
    socket.on('unsubscribe:sensor', (sensorId: string) => {
      socket.leave(`sensor:${sensorId}`);
      logger.info(`User ${socket.userId} unsubscribed from sensor ${sensorId}`);
    });

    // Subscribe to location-based updates
    socket.on('subscribe:location', (data: { lat: number; lng: number; radius: number }) => {
      const locationRoom = `location:${data.lat.toFixed(2)},${data.lng.toFixed(2)}`;
      socket.join(locationRoom);
      logger.info(`User ${socket.userId} subscribed to location ${locationRoom}`);
    });

    // Subscribe to alerts
    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
      logger.info(`User ${socket.userId} subscribed to alerts`);
    });

    // Unsubscribe from alerts
    socket.on('unsubscribe:alerts', () => {
      socket.leave('alerts');
      logger.info(`User ${socket.userId} unsubscribed from alerts`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  // Expose emitter functions
  global.socketIO = {
    // Emit sensor update
    emitSensorUpdate: (sensorId: string, data: any) => {
      io.to(`sensor:${sensorId}`).emit('sensor:update', data);
    },

    // Emit alert
    emitAlert: (alert: any) => {
      io.to('alerts').emit('alert:new', alert);
      
      // Also emit to specific users if recipients are specified
      if (alert.recipients && alert.recipients.length > 0) {
        alert.recipients.forEach((userId: string) => {
          io.to(`user:${userId}`).emit('alert:new', alert);
        });
      }
    },

    // Emit report update
    emitReportUpdate: (userId: string, report: any) => {
      io.to(`user:${userId}`).emit('report:update', report);
    },

    // Emit water quality update
    emitWaterQualityUpdate: (data: any) => {
      io.emit('water_quality:update', data);
    },

    // Emit unsafe zone update
    emitUnsafeZoneUpdate: (zone: any) => {
      io.emit('unsafe_zone:update', zone);
    },

    // Emit waste hotspot update
    emitWasteHotspotUpdate: (hotspot: any) => {
      io.emit('waste_hotspot:update', hotspot);
    },

    // Emit volunteer event update
    emitVolunteerEventUpdate: (event: any) => {
      io.emit('volunteer_event:update', event);
    },
  };
};

// Global socket type declaration
declare global {
  var socketIO: {
    emitSensorUpdate: (sensorId: string, data: any) => void;
    emitAlert: (alert: any) => void;
    emitReportUpdate: (userId: string, report: any) => void;
    emitWaterQualityUpdate: (data: any) => void;
    emitUnsafeZoneUpdate: (zone: any) => void;
    emitWasteHotspotUpdate: (hotspot: any) => void;
    emitVolunteerEventUpdate: (event: any) => void;
  };
}
