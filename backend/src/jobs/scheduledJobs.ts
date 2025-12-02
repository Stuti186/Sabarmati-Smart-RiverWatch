import cron from 'node-cron';
import { logger } from '../utils/logger';
import { getFirestore } from '../config/firebase';
import { config } from '../config/config';

const db = () => getFirestore();

export const startScheduledJobs = (): void => {
  logger.info('Starting scheduled jobs...');

  // Check for expired alerts every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const alertsSnapshot = await db()
        .collection('alerts')
        .where('status', '==', 'active')
        .get();

      let expiredCount = 0;
      const now = new Date();

      for (const doc of alertsSnapshot.docs) {
        const alertData = doc.data();
        const expiresAt = alertData.expiresAt?.toDate?.() || null;
        
        if (expiresAt && expiresAt <= now) {
          await doc.ref.update({
            status: 'expired',
            updatedAt: new Date(),
          });
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        logger.info(`Expired ${expiredCount} alerts`);
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

      const reportsSnapshot = await db()
        .collection('reports')
        .where('status', 'in', ['resolved', 'rejected'])
        .get();

      let deletedCount = 0;

      for (const doc of reportsSnapshot.docs) {
        const reportData = doc.data();
        const createdAt = reportData.createdAt?.toDate?.() || new Date(reportData.createdAt);
        
        if (createdAt < cutoffDate) {
          await doc.ref.delete();
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old reports`);
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

      const alertsSnapshot = await db()
        .collection('alerts')
        .where('status', 'in', ['resolved', 'expired'])
        .get();

      let deletedCount = 0;

      for (const doc of alertsSnapshot.docs) {
        const alertData = doc.data();
        const createdAt = alertData.createdAt?.toDate?.() || new Date(alertData.createdAt);
        
        if (createdAt < cutoffDate) {
          await doc.ref.delete();
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old alerts`);
      }
    } catch (error) {
      logger.error('Error cleaning up old alerts:', error);
    }
  });

  logger.info('✅ Scheduled jobs started');
};
