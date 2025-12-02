/**
 * WasteHotspotMapScreen
 * Clean, modern heatmap showing waste density hotspots
 * Fixed marker positioning, proper bottom sheet, smooth interactions
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
  generateWasteHotspots,
  getDensityLevel,
  getDensityColor,
  type WasteHotspot,
} from '@/utils/wasteHotspots';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#F59E0B',
  headerGradientEnd: '#D97706',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#FACC15',
  low: '#22C55E',
};

// Memoized marker component for performance
const HotspotMarker = memo(({ 
  hotspot, 
  isSelected,
  onPress 
}: { 
  hotspot: WasteHotspot; 
  isSelected: boolean;
  onPress: () => void;
}) => {
  const densityLevel = getDensityLevel(hotspot.density);
  
  return (
    <Marker
      coordinate={{
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false}
      zIndex={isSelected ? 1000 : densityLevel === 'critical' ? 100 : 10}
    >
      <MapMarkerIcon
        type="hotspot"
        severity={densityLevel}
        icon="flame"
        label={`${hotspot.density}%`}
        size="small"
        isSelected={isSelected}
      />
    </Marker>
  );
});

export default function WasteHotspotMapScreen() {
  const router = useRouter();
  const hotspots = useMemo(() => generateWasteHotspots(), []);
  const [selectedHotspot, setSelectedHotspot] = useState<WasteHotspot | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isInteractingWithSheet, setIsInteractingWithSheet] = useState(false);

  const handleHotspotPress = useCallback((hotspot: WasteHotspot) => {
    setSelectedHotspot(hotspot);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedHotspot(null);
    setIsInteractingWithSheet(false);
  }, []);

  const handleMapPress = useCallback(() => {
    if (sheetVisible) {
      handleCloseSheet();
    }
  }, [sheetVisible, handleCloseSheet]);

  const getCircleColor = useCallback((density: number): string => {
    const level = getDensityLevel(density);
    return getDensityColor(level);
  }, []);

  const getCircleOpacity = useCallback((density: number): string => {
    const opacity = 0.15 + (density / 100) * 0.35;
    return Math.floor(opacity * 255).toString(16).padStart(2, '0');
  }, []);

  const densityCounts = useMemo(() => ({
    critical: hotspots.filter((h) => getDensityLevel(h.density) === 'critical').length,
    high: hotspots.filter((h) => getDensityLevel(h.density) === 'high').length,
    medium: hotspots.filter((h) => getDensityLevel(h.density) === 'medium').length,
    low: hotspots.filter((h) => getDensityLevel(h.density) === 'low').length,
  }), [hotspots]);

  const handleSheetInteractionChange = useCallback((isInteracting: boolean) => {
    setIsInteractingWithSheet(isInteracting);
  }, []);

  const isMapInteractive = !isInteractingWithSheet;

  const renderQuickNavigation = () => (
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
        style={styles.navButton}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/map/unsafe-zones')}
      >
        <Ionicons name="warning" size={16} color={COLORS.textSecondary} />
        <Text style={styles.navButtonText}>Unsafe</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, styles.navButtonActive]}
        activeOpacity={0.8}
      >
        <Ionicons name="flame" size={16} color={COLORS.white} />
        <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Hotspots</Text>
      </TouchableOpacity>
    </View>
  );

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
            <Ionicons name="flame" size={22} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Waste Hotspots</Text>
            <Text style={styles.headerSubtitle}>
              {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''} detected
            </Text>
          </View>
        </View>

        {/* Compact Density Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.critical }]} />
            <Text style={styles.legendText}>{densityCounts.critical}</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.high }]} />
            <Text style={styles.legendText}>{densityCounts.high}</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.medium }]} />
            <Text style={styles.legendText}>{densityCounts.medium}</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.low }]} />
            <Text style={styles.legendText}>{densityCounts.low}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Navigation */}
      {renderQuickNavigation()}
    </Animated.View>
  );

  const renderBottomSheetContent = () => {
    if (!selectedHotspot) return null;

    const densityLevel = getDensityLevel(selectedHotspot.density);
    const densityColor = getDensityColor(densityLevel);

    // Mock waste breakdown data
    const wasteBreakdown = [
      { type: 'Plastic', percentage: Math.floor(Math.random() * 40) + 20 },
      { type: 'Organic', percentage: Math.floor(Math.random() * 30) + 15 },
      { type: 'Paper', percentage: Math.floor(Math.random() * 20) + 10 },
      { type: 'Other', percentage: Math.floor(Math.random() * 15) + 5 },
    ];

    return (
      <View style={styles.sheetContent}>
        {/* Density Badge */}
        <View style={[styles.densityBadge, { backgroundColor: `${densityColor}15` }]}>
          <View style={[styles.densityBadgeDot, { backgroundColor: densityColor }]} />
          <Text style={[styles.densityBadgeText, { color: densityColor }]}>
            {densityLevel.toUpperCase()} DENSITY
          </Text>
        </View>

        {/* Density Meter */}
        <View style={styles.densityMeter}>
          <View style={styles.densityMeterHeader}>
            <Text style={styles.densityMeterLabel}>Waste Density</Text>
            <Text style={[styles.densityMeterValue, { color: densityColor }]}>
              {selectedHotspot.density}%
            </Text>
          </View>
          <View style={styles.densityMeterBar}>
            <View 
              style={[
                styles.densityMeterFill, 
                { width: `${selectedHotspot.density}%`, backgroundColor: densityColor }
              ]} 
            />
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Area</Text>
              <Text style={styles.infoValue}>{selectedHotspot.name}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="radio-button-on" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Radius</Text>
              <Text style={styles.infoValue}>{selectedHotspot.radius || 400}m</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoItemText}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{selectedHotspot.lastUpdated}</Text>
            </View>
          </View>
        </View>

        {/* Waste Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Waste Composition</Text>
          <View style={styles.breakdownGrid}>
            {wasteBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownBarFill,
                      { 
                        height: `${item.percentage}%`,
                        backgroundColor: index === 0 ? '#3B82F6' : 
                                         index === 1 ? '#22C55E' :
                                         index === 2 ? '#F59E0B' : '#94A3B8'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.breakdownPercentage}>{item.percentage}%</Text>
                <Text style={styles.breakdownType}>{item.type}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Message */}
        <View style={styles.actionBox}>
          <Ionicons name="trash" size={20} color="#F59E0B" />
          <Text style={styles.actionText}>
            Cleanup teams have been notified about this hotspot.
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
          scrollEnabled={isMapInteractive}
          zoomEnabled={isMapInteractive}
          rotateEnabled={isMapInteractive}
          pitchEnabled={isMapInteractive}
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
          {/* Heatmap Circles */}
          {hotspots.map((hotspot) => {
            const circleColor = getCircleColor(hotspot.density);
            const opacity = getCircleOpacity(hotspot.density);
            const radius = hotspot.radius || 400;

            return (
              <Circle
                key={`circle-${hotspot.id}`}
                center={{
                  latitude: hotspot.latitude,
                  longitude: hotspot.longitude,
                }}
                radius={radius}
                fillColor={`${circleColor}${opacity}`}
                strokeColor={circleColor}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Hotspot Markers */}
          {hotspots.map((hotspot) => (
            <HotspotMarker
              key={hotspot.id}
              hotspot={hotspot}
              isSelected={selectedHotspot?.id === hotspot.id}
              onPress={() => handleHotspotPress(hotspot)}
            />
          ))}
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <MapBottomSheet
        visible={sheetVisible}
        title={selectedHotspot?.name || 'Hotspot Details'}
        subtitle={selectedHotspot ? `${selectedHotspot.density}% density` : undefined}
        headerColor={selectedHotspot ? getDensityColor(getDensityLevel(selectedHotspot.density)) : COLORS.headerGradientStart}
        headerIcon="flame"
        onClose={handleCloseSheet}
        onInteractionChange={handleSheetInteractionChange}
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
  densityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  densityBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  densityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Density Meter
  densityMeter: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  densityMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  densityMeterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  densityMeterValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  densityMeterBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  densityMeterFill: {
    height: '100%',
    borderRadius: 4,
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

  // Breakdown
  breakdownContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownBar: {
    width: 32,
    height: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  breakdownBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  breakdownPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  breakdownType: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  // Action Box
  actionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#92400E',
    lineHeight: 18,
  },
});
