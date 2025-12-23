/**
 * Scheduled Jobs
 * Background tasks and cron jobs
 */

import cron from 'node-cron';
import { logger } from '../utils/logger';
import { startCameraMonitoring } from '../services/drowningDetectionService';

/**
 * Start all scheduled jobs
 */
export function startScheduledJobs(): void {
  logger.info('Starting scheduled jobs...');

  // Start AI drowning detection monitoring
  // This runs continuously in the background
  startCameraMonitoring().catch((error) => {
    logger.error('Error starting camera monitoring:', error);
  });

  // Example: Run health checks every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.info('Running scheduled health check...');
    // Add health check logic here
  });

  // Example: Cleanup old incidents every day at 2 AM
  cron.schedule('0 2 * * *', () => {
    logger.info('Running daily cleanup...');
    // Add cleanup logic here
  });

  logger.info('Scheduled jobs started');
}
