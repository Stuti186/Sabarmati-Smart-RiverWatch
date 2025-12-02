/**
 * WaterSensorMapScreen
 * Clean, modern sensor map with navigation to other map views
 * Fixed marker positioning, proper bottom sheet, smooth interactions
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { MapBottomSheet, SegmentedControl } from '@/components/ui';
import { MAP_CONFIG } from '@/constants';
import { generateSensorData, type SensorData } from '@/utils/sensorData';
import {
  getpHStatus,
  getDOStatus,
  getBODStatus,
  formatValue,
} from '@/utils/waterQuality';

const { width } = Dimensions.get('window');

// Color Palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  excellent: '#22C55E',
  good: '#3B82F6',
  fair: '#FACC15',
  poor: '#EF4444',
};

const STATUS_COLORS: Record<string, string> = {
  excellent: COLORS.excellent,
  good: COLORS.good,
  fair: COLORS.fair,
  poor: COLORS.poor,
};

// Memoized marker component
const SensorMarker = memo(({ 
  sensor, 
  isSelected,
  onPress 
}: { 
  sensor: SensorData; 
  isSelected: boolean;
  onPress: () => void;
}) => {
  const statusColor = STATUS_COLORS[sensor.status] || COLORS.good;
  
  return (
    <Marker
      coordinate={sensor.location}
      onPress={onPress}
      tracksViewChanges={false}
      zIndex={isSelected ? 1000 : 10}
    >
      <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
        <View style={[styles.markerPin, { backgroundColor: statusColor }]}>
          <Ionicons name="water" size={16} color={COLORS.white} />
        </View>
        <View style={[styles.markerPointer, { borderTopColor: statusColor }]} />
      </View>
    </Marker>
  );
});

export default function WaterSensorMapScreen() {
  const router = useRouter();
  const sensors = useMemo(() => generateSensorData(), []);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleMarkerPress = useCallback((sensor: SensorData) => {
    setSelectedSensor(sensor);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedSensor(null);
  }, []);

  const handleMapPress = useCallback(() => {
    if (sheetVisible) {
      handleCloseSheet();
    }
  }, [sheetVisible, handleCloseSheet]);

  const statusCounts = useMemo(() => ({
    excellent: sensors.filter((s) => s.status === 'excellent').length,
    good: sensors.filter((s) => s.status === 'good').length,
    fair: sensors.filter((s) => s.status === 'fair').length,
    poor: sensors.filter((s) => s.status === 'poor').length,
  }), [sensors]);

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="water" size={22} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sensor Map</Text>
            <Text style={styles.headerSubtitle}>
              {sensors.length} active sensor{sensors.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Status Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.excellent }]} />
            <Text style={styles.legendText}>{statusCounts.excellent}</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.good }]} />
            <Text style={styles.legendText}>{statusCounts.good}</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.fair }]} />
            <Text style={styles.legendText}>{statusCounts.fair}</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.poor }]} />
            <Text style={styles.legendText}>{statusCounts.poor}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          activeOpacity={0.8}
        >
          <Ionicons name="water" size={16} color={COLORS.white} />
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Sensors</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/map/unsafe-zones')}
        >
          <Ionicons name="warning" size={16} color={COLORS.textSecondary} />
          <Text style={styles.navButtonText}>Unsafe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/map/waste-hotspots')}
        >
          <Ionicons name="flame" size={16} color={COLORS.textSecondary} />
          <Text style={styles.navButtonText}>Hotspots</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderBottomSheetContent = () => {
    if (!selectedSensor) return null;

    const statusColor = STATUS_COLORS[selectedSensor.status] || COLORS.good;
    const readings = selectedSensor.waterQuality || {
      pH: 7.0,
      DO: 6.0,
      BOD: 3.0,
      TDS: 300,
      COD: 10,
      turbidity: 5,
      temperature: 25,
    };

    return (
      <View style={styles.sheetContent}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusBadgeDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {selectedSensor.status.toUpperCase()}
          </Text>
        </View>

        {/* Readings Grid */}
        <View style={styles.readingsGrid}>
          <View style={styles.readingItem}>
            <Text style={styles.readingLabel}>pH Level</Text>
            <Text style={styles.readingValue}>{formatValue(readings.pH || 7.0, '')}</Text>
            <Text style={[styles.readingStatus, { color: getStatusColor(getpHStatus(readings.pH || 7.0)) }]}>
              {getpHStatus(readings.pH || 7.0)}
            </Text>
          </View>

          <View style={styles.readingItem}>
            <Text style={styles.readingLabel}>Dissolved O₂</Text>
            <Text style={styles.readingValue}>{formatValue(readings.DO || 6.0, ' mg/L')}</Text>
            <Text style={[styles.readingStatus, { color: getStatusColor(getDOStatus(readings.DO || 6.0)) }]}>
              {getDOStatus(readings.DO || 6.0)}
            </Text>
          </View>

          <View style={styles.readingItem}>
            <Text style={styles.readingLabel}>BOD</Text>
            <Text style={styles.readingValue}>{formatValue(readings.BOD || 3.0, ' mg/L')}</Text>
            <Text style={[styles.readingStatus, { color: getStatusColor(getBODStatus(readings.BOD || 3.0)) }]}>
              {getBODStatus(readings.BOD || 3.0)}
            </Text>
          </View>

          <View style={styles.readingItem}>
            <Text style={styles.readingLabel}>TDS</Text>
            <Text style={styles.readingValue}>{formatValue(readings.TDS || 300, ' ppm')}</Text>
            <Text style={styles.readingStatusNeutral}>Normal</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Sensor ID</Text>
              <Text style={styles.infoValue}>{selectedSensor.id}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{selectedSensor.lastUpdated}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getStatusColor = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('excellent') || lowerStatus.includes('optimal')) return COLORS.excellent;
    if (lowerStatus.includes('good') || lowerStatus.includes('normal')) return COLORS.good;
    if (lowerStatus.includes('fair') || lowerStatus.includes('moderate')) return COLORS.fair;
    return COLORS.poor;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Header */}
      {renderHeader()}

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: MAP_CONFIG.DEFAULT_LATITUDE,
            longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
            latitudeDelta: MAP_CONFIG.REGION_DELTA.latitudeDelta,
            longitudeDelta: MAP_CONFIG.REGION_DELTA.longitudeDelta,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="standard"
          onPress={handleMapPress}
          mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {sensors.map((sensor) => (
            <SensorMarker
              key={sensor.id}
              sensor={sensor}
              isSelected={selectedSensor?.id === sensor.id}
              onPress={() => handleMarkerPress(sensor)}
            />
          ))}
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <MapBottomSheet
        visible={sheetVisible}
        title={selectedSensor?.name || 'Sensor Details'}
        subtitle={selectedSensor ? `Status: ${selectedSensor.status}` : undefined}
        headerColor={selectedSensor ? STATUS_COLORS[selectedSensor.status] || COLORS.good : COLORS.good}
        headerIcon="water"
        onClose={handleCloseSheet}
        initialState="half"
      >
        {renderBottomSheetContent()}
      </MapBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  headerCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Legend Row
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  legendPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Navigation Row
  navRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonActive: {
    backgroundColor: COLORS.gradientEnd,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  navButtonTextActive: {
    color: COLORS.white,
  },

  // Map
  mapContainer: {
    flex: 1,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 90 : 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    flex: 1,
  },

  // Marker
  markerContainer: {
    alignItems: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  // Sheet Content
  sheetContent: {
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Readings Grid
  readingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  readingItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  readingLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  readingStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  readingStatusNeutral: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Info Grid
  infoGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItemText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
