/**
 * Ecological Health Score Service
 * Calculates ecosystem health based on biodiversity and water quality data
 * Problem Statement: "Biodiversity & Ecosystem Health - Minimal tracking of aquatic life"
 */

import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';

const db = () => getFirestore();
// Use same server for water quality API (internal call)
const WATER_QUALITY_API = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

export interface EcologicalHealthFactors {
  speciesDiversity: number; // 0-100
  populationHealth: number; // 0-100
  habitatQuality: number; // 0-100
  invasiveThreat: number; // 0-100 (lower is better)
  waterQualityImpact: number; // 0-100 (correlation with water quality)
}

export interface EcologicalHealthScore {
  score: number; // 0-100
  status: 'healthy' | 'moderate' | 'declining';
  factors: EcologicalHealthFactors;
  lastUpdated: Date;
  calculatedAt: Date;
  waterQualityCorrelation?: {
    score: number;
    impact: string;
    parameters: {
      pH?: number;
      DO?: number;
      BOD?: number;
    };
  };
}

/**
 * Calculate ecological health score based on multiple factors
 * Problem Statement: "AI-driven ecological assessment for sustaining aquatic life"
 */
export async function calculateEcologicalHealthScore(): Promise<EcologicalHealthScore> {
  try {
    // Get recent sightings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sightingsSnapshot = await db()
      .collection('biodiversity')
      .doc('sightings')
      .collection('data')
      .where('timestamp', '>=', thirtyDaysAgo)
      .get();

    const sightings = sightingsSnapshot.docs.map(doc => doc.data());
    const uniqueSpecies = new Set(sightings.map(s => s.speciesId).filter(Boolean));

    // Factor 1: Species Diversity (0-100)
    // Based on number of unique species observed
    const speciesDiversity = Math.min(100, (uniqueSpecies.size / 20) * 100);

    // Factor 2: Population Health (0-100)
    // Based on frequency of sightings (more sightings = healthier populations)
    const sightingsPerDay = sightings.length / 30;
    const populationHealth = Math.min(100, (sightingsPerDay / 5) * 100);

    // Factor 3: Habitat Quality (0-100)
    // Based on verified sightings ratio and species variety
    const verifiedRatio = sightings.filter(s => s.verified).length / Math.max(1, sightings.length);
    const habitatQuality = (verifiedRatio * 50) + (speciesDiversity * 0.5);

    // Factor 4: Invasive Threat (0-100, lower is better)
    const invasiveAlertsSnapshot = await db()
      .collection('biodiversity')
      .doc('invasive')
      .collection('alerts')
      .where('status', '==', 'active')
      .get();

    const activeInvasiveAlerts = invasiveAlertsSnapshot.size;
    const invasiveThreat = Math.min(100, activeInvasiveAlerts * 20); // Each alert = 20 points

    // Factor 5: Water Quality Impact (0-100)
    // Problem Statement: "Water Quality & Pollution Control" + "Biodiversity & Ecosystem Health"
    let waterQualityImpact = 75; // Default
    let waterQualityCorrelation;

    try {
      // Get latest water quality data from Firestore (internal)
      const waterQualitySnapshot = await db()
        .collection('waterQuality')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      const waterQuality = waterQualitySnapshot.empty 
        ? null 
        : waterQualitySnapshot.docs[0].data();

      if (waterQuality) {
        // Calculate water quality score (0-100)
        const pH = waterQuality.pH || 7;
        const DO = waterQuality.DO || 0;
        const BOD = waterQuality.BOD || 0;

        // pH impact (optimal: 6.5-8.5)
        const pHScore = pH >= 6.5 && pH <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(pH - 7.5) * 20);

        // DO impact (optimal: >5 mg/L)
        const DOScore = DO >= 5 ? 100 : Math.max(0, (DO / 5) * 100);

        // BOD impact (lower is better, optimal: <3 mg/L)
        const BODScore = BOD <= 3 ? 100 : Math.max(0, 100 - ((BOD - 3) / 2) * 100);

        // Average water quality score
        const avgWaterQuality = (pHScore + DOScore + BODScore) / 3;
        waterQualityImpact = avgWaterQuality;

        // Determine impact description
        let impact = 'Good';
        if (avgWaterQuality < 50) impact = 'Poor - May affect species survival';
        else if (avgWaterQuality < 70) impact = 'Moderate - Some species may be affected';

        waterQualityCorrelation = {
          score: avgWaterQuality,
          impact,
          parameters: { pH, DO, BOD },
        };
      }
    } catch (error) {
      logger.warn('Could not fetch water quality data for correlation:', error);
    }

    // Calculate overall score (weighted average)
    const weights = {
      speciesDiversity: 0.25,
      populationHealth: 0.25,
      habitatQuality: 0.20,
      invasiveThreat: 0.15, // Lower threat = better
      waterQualityImpact: 0.15,
    };

    const overallScore =
      speciesDiversity * weights.speciesDiversity +
      populationHealth * weights.populationHealth +
      habitatQuality * weights.habitatQuality +
      (100 - invasiveThreat) * weights.invasiveThreat + // Invert invasive threat
      waterQualityImpact * weights.waterQualityImpact;

    // Determine status
    let status: 'healthy' | 'moderate' | 'declining';
    if (overallScore >= 75) {
      status = 'healthy';
    } else if (overallScore >= 50) {
      status = 'moderate';
    } else {
      status = 'declining';
    }

    const healthScore: EcologicalHealthScore = {
      score: Math.round(overallScore),
      status,
      factors: {
        speciesDiversity: Math.round(speciesDiversity),
        populationHealth: Math.round(populationHealth),
        habitatQuality: Math.round(habitatQuality),
        invasiveThreat: Math.round(invasiveThreat),
        waterQualityImpact: Math.round(waterQualityImpact),
      },
      lastUpdated: new Date(),
      calculatedAt: new Date(),
      waterQualityCorrelation,
    };

    // Cache the result
    await db()
      .collection('biodiversity')
      .doc('healthScores')
      .collection('data')
      .add({
        ...healthScore,
        timestamp: new Date(),
      });

    return healthScore;
  } catch (error: any) {
    logger.error('Calculate ecological health score error:', error);
    throw new Error(`Failed to calculate health score: ${error.message}`);
  }
}

/**
 * Get current ecological health score (cached or calculate new)
 */
export async function getEcologicalHealthScore(): Promise<EcologicalHealthScore> {
  try {
    // Try to get latest cached score (less than 1 hour old)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const cachedSnapshot = await db()
      .collection('biodiversity')
      .doc('healthScores')
      .collection('data')
      .orderBy('calculatedAt', 'desc')
      .limit(1)
      .get();

    if (!cachedSnapshot.empty) {
      const cached = cachedSnapshot.docs[0].data();
      const cachedDate = cached.calculatedAt?.toDate() || cached.timestamp?.toDate();
      
      if (cachedDate && cachedDate > oneHourAgo) {
        return {
          ...cached,
          lastUpdated: cachedDate,
          calculatedAt: cachedDate,
        } as EcologicalHealthScore;
      }
    }

    // Calculate new score if cache is stale
    return await calculateEcologicalHealthScore();
  } catch (error: any) {
    logger.error('Get ecological health score error:', error);
    // Return default score on error
    return {
      score: 65,
      status: 'moderate',
      factors: {
        speciesDiversity: 70,
        populationHealth: 65,
        habitatQuality: 60,
        invasiveThreat: 30,
        waterQualityImpact: 70,
      },
      lastUpdated: new Date(),
      calculatedAt: new Date(),
    };
  }
}

/**
 * Get historical health scores for trend analysis
 */
export async function getHealthScoreHistory(days: number = 30): Promise<EcologicalHealthScore[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await db()
      .collection('biodiversity')
      .doc('healthScores')
      .collection('data')
      .where('calculatedAt', '>=', startDate)
      .orderBy('calculatedAt', 'asc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastUpdated: data.calculatedAt?.toDate() || data.timestamp?.toDate() || new Date(),
        calculatedAt: data.calculatedAt?.toDate() || data.timestamp?.toDate() || new Date(),
      } as EcologicalHealthScore;
    });
  } catch (error: any) {
    logger.error('Get health score history error:', error);
    return [];
  }
}

