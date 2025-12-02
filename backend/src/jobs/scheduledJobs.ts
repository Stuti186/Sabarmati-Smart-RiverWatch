import cron from 'node-cron';
import { logger } from '../utils/logger';
import { Alert } from '../models/Alert.model';
import { Report } from '../models/Report.model';
import { config } from '../config/config';

export const startScheduledJobs = (): void => {
  logger.info('Starting scheduled jobs...');

  // Check for expired alerts every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const expiredAlerts = await Alert.updateMany(
        {
          status: 'active',
          expiresAt: { $lte: new Date() },
        },
        {
          status: 'expired',
        }
      );

      if (expiredAlerts.modifiedCount > 0) {
        logger.info(`Expired ${expiredAlerts.modifiedCount} alerts`);
      }
    } catch (error) {
      logger.error('Error expiring alerts:', error);
    }
  });

  // Clean up old reports (every day at 2 AM)
  cron.schedule('0 2 * * *', async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.cleanupOldReportsDays);

      const deletedReports = await Report.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['resolved', 'rejected'] },
      });

      if (deletedReports.deletedCount > 0) {
        logger.info(`Cleaned up ${deletedReports.deletedCount} old reports`);
      }
    } catch (error) {
      logger.error('Error cleaning up old reports:', error);
    }
  });

  // Clean up old alerts (every day at 3 AM)
  cron.schedule('0 3 * * *', async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.cleanupOldAlertsDays);

      const deletedAlerts = await Alert.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['resolved', 'expired'] },
      });

      if (deletedAlerts.deletedCount > 0) {
        logger.info(`Cleaned up ${deletedAlerts.deletedCount} old alerts`);
      }
    } catch (error) {
      logger.error('Error cleaning up old alerts:', error);
    }
  });

  logger.info('✅ Scheduled jobs started');
};
