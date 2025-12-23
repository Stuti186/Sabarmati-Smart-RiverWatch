/**
 * WaterQualityOverviewScreen
 * Modern premium Water Quality Monitor with blue gradient theme
 * Real-time IoT sensor integration ready
 */

import React, { useState, useEffect, useRef } from 'react';
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
  getTemperatureStatus,
  formatValue,
  type WaterQualityReading,
} from '@/utils/waterQuality';
import { 
  startTemperatureSync, 
  updateTemperatureState, 
  stopTemperatureSync, 
  getTemperatureState,
  shouldBeLeader,
  getIsLeader 
} from '@/services/temperatureLeader';
import { backendApi } from '@/services/backendApi';

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
function generateMockReading(temperature?: number): WaterQualityReading {
  return {
    pH: 6.8 + Math.random() * 1.5,
    DO: 5 + Math.random() * 10,
    BOD: Math.random() * 4,
    COD: Math.random() * 300,
    TDS: Math.random() * 600,
    turbidity: Math.random() * 6,
    temperature: temperature !== undefined ? temperature : 18 + Math.random() * 20,
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
  onLayout?: (event: any) => void;
  isTemperature?: boolean;
}

function MetricCard({ title, value, unit, status, icon, delay = 0, lastUpdated, onLayout, isTemperature = false }: MetricCardProps) {
  const gradientColors = STATUS_GRADIENTS[status];
  const statusConfig = COLORS[status];
  
  const statusLabel = status === 'good' ? 'Good' : status === 'moderate' ? 'Moderate' : 'Critical';

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      style={styles.metricCardWrapper}
      onLayout={onLayout}>
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
  const [readings, setReadings] = useState<WaterQualityReading>(generateMockReading(25.7));
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Smart Temperature Simulation State
  const [temp, setTemp] = useState(25.7);
  const [heatMode, setHeatMode] = useState(false);
  const [coolMode, setCoolMode] = useState(false);
  const [heatDelayActive, setHeatDelayActive] = useState(false);
  const [temperatureCardY, setTemperatureCardY] = useState(0);
  const [temperatureCardX, setTemperatureCardX] = useState(0);
  const heatDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tempRef = useRef(25.7);
  const heatModeRef = useRef(false);
  const coolModeRef = useRef(false);
  const isSyncingRef = useRef(false); // Track if we're receiving sync updates
  const lastSyncTimeRef = useRef(Date.now());

  // Update refs when state changes
  useEffect(() => {
    tempRef.current = temp;
  }, [temp]);
  
  useEffect(() => {
    heatModeRef.current = heatMode;
  }, [heatMode]);
  
  useEffect(() => {
    coolModeRef.current = coolMode;
  }, [coolMode]);

  // Initialize temperature from server on mount (CRITICAL: Must happen before simulation starts)
  useEffect(() => {
    let isMounted = true;
    
    // Fetch initial state from server immediately
    getTemperatureState().then((state) => {
      if (isMounted && state) {
        // Set syncing flag to prevent local simulation from overriding
        isSyncingRef.current = true;
        lastSyncTimeRef.current = Date.now();
        
        // Update all state from server (this is the source of truth)
        setTemp(state.temperature);
        setHeatMode(state.heatMode);
        setCoolMode(state.coolMode);
        tempRef.current = state.temperature;
        heatModeRef.current = state.heatMode;
        coolModeRef.current = state.coolMode;
        
        // Keep syncing flag active for 2 seconds to ensure sync takes precedence
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 2000);
      }
    }).catch(() => {
      // Silently fail - will use default 25.7
      // But still mark as synced to prevent immediate local changes
      lastSyncTimeRef.current = Date.now();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Smart Temperature Simulator
  useEffect(() => {
    const updateTemperature = () => {
      const timeSinceSync = Date.now() - lastSyncTimeRef.current;
      
      // CRITICAL: Skip ALL local updates if we recently received a sync (within last 3 seconds)
      // This ensures synced values are the source of truth
      if (isSyncingRef.current && timeSinceSync < 3000) {
        return; // Don't apply ANY local changes if we're syncing
      }

      // Only allow local updates if:
      // 1. This device is actively controlling (heat/cool mode), OR
      // 2. No sync has happened in the last 5 seconds (device is offline/independent)
      const isThisDeviceControlling = heatModeRef.current || coolModeRef.current;
      const isOffline = timeSinceSync > 5000;
      
      // If another device is controlling and we're online, don't make local changes
      if (!isThisDeviceControlling && !isOffline) {
        return; // Another device is controlling - wait for sync
      }

      setTemp((currentTemp) => {
        let newTemp = currentTemp;

        // Only apply natural drift if this device is controlling or offline
        if (isThisDeviceControlling || isOffline) {
          // Natural drift (always active) - small random variations
          const naturalDrift = (Math.random() - 0.5) * 0.12; // ±0.06°C
          newTemp += naturalDrift;

          // Micro noise (always active)
          const microNoise = (Math.random() - 0.5) * 0.04; // ±0.02°C
          newTemp += microNoise;
        }

        // Heat Mode: Gradual rise after delay (only if this device is controlling)
        if (heatMode && !heatDelayActive && isThisDeviceControlling) {
          // Initial phase: Small variations (25.6-25.9-25.7-26) for first few seconds
          if (currentTemp < 26.5) {
            // Small variations around 25.6-26.0
            const smallVariation = (Math.random() - 0.5) * 0.6; // ±0.3°C
            newTemp += 0.1 + smallVariation; // Slight upward trend with variation
          } else if (currentTemp < 28.0) {
            // Gradual increase phase: 26-28 with variations
            const increment = 0.2 + Math.random() * 0.3; // 0.2-0.5°C
            const variation = (Math.random() - 0.5) * 0.8; // ±0.4°C (allows some decrease)
            newTemp += increment + variation;
          } else if (currentTemp < 30.0) {
            // Mid phase: 28-30 with more variation
            const increment = 0.15 + Math.random() * 0.25; // 0.15-0.4°C
            const variation = (Math.random() - 0.5) * 1.2; // ±0.6°C (allows ±2°C total)
            newTemp += increment + variation;
          } else if (currentTemp < 32.0) {
            // Higher phase: 30-32 with variations
            const increment = 0.1 + Math.random() * 0.2; // 0.1-0.3°C
            const variation = (Math.random() - 0.5) * 1.0; // ±0.5°C
            newTemp += increment + variation;
          } else {
            // Max phase: 32-33 with variations
            const variation = (Math.random() - 0.5) * 1.0; // ±0.5°C
            newTemp += 0.05 + variation; // Very slow increase with variation
            if (newTemp > 33.5) {
              newTemp = 32.5 + Math.random() * 1.0; // Cap around 33.5
            }
          }
        }

        // Cool Mode: Gradual cooling (only if this device is controlling)
        if (coolMode && !heatMode && isThisDeviceControlling) {
          const coolDecrement = 0.15 + Math.random() * 0.2; // 0.15-0.35°C
          const variation = (Math.random() - 0.5) * 0.4; // ±0.2°C variation
          newTemp -= (coolDecrement + variation);
          
          // Stop cooling near 25.7°C (but not exactly)
          if (newTemp <= 25.6) {
            newTemp = 25.6 + Math.random() * 0.4; // Final temp: 25.6-26.0
            setCoolMode(false); // Stop cooling when reached
          }
        }

        // Boundary constraints
        newTemp = Math.max(20.0, Math.min(35.0, newTemp));

        return newTemp;
      });
    };

    const interval = setInterval(updateTemperature, 1000); // Update every 1 second
    return () => clearInterval(interval);
  }, [heatMode, coolMode, heatDelayActive]);

  // Handle heat delay (reduced to 1-2 seconds)
  useEffect(() => {
    if (heatMode && heatDelayActive) {
      const delay = 1000 + Math.random() * 1000; // 1-2 seconds
      
      heatDelayTimeoutRef.current = setTimeout(() => {
        setHeatDelayActive(false);
      }, delay);
    }

    return () => {
      if (heatDelayTimeoutRef.current) {
        clearTimeout(heatDelayTimeoutRef.current);
      }
    };
  }, [heatMode, heatDelayActive]);

  // Start Heat Mode
  const startHeatMode = () => {
    setHeatMode(true);
    setCoolMode(false);
    setHeatDelayActive(true);
  };

  // Stop Heat Mode and Start Cool Mode
  const stopHeatMode = () => {
    setHeatMode(false);
    setCoolMode(true);
    if (heatDelayTimeoutRef.current) {
      clearTimeout(heatDelayTimeoutRef.current);
      heatDelayTimeoutRef.current = null;
    }
    setHeatDelayActive(false);
  };

  // Update readings with smart temperature
  useEffect(() => {
    setReadings((prev) => ({
      ...prev,
      temperature: temp,
    }));
  }, [temp]);

  // Sync temperature state to backend (only if this device is leader)
  useEffect(() => {
    // Skip sync if we just received an update (to avoid sync loops)
    const timeSinceSync = Date.now() - lastSyncTimeRef.current;
    if (isSyncingRef.current && timeSinceSync < 500) {
      return; // Don't sync if we just received a sync update very recently
    }

    // Check if this device should be leader
    const shouldLead = shouldBeLeader(heatMode, coolMode);
    const isCurrentlyLeader = getIsLeader();

    // Only sync if we're the leader (or should become leader)
    if (shouldLead || isCurrentlyLeader) {
      // Immediate sync for mode changes (user interactions)
      if (heatMode || coolMode) {
        // This device is controlling - sync immediately
        updateTemperatureState({
          temperature: temp,
          heatMode,
          coolMode,
        }, true).catch(() => {
          // Silently fail - backend might be offline
        });
      } else {
        // Throttled sync for temperature drift (every 300ms when leader)
        const syncTimeout = setTimeout(() => {
          // Only sync if we're not currently receiving updates
          if (!isSyncingRef.current || timeSinceSync > 1000) {
            updateTemperatureState({
              temperature: temp,
              heatMode,
              coolMode,
            }, true).catch(() => {
              // Silently fail - backend might be offline
            });
          }
        }, 300);

        return () => clearTimeout(syncTimeout);
      }
    }
  }, [temp, heatMode, coolMode]);

  // Sync temperature state from other devices (with leader detection)
  useEffect(() => {
    let isMounted = true;
    
    const cleanup = startTemperatureSync(
      (state) => {
        if (!isMounted) return;
        
        // Always sync if state is different (very small threshold for perfect sync)
        const tempDiff = Math.abs(state.temperature - tempRef.current);
        const modeChanged = state.heatMode !== heatModeRef.current || state.coolMode !== coolModeRef.current;
        
        // Sync on ANY change (0.01°C threshold) or mode change
        if (tempDiff > 0.01 || modeChanged) {
          isSyncingRef.current = true;
          lastSyncTimeRef.current = Date.now();
          
          // Immediately update all state - this is the source of truth
          setTemp(state.temperature);
          setHeatMode(state.heatMode);
          setCoolMode(state.coolMode);
          tempRef.current = state.temperature;
          heatModeRef.current = state.heatMode;
          coolModeRef.current = state.coolMode;
          
          // Reset syncing flag after 3 seconds (longer to prevent local drift)
          setTimeout(() => {
            isSyncingRef.current = false;
          }, 3000);
        }
      },
      () => ({ heatMode: heatModeRef.current, coolMode: coolModeRef.current })
    );

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  // Fetch real sensor data from backend (every 5 seconds)
  // Falls back to mock data if backend is unavailable
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        // Try to fetch latest readings from backend
        const response = await backendApi.getWaterQuality();
        if (response.success && response.data && response.data.length > 0) {
          const latestReading = response.data[0];
          // Use real data but ensure temperature is synced
          setReadings({
            pH: latestReading.parameters?.pH || latestReading.pH || 7.0,
            DO: latestReading.parameters?.DO || latestReading.DO || 6.0,
            BOD: latestReading.parameters?.BOD || latestReading.BOD || 2.0,
            COD: latestReading.parameters?.COD || latestReading.COD || 50,
            TDS: latestReading.parameters?.TDS || latestReading.TDS || 300,
            turbidity: latestReading.parameters?.turbidity || latestReading.turbidity || 2.0,
            temperature: temp, // Always use synced temperature (source of truth)
            microbialLoad: latestReading.parameters?.microbialLoad || latestReading.microbialLoad || 100,
            timestamp: latestReading.timestamp || new Date().toISOString(),
          });
        } else {
          // Fallback to mock data with synced temperature
          setReadings((prev) => ({
            ...generateMockReading(temp),
            temperature: temp, // Use synced temperature (source of truth)
          }));
        }
      } catch (error) {
        // Backend unavailable - use mock data with synced temperature
        setReadings((prev) => ({
          ...generateMockReading(temp),
          temperature: temp, // Use synced temperature (source of truth)
        }));
      }
      setLastUpdate(new Date());
    };

    // Initial fetch
    fetchSensorData();

    // Set up interval for periodic updates
    const interval = setInterval(fetchSensorData, 5000);

    return () => clearInterval(interval);
  }, [temp]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setReadings(generateMockReading(temp));
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
      title: 'Temperature',
      value: readings.temperature ? formatValue(readings.temperature, 'temperature') : '--',
      unit: WATER_QUALITY_PARAMS.TEMPERATURE.unit,
      status: readings.temperature ? getTemperatureStatus(readings.temperature) : 'moderate',
      icon: 'thermometer-outline' as const,
      isTemperature: true,
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
                isTemperature={card.isTemperature || false}
                onLayout={card.isTemperature ? (event) => {
                  const { y, x } = event.nativeEvent.layout;
                  setTemperatureCardY(y);
                  setTemperatureCardX(x);
                } : undefined}
              />
            ))}
            
            {/* Invisible Touch Zone for Temperature Card (Hidden Interaction) */}
            {temperatureCardY > 0 && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  width: CARD_WIDTH - 12,
                  height: 160,
                  opacity: 0,
                  top: temperatureCardY,
                  left: temperatureCardX || 16,
                  zIndex: 1000,
                  backgroundColor: 'transparent',
                }}
                onPressIn={startHeatMode}
                onPressOut={stopHeatMode}
                activeOpacity={1}
              />
            )}
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
                  Data updates automatically every 5 seconds.
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
