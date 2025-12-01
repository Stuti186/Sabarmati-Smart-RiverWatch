/**
 * WaterQualityGraphsScreen
 * Modern premium line charts for water quality parameters
 * Updated for 2024/2025 design standards
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ChartContainer, WaterQualityChart } from '@/components/ui';
import { WATER_QUALITY_PARAMS } from '@/constants';
import {
  generateLabels,
  generatepHData,
  generateDOData,
  generateBODData,
  generateCODData,
  generateTDSData,
  generateTurbidityData,
  generateMicrobialLoadData,
  type TimePeriod,
} from '@/utils/chartData';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#06B6D4',
  headerGradientEnd: '#0891B2',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  primaryBlue: '#3B82F6',
  softBlue: '#E0F2FE',
  activeToggle: '#3B82F6',
  inactiveToggle: 'rgba(255, 255, 255, 0.15)',
  // Parameter colors
  ph: '#3B82F6',
  do: '#22C55E',
  bod: '#F59E0B',
  cod: '#EF4444',
  tds: '#1E40AF',
  turbidity: '#D97706',
  microbial: '#DC2626',
};

const timePeriods: TimePeriod[] = ['24h', '7d', '30d'];

const parameters = [
  {
    key: 'pH',
    title: 'pH Level',
    icon: 'water' as const,
    unit: WATER_QUALITY_PARAMS.pH.unit,
    color: COLORS.ph,
    generateData: generatepHData,
    minValue: 6.0,
    maxValue: 9.0,
  },
  {
    key: 'DO',
    title: 'Dissolved Oxygen',
    icon: 'airplane' as const,
    unit: WATER_QUALITY_PARAMS.DO.unit,
    color: COLORS.do,
    generateData: generateDOData,
    minValue: 0,
    maxValue: 20,
  },
  {
    key: 'BOD',
    title: 'BOD',
    icon: 'leaf' as const,
    unit: WATER_QUALITY_PARAMS.BOD.unit,
    color: COLORS.bod,
    generateData: generateBODData,
    minValue: 0,
    maxValue: 5,
  },
  {
    key: 'COD',
    title: 'COD',
    icon: 'flask' as const,
    unit: WATER_QUALITY_PARAMS.COD.unit,
    color: COLORS.cod,
    generateData: generateCODData,
    minValue: 0,
    maxValue: 300,
  },
  {
    key: 'TDS',
    title: 'TDS',
    icon: 'cube' as const,
    unit: WATER_QUALITY_PARAMS.TDS.unit,
    color: COLORS.tds,
    generateData: generateTDSData,
    minValue: 0,
    maxValue: 600,
  },
  {
    key: 'Turbidity',
    title: 'Turbidity',
    icon: 'cloudy' as const,
    unit: WATER_QUALITY_PARAMS.TURBIDITY.unit,
    color: COLORS.turbidity,
    generateData: generateTurbidityData,
    minValue: 0,
    maxValue: 6,
  },
  {
    key: 'MicrobialLoad',
    title: 'Microbial Load',
    icon: 'bug' as const,
    unit: 'CFU/mL',
    color: COLORS.microbial,
    generateData: generateMicrobialLoadData,
    minValue: 0,
    maxValue: 800,
  },
];

export default function WaterQualityGraphsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h');
  const scrollViewRef = useRef<ScrollView>(null);

  const labels = generateLabels(selectedPeriod);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerTitleSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="stats-chart" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Water Quality Trends</Text>
            <Text style={styles.headerSubtitle}>Historical data visualization</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTimePeriodToggle = () => (
    <Animated.View
      entering={FadeInUp.duration(600).delay(100)}
      style={styles.toggleContainer}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={85} tint="light" style={styles.toggleBlur}>
          {renderToggleButtons()}
        </BlurView>
      ) : (
        <View style={styles.toggleAndroid}>
          {renderToggleButtons()}
        </View>
      )}
    </Animated.View>
  );

  const renderToggleButtons = () => (
    <View style={styles.toggleButtons}>
      {timePeriods.map((period) => (
        <TouchableOpacity
          key={period}
          onPress={() => handlePeriodChange(period)}
          activeOpacity={0.7}
          style={[
            styles.toggleButton,
            selectedPeriod === period && styles.toggleButtonActive,
          ]}
        >
          {selectedPeriod === period ? (
            <LinearGradient
              colors={[COLORS.activeToggle, '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.toggleGradient}
            >
              <Text style={styles.toggleTextActive}>{period}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.toggleText}>{period}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Custom Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Header */}
      {renderHeader()}

      {/* Time Period Toggle */}
      {renderTimePeriodToggle()}

      {/* Charts */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {parameters.map((param, index) => {
          const data = param.generateData(selectedPeriod);

          return (
            <Animated.View
              key={param.key}
              entering={FadeInDown.duration(500).delay(150 + index * 60)}
              style={styles.chartCardContainer}
            >
              <ChartContainer
                title={param.title}
                icon={param.icon}
                variant="glass"
                style={styles.chartCard}
              >
                <WaterQualityChart
                  title={param.title}
                  data={data}
                  labels={labels}
                  unit={param.unit}
                  color={param.color}
                  {...({ minValue: param.minValue, maxValue: param.maxValue } as any)}
                  delay={0}
                />
              </ChartContainer>
            </Animated.View>
          );
        })}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Custom Back Button
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Toggle Styles
  toggleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 9,
  },
  toggleBlur: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  toggleAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  toggleButtons: {
    flexDirection: 'row',
    padding: 5,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 3,
  },
  toggleButtonActive: {
    shadowColor: COLORS.activeToggle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  toggleTextActive: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Chart Card
  chartCardContainer: {
    marginBottom: 18,
  },
  chartCard: {
    // Additional styling if needed
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
