import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  firebaseServiceAccount: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  corsOrigin: string[];
  firebaseProjectId: string;
  firebasePrivateKey: string;
  firebaseClientEmail: string;
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsS3Bucket: string;
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  googleMapsApiKey: string;
  weatherApiKey: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
  logFilePath: string;
  iotMqttBroker: string;
  iotMqttUsername: string;
  iotMqttPassword: string;
  alertThresholds: {
    phMin: number;
    phMax: number;
    doMin: number;
    bodMax: number;
    turbidityMax: number;
    temperatureMax: number;
  };
  cleanupOldReportsDays: number;
  cleanupOldAlertsDays: number;
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8081'],
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || './logs',
  iotMqttBroker: process.env.IOT_MQTT_BROKER || 'mqtt://localhost:1883',
  iotMqttUsername: process.env.IOT_MQTT_USERNAME || '',
  iotMqttPassword: process.env.IOT_MQTT_PASSWORD || '',
  alertThresholds: {
    phMin: parseFloat(process.env.ALERT_PH_MIN || '6.5'),
    phMax: parseFloat(process.env.ALERT_PH_MAX || '8.5'),
    doMin: parseFloat(process.env.ALERT_DO_MIN || '4.0'),
    bodMax: parseFloat(process.env.ALERT_BOD_MAX || '5.0'),
    turbidityMax: parseFloat(process.env.ALERT_TURBIDITY_MAX || '5.0'),
    temperatureMax: parseFloat(process.env.ALERT_TEMPERATURE_MAX || '30.0'),
  },
  cleanupOldReportsDays: parseInt(process.env.CLEANUP_OLD_REPORTS_DAYS || '90', 10),
  cleanupOldAlertsDays: parseInt(process.env.CLEANUP_OLD_ALERTS_DAYS || '30', 10),
};
