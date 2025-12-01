/**
 * FloodPredictionScreen
 * Modern premium 48-hour flood forecast with risk indicator
 * Updated for 2024/2025 design standards
 */

import {
  generateFloodForecast,
  getFloodRiskColor,
  getFloodRiskStatus,
  getRiskDescription,
  type FloodRiskData,
} from '@/utils/floodPrediction';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const chartWidth = width - 80;

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#3B82F6',
  headerGradientEnd: '#1E40AF',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  // Status colors
  low: '#22C55E',
  moderate: '#FACC15',
  high: '#EF4444',
  // Card backgrounds
  softBlue: '#E0F2FE',
  softBlueBorder: '#BAE6FD',
};

// Status Badge Component
const StatusBadge = ({ status }: { status: 'low' | 'moderate' | 'high' }) => {
  const config = {
    low: { color: COLORS.low, gradient: ['#4ADE80', '#22C55E'] as const, label: 'LOW' },
    moderate: { color: COLORS.moderate, gradient: ['#FDE047', '#EAB308'] as const, label: 'MODERATE' },
    high: { color: COLORS.high, gradient: ['#F87171', '#EF4444'] as const, label: 'HIGH' },
  };
  const c = config[status];

  return (
    <LinearGradient
      colors={c.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statusBadge}
    >
      <Ionicons
        name={status === 'high' ? 'warning' : status === 'moderate' ? 'alert-circle' : 'checkmark-circle'}
        size={14}
        color={COLORS.white}
      />
      <Text style={styles.statusBadgeText}>{c.label}</Text>
    </LinearGradient>
  );
};

export default function FloodPredictionScreen() {
  const router = useRouter();
  const [floodData] = useState<FloodRiskData>(generateFloodForecast());

  const riskStatus = floodData.status;
  const riskColor = getFloodRiskColor(riskStatus);
  const riskDescription = getRiskDescription(riskStatus);

  const chartData = {
    labels: floodData.forecast.map((f) => f.label),
    datasets: [{ data: floodData.forecast.map((f) => f.riskLevel) }],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: () => riskColor,
    labelColor: () => COLORS.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '5',
      strokeWidth: '3',
      stroke: riskColor,
      fill: COLORS.white,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(0,0,0,0.08)',
      strokeWidth: 1,
    },
    fillShadowGradient: riskColor,
    fillShadowGradientOpacity: 0.15,
    propsForVerticalLabels: { fontSize: 10, fill: COLORS.textMuted },
    propsForHorizontalLabels: { fontSize: 10, fill: COLORS.textMuted },
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
            <Ionicons name="rainy" size={24} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Flood Prediction</Text>
            <Text style={styles.headerSubtitle}>
              48-hour forecast • Updated: {new Date(floodData.lastUpdated).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Indicator Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.riskCardContainer}
        >
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View style={styles.riskHeaderLeft}>
                <View style={[styles.riskIconContainer, { backgroundColor: riskColor + '18' }]}>
                  <Ionicons
                    name={riskStatus === 'high' ? 'warning' : riskStatus === 'moderate' ? 'alert-circle' : 'checkmark-circle'}
                    size={32}
                    color={riskColor}
                  />
                </View>
                <View style={styles.riskTextContainer}>
                  <Text style={styles.riskTitle}>Flood Risk Status</Text>
                  <Text style={styles.riskDescription}>{riskDescription}</Text>
                </View>
              </View>
              <StatusBadge status={riskStatus} />
            </View>

            {/* Risk Stats */}
            <View style={styles.riskStats}>
              <View style={styles.riskStat}>
                <Text style={styles.riskStatLabel}>Current Risk</Text>
                <Text style={[styles.riskStatValue, { color: riskColor }]}>
                  {floodData.currentRisk}%
                </Text>
              </View>
              <View style={styles.riskStatDivider} />
              <View style={styles.riskStat}>
                <Text style={styles.riskStatLabel}>Peak Risk (48h)</Text>
                <Text style={[styles.riskStatValue, { color: riskColor }]}>
                  {floodData.maxRisk}%
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Chart Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.chartCardContainer}
        >
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartIconContainer}>
                <Ionicons name="trending-up" size={20} color={COLORS.headerGradientStart} />
              </View>
              <View>
                <Text style={styles.chartTitle}>48-Hour Risk Forecast</Text>
                <Text style={styles.chartSubtitle}>Flood risk prediction</Text>
              </View>
            </View>
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={240}
                chartConfig={chartConfig}
                bezier
                withInnerLines
                withOuterLines={false}
                withDots
                withShadow
                segments={4}
                style={styles.chart}
                yAxisSuffix="%"
                fromZero
              />
            </View>
          </View>
        </Animated.View>

        {/* Timeline Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.timelineCardContainer}
        >
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Forecast Timeline</Text>
            <View style={styles.timeline}>
              {floodData.forecast.slice(0, 6).map((point, index) => {
                const pointStatus = getFloodRiskStatus(point.riskLevel);
                const pointColor = getFloodRiskColor(pointStatus);
                return (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: pointColor }]} />
                      <Text style={styles.timelineLabel}>{point.label}</Text>
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={[styles.timelineRisk, { color: pointColor }]}>
                        {point.riskLevel}%
                      </Text>
                      <Text style={styles.timelineLevel}>{point.waterLevel}m</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Legend Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.legendCardContainer}
        >
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>Risk Levels</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.low }]} />
                <Text style={styles.legendText}>Low (0-39%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.moderate }]} />
                <Text style={styles.legendText}>Moderate (40-69%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.high }]} />
                <Text style={styles.legendText}>High (70-100%)</Text>
              </View>
            </View>
          </View>
        </Animated.View>

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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Risk Card
  riskCardContainer: {
    marginBottom: 18,
  },
  riskCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  riskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  riskIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskTextContainer: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  riskStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  riskStat: {
    flex: 1,
    alignItems: 'center',
  },
  riskStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    marginHorizontal: 16,
  },
  riskStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  riskStatValue: {
    fontSize: 36,
    fontWeight: '700',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.6,
  },

  // Chart Card
  chartCardContainer: {
    marginBottom: 18,
  },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  chartIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  chartWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  // Timeline Card
  timelineCardContainer: {
    marginBottom: 18,
  },
  timelineCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 18,
  },
  timeline: {
    gap: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.4)',
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timelineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  timelineRisk: {
    fontSize: 17,
    fontWeight: '700',
    minWidth: 55,
    textAlign: 'right',
  },
  timelineLevel: {
    fontSize: 14,
    color: COLORS.textMuted,
    minWidth: 55,
    textAlign: 'right',
    fontWeight: '500',
  },

  // Legend Card
  legendCardContainer: {
    marginBottom: 18,
  },
  legendCard: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.softBlueBorder,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
