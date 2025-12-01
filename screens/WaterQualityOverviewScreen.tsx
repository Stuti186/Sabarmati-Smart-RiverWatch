/**
 * WaterQualityOverviewScreen
 * Modern premium Water Quality Monitor with blue gradient theme
 * Real-time IoT sensor integration ready
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { WATER_QUALITY_PARAMS } from '@/constants';
import {
  getpHStatus,
  getDOStatus,
  getBODStatus,
  getCODStatus,
  getTDSStatus,
  getTurbidityStatus,
  getMicrobialLoadStatus,
  formatValue,
  type WaterQualityReading,
} from '@/utils/waterQuality';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// Modern Blue Color Palette
const COLORS = {
  // Primary blues
  primaryDark: '#1E3A8A',
  primaryMid: '#2563EB',
  primaryLight: '#3B82F6',
  primaryBright: '#60A5FA',
  
  // Gradient blues
  gradientStart: '#38BDF8',
  gradientMid: '#3B82F6',
  gradientEnd: '#1E3A8A',
  
  // Soft backgrounds
  softBlue: '#E0F2FE',
  softBlueMid: '#BAE6FD',
  background: '#F0F9FF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  
  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  
  // Status colors
  good: {
    primary: '#22C55E',
    light: '#4ADE80',
    bg: '#DCFCE7',
    text: '#166534',
  },
  moderate: {
    primary: '#EAB308',
    light: '#FACC15',
    bg: '#FEF9C3',
    text: '#854D0E',
  },
  bad: {
    primary: '#EF4444',
    light: '#F87171',
    bg: '#FEE2E2',
    text: '#991B1B',
  },
};

// Status gradient configurations
const STATUS_GRADIENTS = {
  good: ['#4ADE80', '#22C55E'] as const,
  moderate: ['#FACC15', '#EAB308'] as const,
  bad: ['#F87171', '#EF4444'] as const,
};

// Mock data generator - Replace with real IoT sensor data
function generateMockReading(): WaterQualityReading {
  return {
    pH: 6.8 + Math.random() * 1.5,
    DO: 5 + Math.random() * 10,
    BOD: Math.random() * 4,
    COD: Math.random() * 300,
    TDS: Math.random() * 600,
    turbidity: Math.random() * 6,
    temperature: 18 + Math.random() * 20,
    microbialLoad: Math.random() * 800,
    timestamp: new Date().toISOString(),
  };
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  status: 'good' | 'moderate' | 'bad';
  icon: keyof typeof Ionicons.glyphMap;
  delay?: number;
  lastUpdated: string;
}

function MetricCard({ title, value, unit, status, icon, delay = 0, lastUpdated }: MetricCardProps) {
  const gradientColors = STATUS_GRADIENTS[status];
  const statusConfig = COLORS[status];
  
  const statusLabel = status === 'good' ? 'Good' : status === 'moderate' ? 'Moderate' : 'Critical';

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      style={styles.metricCardWrapper}>
      <View style={styles.metricCard}>
        <LinearGradient
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metricCardGradient}>
          
          {/* Icon */}
          <View style={styles.metricIconContainer}>
            <Ionicons name={icon} size={22} color="rgba(255,255,255,0.9)" />
          </View>

          {/* Value */}
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricUnit}>{unit}</Text>

          {/* Title */}
          <Text style={styles.metricTitle}>{title}</Text>

          {/* Status Badge */}
          <View style={styles.metricStatusBadge}>
            <View style={styles.metricStatusDot} />
            <Text style={styles.metricStatusText}>{statusLabel}</Text>
          </View>

          {/* Timestamp */}
          <Text style={styles.metricTimestamp}>{lastUpdated}</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

export default function WaterQualityOverviewScreen() {
  const router = useRouter();
  const [readings, setReadings] = useState<WaterQualityReading>(generateMockReading());
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setReadings(generateMockReading());
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setReadings(generateMockReading());
      setLastUpdate(new Date());
      setRefreshing(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const metricCards = [
    {
      title: 'pH Level',
      value: readings.pH ? formatValue(readings.pH, 'pH') : '--',
      unit: WATER_QUALITY_PARAMS.pH.unit,
      status: readings.pH ? getpHStatus(readings.pH) : 'moderate',
      icon: 'water-outline' as const,
    },
    {
      title: 'Dissolved O₂',
      value: readings.DO ? formatValue(readings.DO, 'DO') : '--',
      unit: WATER_QUALITY_PARAMS.DO.unit,
      status: readings.DO ? getDOStatus(readings.DO) : 'moderate',
      icon: 'cloud-outline' as const,
    },
    {
      title: 'BOD',
      value: readings.BOD ? formatValue(readings.BOD, 'BOD') : '--',
      unit: WATER_QUALITY_PARAMS.BOD.unit,
      status: readings.BOD ? getBODStatus(readings.BOD) : 'moderate',
      icon: 'leaf-outline' as const,
    },
    {
      title: 'COD',
      value: readings.COD ? formatValue(readings.COD, 'COD') : '--',
      unit: WATER_QUALITY_PARAMS.COD.unit,
      status: readings.COD ? getCODStatus(readings.COD) : 'moderate',
      icon: 'flask-outline' as const,
    },
    {
      title: 'TDS',
      value: readings.TDS ? formatValue(readings.TDS, 'TDS') : '--',
      unit: WATER_QUALITY_PARAMS.TDS.unit,
      status: readings.TDS ? getTDSStatus(readings.TDS) : 'moderate',
      icon: 'cube-outline' as const,
    },
    {
      title: 'Turbidity',
      value: readings.turbidity ? formatValue(readings.turbidity, 'turbidity') : '--',
      unit: WATER_QUALITY_PARAMS.TURBIDITY.unit,
      status: readings.turbidity ? getTurbidityStatus(readings.turbidity) : 'moderate',
      icon: 'eye-outline' as const,
    },
    {
      title: 'Microbial Load',
      value: readings.microbialLoad ? formatValue(readings.microbialLoad, 'microbialLoad') : '--',
      unit: 'CFU/mL',
      status: readings.microbialLoad ? getMicrobialLoadStatus(readings.microbialLoad) : 'moderate',
      icon: 'bug-outline' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Premium Blue Gradient Background */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.headerContainer}>
          <View style={styles.headerCard}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <HeaderContent formatTime={formatTime} lastUpdate={lastUpdate} />
              </BlurView>
            ) : (
              <View style={styles.headerCardAndroid}>
                <HeaderContent formatTime={formatTime} lastUpdate={lastUpdate} />
              </View>
            )}
          </View>
        </Animated.View>

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
          
          {/* Section Title */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(200)}
            style={styles.sectionTitleContainer}>
            <Ionicons name="pulse-outline" size={20} color={COLORS.textWhite} />
            <Text style={styles.sectionTitle}>Sensor Readings</Text>
          </Animated.View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {metricCards.map((card, index) => (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                unit={card.unit}
                status={card.status as 'good' | 'moderate' | 'bad'}
                icon={card.icon}
                delay={250 + index * 80}
                lastUpdated={formatTime(lastUpdate)}
              />
            ))}
          </View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(650)}
            style={styles.actionsContainer}>
            <Text style={styles.actionsTitle}>Explore More</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/monitor/graphs')}>
                <LinearGradient
                  colors={['#06B6D4', '#0891B2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}>
                  <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>View Graphs</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/monitor/water-level')}>
                <LinearGradient
                  colors={['#0EA5E9', '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}>
                  <Ionicons name="water" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Water Levels</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Info Card */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(750)}
            style={styles.infoCardContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={24} color={COLORS.primaryMid} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>IoT Sensor Integration</Text>
                <Text style={styles.infoDescription}>
                  Data updates automatically every 5 seconds. Connect to real sensors via WebSocket or API for live monitoring.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Header Content Component
function HeaderContent({ formatTime, lastUpdate }: { formatTime: (date: Date) => string; lastUpdate: Date }) {
  return (
    <View style={styles.headerContent}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Water Quality Overview</Text>
        <Text style={styles.headerSubtitle}>
          Real-time sensor data • Last update: {formatTime(lastUpdate)}
        </Text>
      </View>
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerCardAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.good.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textWhite,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.5,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Section Title
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textWhite,
    letterSpacing: -0.2,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCardWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  metricCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  metricCardGradient: {
    padding: 16,
    minHeight: 160,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textWhite,
    letterSpacing: -1,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  metricStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  metricStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textWhite,
    marginRight: 6,
  },
  metricStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricTimestamp: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Info Card
  infoCardContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.softBlue,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.softBlueMid,
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.textWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: COLORS.primaryMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  // Quick Actions
  actionsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
