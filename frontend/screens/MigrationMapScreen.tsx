/**
 * MigrationMapScreen
 * Interactive map showing bird migration paths and seasonal patterns
 */

import React, { useState, useMemo, Fragment, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { type MigrationPattern } from '@/utils/biodiversity';
import { biodiversityApi } from '@/services/biodiversityApi';
import { getDefaultMigrationPatterns } from '@/services/offlineData';
import { MAP_CONFIG } from '@/constants';

const { width, height } = Dimensions.get('window');

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
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function MigrationMapScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [migrationPatterns, setMigrationPatterns] = useState<MigrationPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMigrationPatterns();
  }, []);

  const loadMigrationPatterns = async () => {
    try {
      setLoading(true);
      const result = await biodiversityApi.getMigrationPatterns();
      setMigrationPatterns(result.data || []);
    } catch (error) {
      console.error('Error loading migration patterns:', error);
      // Use default patterns
      setMigrationPatterns(getDefaultMigrationPatterns() as any);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatterns = useMemo(() => {
    if (!migrationPatterns || migrationPatterns.length === 0) return [];
    
    return migrationPatterns.filter((pattern) => {
      if (showActiveOnly) {
        return (
          pattern.startMonth <= selectedMonth &&
          pattern.endMonth >= selectedMonth &&
          pattern.activityLevel === 'high'
        );
      }
      return pattern.startMonth <= selectedMonth && pattern.endMonth >= selectedMonth;
    });
  }, [migrationPatterns, selectedMonth, showActiveOnly]);

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high':
        return '#EF4444';
      case 'moderate':
        return '#FACC15';
      case 'low':
        return '#22C55E';
      default:
        return '#94A3B8';
    }
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
          <Text style={styles.headerTitle}>Migration Map</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Map */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: MAP_CONFIG.DEFAULT_LATITUDE,
            longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
            latitudeDelta: MAP_CONFIG.REGION_DELTA.latitudeDelta * 2,
            longitudeDelta: MAP_CONFIG.REGION_DELTA.longitudeDelta * 2,
          }}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading Sabarmati migration patterns...</Text>
            </View>
          ) : (
            filteredPatterns.map((pattern, index) => (
            <Fragment key={`${pattern.speciesId}-${index}`}>
              <Polyline
                coordinates={pattern.pathCoordinates}
                strokeColor={getActivityColor(pattern.activityLevel)}
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
              {pattern.pathCoordinates.map((coord, coordIndex) => (
                <Marker
                  key={coordIndex}
                  coordinate={coord}
                  title={pattern.speciesName}
                  description={`Activity: ${pattern.activityLevel}`}>
                  <View
                    style={[
                      styles.marker,
                      { backgroundColor: getActivityColor(pattern.activityLevel) },
                    ]}>
                  <Ionicons name="leaf" size={16} color={COLORS.white} />
                  </View>
                </Marker>
              ))}
            </Fragment>
            ))
          )}
        </MapView>

        {/* Controls Overlay */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.controlsOverlay}>
          <BlurView intensity={80} tint="light" style={styles.controlsCard}>
            {/* Month Selector */}
            <View style={styles.monthSelector}>
              <Text style={styles.controlsLabel}>Month</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.monthScroll}>
                {MONTHS.map((month, index) => {
                  const monthNum = index + 1;
                  const isSelected = selectedMonth === monthNum;
                  return (
                    <TouchableOpacity
                      key={month}
                      onPress={() => setSelectedMonth(monthNum)}
                      style={[
                        styles.monthChip,
                        isSelected && styles.monthChipSelected,
                      ]}>
                      <Text
                        style={[
                          styles.monthChipText,
                          isSelected && styles.monthChipTextSelected,
                        ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Toggle */}
            <TouchableOpacity
              onPress={() => setShowActiveOnly(!showActiveOnly)}
              style={styles.toggleButton}>
              <View
                style={[
                  styles.toggleIndicator,
                  showActiveOnly && styles.toggleIndicatorActive,
                ]}>
                <Ionicons
                  name={showActiveOnly ? 'checkmark' : 'close'}
                  size={16}
                  color={showActiveOnly ? COLORS.white : COLORS.textMuted}
                />
              </View>
              <Text style={styles.toggleText}>Show Active Migration Only</Text>
            </TouchableOpacity>

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Activity Level</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>High</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FACC15' }]} />
                  <Text style={styles.legendText}>Moderate</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                  <Text style={styles.legendText}>Low</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  controlsCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  monthSelector: {
    marginBottom: 16,
  },
  controlsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  monthScroll: {
    paddingRight: 20,
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 8,
  },
  monthChipSelected: {
    backgroundColor: COLORS.textWhite,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  monthChipTextSelected: {
    color: COLORS.textPrimary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleIndicatorActive: {
    backgroundColor: '#22C55E',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  legend: {
    marginTop: 8,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

