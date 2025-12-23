/**
 * BiodiversityHomeScreen
 * Modern premium biodiversity dashboard with ecological health score
 * 2025 Design System
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  getSeasonalMigrationEvents,
  getStatusColor,
  getStatusGradient,
} from '@/utils/biodiversity';
import { biodiversityApi, type EcologicalHealthScore, type WildlifeSighting } from '@/services/biodiversityApi';
import { checkBackendHealth, getHealthStatus } from '@/services/backendHealth';
import { startAutoSync } from '@/services/offlineSync';
import Snackbar from '@/components/ui/Snackbar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// Modern Color Palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#1E3A8A',
  headerGradientStart: '#38BDF8',
  headerGradientEnd: '#2563EB',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#EF4444',
};

export default function BiodiversityHomeScreen() {
  const router = useRouter();
  const [healthScore, setHealthScore] = useState<EcologicalHealthScore | null>(null);
  const [sightings, setSightings] = useState<WildlifeSighting[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [seasonalEvents] = useState(getSeasonalMigrationEvents());
  const placeholderImage = 'https://placehold.co/400x300?text=No+Image';

  useEffect(() => {
    initializeData();
    
    // Start auto-sync for queued sightings
    const cleanup = startAutoSync(30000); // Check every 30 seconds
    
    return cleanup;
  }, []);

  const initializeData = async () => {
    // Check backend health first
    const health = await getHealthStatus();
    setIsOffline(!health.isOnline);
    
    if (!health.isOnline) {
      setShowSnackbar(true);
    }
    
    await loadData();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data (will use offline fallback if backend is down)
      const [healthData, sightingsData] = await Promise.all([
        biodiversityApi.getEcologicalHealthScore(),
        biodiversityApi.getSightings(6, 0),
      ]);
      
      setHealthScore(healthData.data);
      setSightings(sightingsData.data || []);
      
      // Check if data is offline
      if (healthData.offline || sightingsData.offline) {
        setIsOffline(true);
        if (!showSnackbar) {
          setShowSnackbar(true);
        }
      } else {
        setIsOffline(false);
        setShowSnackbar(false);
      }
    } catch (error: any) {
      console.error('Error loading biodiversity data:', error);
      setIsOffline(true);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setShowSnackbar(false);
    const health = await checkBackendHealth();
    setIsOffline(!health.isOnline);
    await loadData();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'catalog',
      title: 'Species Catalog',
      icon: 'library-outline' as const,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      route: '/(tabs)/biodiversity/species-catalog',
    },
    {
      id: 'submit',
      title: 'Submit Sighting',
      icon: 'camera-outline' as const,
      color: '#22C55E',
      bgColor: '#DCFCE7',
      route: '/(tabs)/biodiversity/submit-sighting',
    },
    {
      id: 'ai',
      title: 'AI Identify',
      icon: 'sparkles-outline' as const,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      route: '/(tabs)/biodiversity/ai-identification',
    },
    {
      id: 'migration',
      title: 'Migration Map',
      icon: 'map-outline' as const,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      route: '/(tabs)/biodiversity/migration-map',
    },
    {
      id: 'invasive',
      title: 'Invasive Alerts',
      icon: 'warning-outline' as const,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      route: '/(tabs)/biodiversity/invasive-alerts',
    },
    {
      id: 'trends',
      title: 'Biodiversity Trends',
      icon: 'trending-up-outline' as const,
      color: '#06B6D4',
      bgColor: '#CFFAFE',
      route: '/(tabs)/biodiversity/species-catalog', // Placeholder
    },
  ];


  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.textWhite}
            />
          }
          showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
            <Text style={styles.headerTitle}>Biodiversity</Text>
            <Text style={styles.headerSubtitle}>Ecosystem Health Monitoring</Text>
          </Animated.View>

          {/* Ecological Health Score Card */}
          {healthScore && (
            <Animated.View entering={FadeInUp.duration(500).delay(200)}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/biodiversity/species-catalog')}
                style={styles.healthScoreCard}>
                <LinearGradient
                  colors={getStatusGradient(healthScore.status)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.healthScoreGradient}>
                  <View style={styles.healthScoreHeader}>
                    <Ionicons name="leaf" size={28} color={COLORS.white} />
                    <Text style={styles.healthScoreLabel}>Ecosystem Health</Text>
                  </View>
                  <View style={styles.healthScoreValueContainer}>
                    <Text style={styles.healthScoreValue}>{healthScore.score}</Text>
                    <Text style={styles.healthScoreMax}>/ 100</Text>
                  </View>
                  <View style={styles.healthScoreStatusContainer}>
                    <View style={[styles.healthScoreStatusDot, { backgroundColor: COLORS.white }]} />
                    <Text style={styles.healthScoreStatusText}>
                      {healthScore.status === 'healthy' ? 'Healthy' : healthScore.status === 'moderate' ? 'Moderate' : 'Declining'}
                    </Text>
                  </View>
                  
                  {/* Water Quality Correlation - Problem Statement Integration */}
                  {healthScore.waterQualityCorrelation && (
                    <View style={styles.waterQualityCorrelation}>
                      <View style={styles.correlationHeader}>
                        <Ionicons name="water" size={16} color={COLORS.white} />
                        <Text style={styles.correlationLabel}>Water Quality Impact</Text>
                      </View>
                      <Text style={styles.correlationScore}>
                        {Math.round(healthScore.waterQualityCorrelation.score)}/100
                      </Text>
                      <Text style={styles.correlationImpact}>
                        {healthScore.waterQualityCorrelation.impact}
                      </Text>
                    </View>
                  )}

                  <View style={styles.healthScoreFactors}>
                    <View style={styles.factorItem}>
                      <Text style={styles.factorLabel}>Diversity</Text>
                      <Text style={styles.factorValue}>{healthScore.factors.speciesDiversity}</Text>
                    </View>
                    <View style={styles.factorItem}>
                      <Text style={styles.factorLabel}>Population</Text>
                      <Text style={styles.factorValue}>{healthScore.factors.populationHealth}</Text>
                    </View>
                    <View style={styles.factorItem}>
                      <Text style={styles.factorLabel}>Habitat</Text>
                      <Text style={styles.factorValue}>{healthScore.factors.habitatQuality}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {loading && !healthScore && (
            <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading ecosystem health data...</Text>
            </Animated.View>
          )}

          {/* Quick Actions Grid */}
          <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(action.route as any)}
                  style={styles.quickActionCard}>
                  <View style={[styles.quickActionIconContainer, { backgroundColor: action.bgColor }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Seasonal Updates Banner */}
          {seasonalEvents.length > 0 && (
            <Animated.View entering={FadeInUp.duration(500).delay(400)}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/biodiversity/migration-map')}
                style={styles.seasonalBanner}>
                <LinearGradient
                  colors={['#FDE047', '#FACC15']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.seasonalBannerGradient}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.textPrimary} />
                  <View style={styles.seasonalBannerContent}>
                    <Text style={styles.seasonalBannerTitle}>Seasonal Migration</Text>
                    <Text style={styles.seasonalBannerText}>
                      {seasonalEvents[0].species} - {seasonalEvents[0].month}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Recent Wildlife Sightings */}
          <Animated.View entering={FadeInUp.duration(500).delay(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sightings</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/biodiversity/submit-sighting')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sightingsScroll}>
              {sightings.map((sighting, index) => (
                <TouchableOpacity
                  key={sighting.id}
                  activeOpacity={0.8}
                  style={styles.sightingCard}>
                  {!!sighting.image && sighting.image.trim().length > 0 ? (
                    <Image source={{ uri: sighting.image }} style={styles.sightingImage} />
                  ) : (
                    <Image source={{ uri: placeholderImage }} style={styles.sightingImage} />
                  )}
                  <View style={styles.sightingContent}>
                    <Text style={styles.sightingSpecies} numberOfLines={1}>
                      {sighting.speciesName || 'Unknown Species'}
                    </Text>
                    <View style={styles.sightingMeta}>
                      <View style={styles.sightingBadge}>
                        <Ionicons
                          name={sighting.verified ? 'checkmark-circle' : 'person-circle-outline'}
                          size={12}
                          color={sighting.verified ? COLORS.success : COLORS.textMuted}
                        />
                        <Text style={styles.sightingBadgeText}>
                          {sighting.verified ? 'Verified' : 'Citizen'}
                        </Text>
                      </View>
                      <Text style={styles.sightingTime}>
                        {Math.floor((Date.now() - sighting.timestamp.getTime()) / (1000 * 60 * 60))}h ago
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        {/* Offline Mode Snackbar */}
        <Snackbar
          visible={showSnackbar && isOffline}
          message="Using offline data — live Sabarmati insights unavailable."
          type="warning"
          action={{
            label: 'Retry',
            onPress: handleRetry,
          }}
          onDismiss={() => setShowSnackbar(false)}
          duration={0} // Don't auto-dismiss
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  healthScoreCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  healthScoreGradient: {
    padding: 24,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  healthScoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  healthScoreValue: {
    fontSize: 56,
    fontWeight: '700',
    color: COLORS.white,
  },
  healthScoreMax: {
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  healthScoreStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  healthScoreStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  healthScoreStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  healthScoreFactors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  factorItem: {
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  factorValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  seasonalBanner: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  seasonalBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  seasonalBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  seasonalBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  seasonalBannerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sightingsScroll: {
    paddingRight: 20,
  },
  sightingCard: {
    width: 160,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sightingImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.textMuted,
  },
  sightingContent: {
    padding: 12,
  },
  sightingSpecies: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  sightingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sightingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sightingBadgeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  sightingTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bottomSpacer: {
    height: 20,
  },
  waterQualityCorrelation: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  correlationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
  },
  correlationScore: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  correlationImpact: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

