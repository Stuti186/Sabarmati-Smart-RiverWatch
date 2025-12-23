/**
 * InvasiveAlertsScreen
 * List of invasive species alerts with impact details
 */

import React, { Fragment, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { generateInvasiveAlerts, type InvasiveAlert } from '@/utils/biodiversity';
import { biodiversityApi } from '@/services/biodiversityApi';
import { getDefaultInvasiveAlerts } from '@/services/offlineData';
import Snackbar from '@/components/ui/Snackbar';
import { MAP_CONFIG } from '@/constants';

const { width } = Dimensions.get('window');

const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#1E3A8A',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  shadowColor: '#1E3A8A',
  danger: '#EF4444',
  warning: '#FACC15',
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'critical':
      return '#DC2626';
    case 'high':
      return '#EF4444';
    case 'moderate':
      return '#FACC15';
    case 'low':
      return '#F59E0B';
    default:
      return '#94A3B8';
  }
};

const getLevelGradient = (level: string) => {
  switch (level) {
    case 'critical':
      return ['#DC2626', '#B91C1C'];
    case 'high':
      return ['#EF4444', '#DC2626'];
    case 'moderate':
      return ['#FACC15', '#EAB308'];
    case 'low':
      return ['#F59E0B', '#D97706'];
    default:
      return ['#94A3B8', '#64748B'];
  }
};

export default function InvasiveAlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<InvasiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const placeholderImage = 'https://placehold.co/400x300?text=No+Image';

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const result = await biodiversityApi.getInvasiveAlerts();
      setAlerts(result.data || []);
      setIsOffline(result.offline || false);
    } catch (error) {
      console.error('Error loading invasive alerts:', error);
      // Use default alerts
      setAlerts(getDefaultInvasiveAlerts());
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertPress = (alert: InvasiveAlert) => {
    router.push({
      pathname: '/(tabs)/biodiversity/species-details',
      params: { speciesId: alert.speciesId },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invasive Alerts</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Map Preview */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Affected Zones</Text>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: MAP_CONFIG.DEFAULT_LATITUDE,
                  longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
                  latitudeDelta: MAP_CONFIG.REGION_DELTA.latitudeDelta,
                  longitudeDelta: MAP_CONFIG.REGION_DELTA.longitudeDelta,
                }}>
                {alerts.flatMap((alert) =>
                  alert.affectedZones.map((zone, index) => (
                    <Fragment key={`${alert.id}-${index}`}>
                      <Circle
                        center={zone}
                        radius={zone.radius}
                        fillColor={getLevelColor(alert.level) + '30'}
                        strokeColor={getLevelColor(alert.level)}
                        strokeWidth={2}
                      />
                      <Marker coordinate={zone} title={alert.speciesName}>
                        <View
                          style={[
                            styles.mapMarker,
                            { backgroundColor: getLevelColor(alert.level) },
                          ]}>
                          <Ionicons name="warning" size={16} color={COLORS.white} />
                        </View>
                      </Marker>
                    </Fragment>
                  ))
                )}
              </MapView>
            </View>
          </Animated.View>

          {/* Alerts List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading Sabarmati invasive alerts...</Text>
            </View>
          ) : (
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>Active Alerts</Text>
              {alerts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-circle" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No active invasive alerts</Text>
                  <Text style={styles.emptySubtext}>Sabarmati Riverfront ecosystem is healthy</Text>
                </View>
              ) : (
                alerts.map((alert, index) => (
                  <Animated.View
                    key={alert.id}
                    entering={FadeInUp.duration(500).delay(index * 100)}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleAlertPress(alert)}
                      style={styles.alertCard}>
                      <LinearGradient
                        colors={getLevelGradient(alert.level)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.alertCardGradient}>
                        <View style={styles.alertHeader}>
                          <View style={styles.alertIconContainer}>
                            <Ionicons name="warning" size={24} color={COLORS.white} />
                          </View>
                          <View style={styles.alertHeaderContent}>
                            <Text style={styles.alertSpeciesName}>{alert.speciesName}</Text>
                            <View style={styles.alertLevelContainer}>
                              <View style={styles.alertLevelDot} />
                              <Text style={styles.alertLevelText}>
                                {alert.level.toUpperCase()} THREAT
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.alertDescription}>{alert.description}</Text>
                        <View style={styles.alertImpact}>
                          <Ionicons name="information-circle" size={16} color={COLORS.white} />
                          <Text style={styles.alertImpactText}>{alert.impact}</Text>
                        </View>
                        <View style={styles.alertAction}>
                          <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
                          <Text style={styles.alertActionText}>{alert.recommendedAction}</Text>
                        </View>
                        {alert.image && alert.image.trim().length > 0 ? (
                          <Image source={{ uri: alert.image }} style={styles.alertImage} />
                        ) : (
                          <Image source={{ uri: placeholderImage }} style={styles.alertImage} />
                        )}
                        <View style={styles.alertFooter}>
                          <Text style={styles.alertDate}>
                            Reported {Math.floor((Date.now() - alert.reportedDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </View>
          )}

          {/* Info Card */}
          <Animated.View entering={FadeInUp.duration(500).delay(400)} style={styles.infoCard}>
            <BlurView intensity={80} tint="light" style={styles.infoCardBlur}>
              <Ionicons name="information-circle" size={24} color={COLORS.textPrimary} />
              <Text style={styles.infoCardTitle}>About Invasive Species</Text>
              <Text style={styles.infoCardText}>
                Invasive species can harm native ecosystems by outcompeting local species,
                disrupting food chains, and altering habitats. Report sightings immediately.
              </Text>
            </BlurView>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        {/* Offline Mode Snackbar */}
        {isOffline && (
          <Snackbar
            visible={isOffline}
            message="Showing default Sabarmati invasive alerts — live data unavailable"
            type="warning"
            onDismiss={() => {}}
            duration={4000}
          />
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  mapSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  alertsSection: {
    marginBottom: 24,
  },
  alertCard: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  alertCardGradient: {
    padding: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertHeaderContent: {
    flex: 1,
  },
  alertSpeciesName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  alertLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertLevelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  alertLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  alertDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.white,
    marginBottom: 12,
  },
  alertImpact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertImpactText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white,
    marginLeft: 8,
    lineHeight: 18,
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
    lineHeight: 18,
  },
  alertImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.textMuted,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  alertDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoCardBlur: {
    padding: 20,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

