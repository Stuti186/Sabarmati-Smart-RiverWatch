/**
 * UnsafeZoneMapScreen
 * Clean, modern map showing unsafe zones with proper markers and bottom sheet
 * Fixed marker positioning, clean UI, smooth interactions
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MapMarkerIcon, MapBottomSheet } from '@/components/ui';
import { MAP_CONFIG } from '@/constants';
import {
  generateUnsafeZones,
  getSeverityColor,
  getDangerIcon,
  type UnsafeZone,
} from '@/utils/unsafeZones';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#EF4444',
  headerGradientEnd: '#DC2626',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  critical: '#DC2626',
  high: '#EF4444',
  moderate: '#FACC15',
};

// Memoized marker component for performance
const ZoneMarker = memo(({ 
  zone, 
  isSelected,
  onPress 
}: { 
  zone: UnsafeZone; 
  isSelected: boolean;
  onPress: () => void;
}) => {
  const dangerIcon = getDangerIcon(zone.dangerType);
  
  return (
    <Marker
      coordinate={zone.location}
      onPress={onPress}
      tracksViewChanges={false}
      zIndex={isSelected ? 1000 : zone.severity === 'critical' ? 100 : 10}
    >
      <MapMarkerIcon
        type="danger"
        severity={zone.severity}
        icon={dangerIcon}
        size="medium"
        isSelected={isSelected}
      />
    </Marker>
  );
});

export default function UnsafeZoneMapScreen() {
  const router = useRouter();
  const zones = useMemo(() => generateUnsafeZones(), []);
  const [selectedZone, setSelectedZone] = useState<UnsafeZone | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleZonePress = useCallback((zone: UnsafeZone) => {
    setSelectedZone(zone);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedZone(null);
  }, []);

  const handleMapPress = useCallback(() => {
    if (sheetVisible) {
      handleCloseSheet();
    }
  }, [sheetVisible, handleCloseSheet]);

  const severityCounts = useMemo(() => ({
    critical: zones.filter((z) => z.severity === 'critical').length,
    high: zones.filter((z) => z.severity === 'high').length,
    moderate: zones.filter((z) => z.severity === 'moderate').length,
  }), [zones]);

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="warning" size={22} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Unsafe Zones</Text>
            <Text style={styles.headerSubtitle}>
              {zones.length} zone{zones.length !== 1 ? 's' : ''} detected
            </Text>
          </View>
        </View>

        {/* Compact Severity Summary */}
        <View style={styles.severityRow}>
          <View style={styles.severityPill}>
            <View style={[styles.severityDot, { backgroundColor: COLORS.critical }]} />
            <Text style={styles.severityText}>{severityCounts.critical} Critical</Text>
          </View>
          <View style={styles.severityPill}>
            <View style={[styles.severityDot, { backgroundColor: COLORS.high }]} />
            <Text style={styles.severityText}>{severityCounts.high} High</Text>
          </View>
          <View style={styles.severityPill}>
            <View style={[styles.severityDot, { backgroundColor: COLORS.moderate }]} />
            <Text style={styles.severityText}>{severityCounts.moderate} Moderate</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Ionicons name="water" size={16} color={COLORS.textSecondary} />
          <Text style={styles.navButtonText}>Sensors</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={16} color={COLORS.white} />
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Unsafe</Text>
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
    if (!selectedZone) return null;

    const zoneColor = getSeverityColor(selectedZone.severity);

    return (
      <View style={styles.sheetContent}>
        {/* Severity Badge */}
        <View style={[styles.severityBadge, { backgroundColor: `${zoneColor}15` }]}>
          <View style={[styles.severityBadgeDot, { backgroundColor: zoneColor }]} />
          <Text style={[styles.severityBadgeText, { color: zoneColor }]}>
            {selectedZone.severity.toUpperCase()} RISK
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.sheetDescription}>{selectedZone.description}</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{selectedZone.name}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="radio-button-on" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Danger Radius</Text>
              <Text style={styles.infoValue}>{selectedZone.radius}m</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="alert-circle" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{selectedZone.dangerType.replace('_', ' ')}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Reported</Text>
              <Text style={styles.infoValue}>{selectedZone.timestamp}</Text>
            </View>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Ionicons name="shield-checkmark" size={20} color="#EF4444" />
          <Text style={styles.warningText}>
            Avoid this area. Exercise caution if you must pass through.
          </Text>
        </View>
      </View>
    );
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
          {/* Danger Zone Circles */}
          {zones.map((zone) => {
            const zoneColor = getSeverityColor(zone.severity);
            return (
              <Circle
                key={`circle-${zone.id}`}
                center={zone.location}
                radius={zone.radius}
                fillColor={`${zoneColor}20`}
                strokeColor={zoneColor}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Zone Markers */}
          {zones.map((zone) => (
            <ZoneMarker
              key={zone.id}
              zone={zone}
              isSelected={selectedZone?.id === zone.id}
              onPress={() => handleZonePress(zone)}
            />
          ))}
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <MapBottomSheet
        visible={sheetVisible}
        title={selectedZone?.name || 'Zone Details'}
        subtitle={selectedZone ? `${selectedZone.severity} risk area` : undefined}
        headerColor={selectedZone ? getSeverityColor(selectedZone.severity) : COLORS.critical}
        headerIcon="warning"
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
    height: 180,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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

  // Severity Row
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
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
    marginTop: 10,
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

  // Sheet Content
  sheetContent: {
    gap: 16,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  severityBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sheetDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 22,
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
    textTransform: 'capitalize',
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#991B1B',
    lineHeight: 18,
  },
});
