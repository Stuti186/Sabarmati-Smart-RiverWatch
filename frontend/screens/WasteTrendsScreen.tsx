/**
 * WasteTrendsScreen
 * Modern premium bar and pie charts for waste detection analytics
 * Updated for 2024/2025 design standards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import {
  generateDailyDetections,
  generateWasteCategories,
  getTotalDetections,
  type DailyDetection,
  type WasteCategory,
} from '@/utils/wasteTrends';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const chartWidth = width - 80;

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
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  primaryBlue: '#3B82F6',
  softBlue: '#E0F2FE',
  softBlueBorder: '#BAE6FD',
  green: '#22C55E',
  yellow: '#F59E0B',
};

export default function WasteTrendsScreen() {
  const router = useRouter();
  const [dailyData] = useState<DailyDetection[]>(generateDailyDetections());
  const [wasteCategories] = useState<WasteCategory[]>(generateWasteCategories());

  const totalDetections = getTotalDetections(wasteCategories);

  const barChartData = {
    labels: dailyData.map((d) => d.label),
    datasets: [{ data: dailyData.map((d) => d.count) }],
  };

  const pieChartData = wasteCategories.map((category) => ({
    name: category.name,
    population: category.count,
    color: category.color,
    legendFontColor: COLORS.textPrimary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: () => COLORS.primaryBlue,
    labelColor: () => COLORS.textSecondary,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(0,0,0,0.06)',
      strokeWidth: 1,
    },
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
            <Ionicons name="analytics" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Waste Trends</Text>
            <Text style={styles.headerSubtitle}>Detection analytics</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{totalDetections}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        {/* Daily Detections Bar Chart */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.chartCardContainer}
        >
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartIconContainer}>
                <Ionicons name="bar-chart" size={20} color={COLORS.primaryBlue} />
              </View>
              <View>
                <Text style={styles.chartTitle}>Daily Detections</Text>
                <Text style={styles.chartSubtitle}>Last 7 days</Text>
              </View>
            </View>
            <View style={styles.chartWrapper}>
              <BarChart
                data={barChartData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                withInnerLines
                showValuesOnTopOfBars
                fromZero
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                segments={4}
              />
            </View>
          </View>
        </Animated.View>

        {/* Waste Categories Pie Chart */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.chartCardContainer}
        >
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartIconContainer}>
                <Ionicons name="pie-chart" size={20} color={COLORS.primaryBlue} />
              </View>
              <View>
                <Text style={styles.chartTitle}>Waste Categories</Text>
                <Text style={styles.chartSubtitle}>Distribution by type</Text>
              </View>
            </View>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={pieChartData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>

            {/* Category Legend */}
            <View style={styles.legendContainer}>
              {wasteCategories.map((category) => (
                <View key={category.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendName}>{category.name}</Text>
                    <Text style={styles.legendCount}>
                      {category.count} ({Math.round((category.count / totalDetections) * 100)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Summary Stats */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.summaryCardContainer}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Weekly Summary</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryIconContainer, { backgroundColor: COLORS.softBlue }]}>
                  <Ionicons name="trending-up" size={22} color={COLORS.primaryBlue} />
                </View>
                <Text style={styles.summaryValue}>
                  {dailyData.reduce((sum, d) => sum + d.count, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Total Detections</Text>
              </View>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryIconContainer, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="calendar" size={22} color={COLORS.green} />
                </View>
                <Text style={styles.summaryValue}>
                  {Math.round(dailyData.reduce((sum, d) => sum + d.count, 0) / 7)}
                </Text>
                <Text style={styles.summaryLabel}>Daily Average</Text>
              </View>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF9C3' }]}>
                  <Ionicons name="trophy" size={22} color={COLORS.yellow} />
                </View>
                <Text style={styles.summaryValue}>
                  {Math.max(...dailyData.map((d) => d.count))}
                </Text>
                <Text style={styles.summaryLabel}>Peak Day</Text>
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
    paddingTop: 80,
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
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  // Legend
  legendContainer: {
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  legendCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Summary Card
  summaryCardContainer: {
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.softBlueBorder,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 18,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
