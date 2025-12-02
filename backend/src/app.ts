import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes';
import sensorRoutes from './routes/sensor.routes';
import waterQualityRoutes from './routes/waterQuality.routes';
import unsafeZoneRoutes from './routes/unsafeZone.routes';
import wasteHotspotRoutes from './routes/wasteHotspot.routes';
import reportRoutes from './routes/report.routes';
import alertRoutes from './routes/alert.routes';
import userRoutes from './routes/user.routes';
import rewardRoutes from './routes/reward.routes';
import volunteerRoutes from './routes/volunteer.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Config
import { config } from './config/config';
import { logger } from './utils/logger';

// Socket handlers
import { initializeSocketHandlers } from './sockets/socketHandlers';

export class App {
  public app: Application;
  public httpServer;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.connectDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocketHandlers();
    this.initializeErrorHandling();
  }

  private async connectDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info('✅ MongoDB connected successfully');
    } catch (error) {
      logger.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
    }));

    // Compression
    this.app.use(compression());

    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
      }));
    }

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Rate limiting
    this.app.use('/api/', rateLimiter);

    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
      });
    });
  }

  private initializeRoutes(): void {
    const apiPrefix = '/api/v1';

    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/sensors`, sensorRoutes);
    this.app.use(`${apiPrefix}/water-quality`, waterQualityRoutes);
    this.app.use(`${apiPrefix}/unsafe-zones`, unsafeZoneRoutes);
    this.app.use(`${apiPrefix}/waste-hotspots`, wasteHotspotRoutes);
    this.app.use(`${apiPrefix}/reports`, reportRoutes);
    this.app.use(`${apiPrefix}/alerts`, alertRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/rewards`, rewardRoutes);
    this.app.use(`${apiPrefix}/volunteers`, volunteerRoutes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Smart River Watch API',
        version: '1.0.0',
        documentation: '/api/docs',
      });
    });
  }

  private initializeSocketHandlers(): void {
    initializeSocketHandlers(this.io);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.httpServer.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`📡 WebSocket server ready`);
    });
  }
}
