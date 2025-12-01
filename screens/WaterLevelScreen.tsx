/**
 * WaterLevelScreen
 * Modern premium water level gauge display with rainfall data
 * Updated for 2024/2025 design standards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { WaterLevelGauge } from '@/components/ui';
import {
  generateRainfallData,
  generateWaterLevelData,
  getStatusColor,
  getWaterLevelStatus,
  type RainfallData,
  type WaterLevelData,
} from '@/utils/waterLevel';
import { useRouter } from 'expo-router';

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#0EA5E9',
  headerGradientEnd: '#0284C7',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  shadowColor: '#1E3A8A',
  primaryBlue: '#3B82F6',
  softBlue: '#E0F2FE',
  softBlueBorder: '#BAE6FD',
  deepBlue: '#1E40AF',
  yellow: '#F59E0B',
};

export default function WaterLevelScreen() {
  const router = useRouter();
  const [waterLevel] = useState<WaterLevelData>(generateWaterLevelData());
  const [rainfall] = useState<RainfallData>(generateRainfallData());

  const status = getWaterLevelStatus(waterLevel.currentLevel, waterLevel.capacity);
  const statusColor = getStatusColor(status);
  const percentage = Math.round((waterLevel.currentLevel / waterLevel.capacity) * 100);

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
            <Ionicons name="water" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Water Level Monitor</Text>
            <Text style={styles.headerSubtitle}>Real-time water level tracking</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '25' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{status.toUpperCase()}</Text>
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
        {/* Water Level Gauge */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.gaugeCardContainer}
        >
          <View style={styles.gaugeCard}>
            <WaterLevelGauge
              level={waterLevel.currentLevel}
              capacity={waterLevel.capacity}
              size={280}
              strokeWidth={24}
            />
          </View>
        </Animated.View>

        {/* Level Info Cards */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.infoCardsRow}
        >
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: COLORS.softBlue }]}>
              <Ionicons name="water" size={22} color={COLORS.primaryBlue} />
            </View>
            <Text style={styles.infoCardLabel}>Current Level</Text>
            <Text style={styles.infoCardValue}>{waterLevel.currentLevel.toFixed(2)} m</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#FEF9C3' }]}>
              <Ionicons name="speedometer" size={22} color={COLORS.yellow} />
            </View>
            <Text style={styles.infoCardLabel}>Capacity</Text>
            <Text style={styles.infoCardValue}>{percentage}% filled</Text>
          </View>
        </Animated.View>

        {/* Rainfall Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.rainfallCardContainer}
        >
          <View style={styles.rainfallCard}>
            <View style={styles.rainfallHeader}>
              <View style={styles.rainfallHeaderLeft}>
                <View style={styles.rainfallIconContainer}>
                  <Ionicons name="rainy" size={26} color={COLORS.deepBlue} />
                </View>
                <View>
                  <Text style={styles.rainfallTitle}>Rainfall Data</Text>
                  <Text style={styles.rainfallSubtitle}>Precipitation tracking</Text>
                </View>
              </View>
            </View>

            <View style={styles.rainfallStats}>
              <View style={styles.rainfallStat}>
                <Text style={styles.rainfallStatLabel}>Today</Text>
                <Text style={styles.rainfallStatValue}>{rainfall.today} mm</Text>
              </View>
              <View style={styles.rainfallStat}>
                <Text style={styles.rainfallStatLabel}>Yesterday</Text>
                <Text style={styles.rainfallStatValue}>{rainfall.yesterday} mm</Text>
              </View>
              <View style={styles.rainfallStat}>
                <Text style={styles.rainfallStatLabel}>This Week</Text>
                <Text style={styles.rainfallStatValue}>{rainfall.weekTotal} mm</Text>
              </View>
              <View style={styles.rainfallStat}>
                <Text style={styles.rainfallStatLabel}>This Month</Text>
                <Text style={styles.rainfallStatValue}>{rainfall.monthTotal} mm</Text>
              </View>
            </View>

            <View style={styles.rainfallFooter}>
              <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.rainfallFooterText}>
                Updated: {new Date(rainfall.lastUpdated).toLocaleTimeString()}
              </Text>
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
    top: 50,
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
    paddingTop: 12,
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
    fontSize: 22,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Gauge Card
  gaugeCardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    width: '100%',
  },

  // Info Cards
  infoCardsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    padding: 18,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  infoIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoCardLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Rainfall Card
  rainfallCardContainer: {
    marginBottom: 20,
  },
  rainfallCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 22,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  rainfallHeader: {
    marginBottom: 20,
  },
  rainfallHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rainfallIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainfallTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  rainfallSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  rainfallStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  rainfallStat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  rainfallStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rainfallStatValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rainfallFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  rainfallFooterText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
