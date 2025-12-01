/**
 * Auto Alerts Service
 * Monitors data thresholds and triggers notifications automatically
 */

import { triggerNotification, type NotificationData } from './notifications';
import type { SensorData } from '@/utils/sensorData';
import type { FloodRiskData } from '@/utils/floodPrediction';
import type { SafetyAlert } from '@/utils/safetyAlerts';
import { WATER_QUALITY_PARAMS } from '@/constants';

// Alert thresholds
export const ALERT_THRESHOLDS = {
  // pH threshold - alert when below minimum safe level
  pH_MIN: WATER_QUALITY_PARAMS.pH.min, // 6.5
  
  // Waste detection threshold - alert when above this level (0-100)
  WASTE_MAX: 50, // Alert when waste detection level > 50
  
  // Flood risk threshold - alert when risk level >= this (0-100)
  FLOOD_RISK_HIGH: 70, // Alert when flood risk >= 70
  
  // Safety alert severity - alert for these severities
  SAFETY_SEVERITIES: ['critical', 'high'] as const,
} as const;

// Track which alerts have been sent to avoid duplicates
interface AlertState {
  pHAlerts: Set<string>; // Sensor IDs that have triggered pH alerts
  wasteAlerts: Set<string>; // Sensor IDs that have triggered waste alerts
  floodAlertSent: boolean; // Whether flood alert has been sent
  safetyAlerts: Set<string>; // Safety alert IDs that have been notified
}

let alertState: AlertState = {
  pHAlerts: new Set(),
  wasteAlerts: new Set(),
  floodAlertSent: false,
  safetyAlerts: new Set(),
};

/**
 * Reset alert state (useful for testing or when conditions normalize)
 */
export function resetAlertState(): void {
  alertState = {
    pHAlerts: new Set(),
    wasteAlerts: new Set(),
    floodAlertSent: false,
    safetyAlerts: new Set(),
  };
}

/**
 * Check pH threshold and trigger alert if needed
 */
export async function checkpHThreshold(sensors: SensorData[]): Promise<void> {
  for (const sensor of sensors) {
    const pH = sensor.waterQuality.pH;
    const sensorId = sensor.id;
    
    // Check if pH is below threshold
    if (pH < ALERT_THRESHOLDS.pH_MIN) {
      // Only alert if we haven't already alerted for this sensor
      if (!alertState.pHAlerts.has(sensorId)) {
        await triggerNotification(
          'water_quality',
          {
            type: 'water_quality',
            severity: pH < 6.0 ? 'critical' : 'high',
            location: sensor.location,
            sensorId: sensor.id,
            sensorName: sensor.name,
            parameter: 'pH',
            value: pH,
          },
          {
            title: '⚠️ Low pH Alert',
            body: `pH level is critically low (${pH.toFixed(2)}) at ${sensor.name}. Water quality may be unsafe.`,
            priority: pH < 6.0 ? 'max' : 'high',
          }
        );
        
        // Mark this sensor as alerted
        alertState.pHAlerts.add(sensorId);
        console.log(`pH alert triggered for sensor: ${sensorId}`);
      }
    } else {
      // pH is back to normal, remove from alert set
      if (alertState.pHAlerts.has(sensorId)) {
        alertState.pHAlerts.delete(sensorId);
        console.log(`pH normalized for sensor: ${sensorId}`);
      }
    }
  }
}

/**
 * Check waste threshold and trigger alert if needed
 */
export async function checkWasteThreshold(sensors: SensorData[]): Promise<void> {
  for (const sensor of sensors) {
    const wasteLevel = sensor.waste.detectionLevel;
    const sensorId = sensor.id;
    
    // Check if waste level exceeds threshold
    if (wasteLevel > ALERT_THRESHOLDS.WASTE_MAX) {
      // Only alert if we haven't already alerted for this sensor
      if (!alertState.wasteAlerts.has(sensorId)) {
        const severity = wasteLevel > 80 ? 'critical' : wasteLevel > 65 ? 'high' : 'medium';
        
        await triggerNotification(
          'waste',
          {
            type: 'waste',
            severity,
            location: sensor.location,
            sensorId: sensor.id,
            sensorName: sensor.name,
            wasteLevel,
          },
          {
            title: '🗑️ High Waste Detection',
            body: `Waste level is high (${wasteLevel.toFixed(0)}%) at ${sensor.name}. Immediate cleanup may be required.`,
            priority: severity === 'critical' ? 'max' : 'high',
          }
        );
        
        // Mark this sensor as alerted
        alertState.wasteAlerts.add(sensorId);
        console.log(`Waste alert triggered for sensor: ${sensorId}`);
      }
    } else {
      // Waste level normalized, remove from alert set
      if (alertState.wasteAlerts.has(sensorId)) {
        alertState.wasteAlerts.delete(sensorId);
        console.log(`Waste level normalized for sensor: ${sensorId}`);
      }
    }
  }
}

/**
 * Check flood risk threshold and trigger alert if needed
 */
export async function checkFloodRisk(floodData: FloodRiskData | null): Promise<void> {
  if (!floodData) return;
  
  const riskLevel = floodData.currentRisk;
  
  // Check if flood risk is high
  if (riskLevel >= ALERT_THRESHOLDS.FLOOD_RISK_HIGH) {
    // Only alert if we haven't already sent a flood alert
    if (!alertState.floodAlertSent) {
      const severity = riskLevel >= 85 ? 'critical' : riskLevel >= 75 ? 'high' : 'medium';
      
      await triggerNotification(
        'flood',
        {
          type: 'flood',
          severity,
          riskLevel,
          maxRisk: floodData.maxRisk,
          status: floodData.status,
        },
        {
          title: '🌊 High Flood Risk Alert',
          body: `Flood risk level is ${riskLevel}%. ${riskLevel >= 85 ? 'Take immediate action.' : 'Monitor conditions closely.'}`,
          priority: 'max',
        }
      );
      
      alertState.floodAlertSent = true;
      console.log(`Flood alert triggered: ${riskLevel}%`);
    }
  } else {
    // Flood risk normalized, reset alert flag
    if (alertState.floodAlertSent) {
      alertState.floodAlertSent = false;
      console.log('Flood risk normalized');
    }
  }
}

/**
 * Check safety zone alerts and trigger notifications
 */
export async function checkSafetyAlerts(safetyAlerts: SafetyAlert[]): Promise<void> {
  for (const alert of safetyAlerts) {
    // Only alert for critical or high severity
    if (ALERT_THRESHOLDS.SAFETY_SEVERITIES.includes(alert.severity)) {
      // Only alert if we haven't already notified for this alert
      if (!alertState.safetyAlerts.has(alert.id)) {
        await triggerNotification(
          'safety',
          {
            type: 'safety',
            severity: alert.severity,
            alertId: alert.id,
            category: alert.category,
            locationName: alert.location,
          },
          {
            title: `🚨 ${alert.severity === 'critical' ? 'Critical' : 'High'} Safety Alert`,
            body: `${alert.title}${alert.location ? ` - ${alert.location}` : ''}`,
            priority: alert.severity === 'critical' ? 'max' : 'high',
          }
        );
        
        // Mark this alert as notified
        alertState.safetyAlerts.add(alert.id);
        console.log(`Safety alert triggered: ${alert.id}`);
      }
    }
  }
  
  // Clean up old alert IDs that are no longer in the list
  const currentAlertIds = new Set(safetyAlerts.map((a) => a.id));
  for (const alertId of alertState.safetyAlerts) {
    if (!currentAlertIds.has(alertId)) {
      alertState.safetyAlerts.delete(alertId);
    }
  }
}

/**
 * Check all thresholds and trigger alerts
 * Main function to call periodically
 */
export async function checkAllThresholds(data: {
  sensors: SensorData[];
  floodData: FloodRiskData | null;
  safetyAlerts: SafetyAlert[];
}): Promise<void> {
  try {
    // Check pH threshold
    await checkpHThreshold(data.sensors);
    
    // Check waste threshold
    await checkWasteThreshold(data.sensors);
    
    // Check flood risk
    await checkFloodRisk(data.floodData);
    
    // Check safety alerts
    await checkSafetyAlerts(data.safetyAlerts);
  } catch (error) {
    console.error('Error checking thresholds:', error);
  }
}

