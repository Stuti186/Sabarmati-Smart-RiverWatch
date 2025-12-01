/**
 * RewardPointsScreen
 * Modern premium reward points display with animated counter and level system
 * Updated for 2024/2025 design standards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import {
  CircularProgress,
  AnimatedCounter,
  LevelBadge,
} from '@/components/ui';
import {
  getRewardLevel,
  getLevelConfig,
  getProgressToNextLevel,
  getPointsForNextLevel,
  formatPoints,
  getPointsBreakdown,
} from '@/utils/rewardPoints';

const { width } = Dimensions.get('window');

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#8B5CF6',
  headerGradientEnd: '#6D28D9',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  // Status colors
  gold: '#F59E0B',
  silver: '#64748B',
  bronze: '#D97706',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  // Card
  softPurple: '#F3E8FF',
  softBlue: '#E0F2FE',
  softGreen: '#DCFCE7',
};

export default function RewardPointsScreen() {
  const router = useRouter();
  const [userPoints] = useState(1250);
  const [displayPoints, setDisplayPoints] = useState(0);

  const level = getRewardLevel(userPoints);
  const levelConfig = getLevelConfig(userPoints);
  const progress = getProgressToNextLevel(userPoints);
  const pointsNeeded = getPointsForNextLevel(userPoints);
  const breakdown = getPointsBreakdown(userPoints);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPoints(userPoints);
    }, 100);
    return () => clearTimeout(timer);
  }, [userPoints]);

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
            <Ionicons name="trophy" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Reward Points</Text>
            <Text style={styles.headerSubtitle}>Track your contributions</Text>
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
        {/* Points Display Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.pointsCardContainer}
        >
          <View style={styles.pointsCard}>
            {/* Level Badge */}
            <View style={styles.levelBadgeContainer}>
              <LevelBadge level={level} size="lg" delay={200} />
            </View>

            {/* Animated Points Counter */}
            <View style={styles.pointsCounter}>
              <AnimatedCounter
                value={userPoints}
                duration={2000}
                style={styles.pointsText}
                formatter={(val) => formatPoints(val)}
              />
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>

            {/* Progress to Next Level */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress to Next Level</Text>
                <Text style={styles.progressPoints}>
                  {pointsNeeded > 0
                    ? `${formatPoints(pointsNeeded)} points needed`
                    : 'Max Level Achieved!'}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={levelConfig.gradient as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(progress)}% Complete
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Circular Progress Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.circularCardContainer}
        >
          <View style={styles.circularCard}>
            <CircularProgress
              value={progress}
              size={200}
              strokeWidth={20}
              label={levelConfig.name}
              showPercentage={false}
              gradient={
                level === 'gold'
                  ? 'warning'
                  : level === 'silver'
                  ? 'primary'
                  : 'success'
              }
            />
            <View style={styles.circularInfo}>
              <Text style={styles.circularTitle}>Current Level</Text>
              <Text style={styles.circularSubtitle}>
                {pointsNeeded > 0
                  ? `${formatPoints(pointsNeeded)} to ${getLevelConfig(userPoints + pointsNeeded).name}`
                  : "You've reached the highest level!"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Points Breakdown */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.breakdownCardContainer}
        >
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Points Breakdown</Text>
            <Text style={styles.breakdownSubtitle}>
              Your contributions by category
            </Text>
            <View style={styles.breakdownList}>
              {breakdown.map((item, index) => (
                <Animated.View
                  key={item.category}
                  entering={FadeInDown.duration(400).delay(400 + index * 50)}
                  style={styles.breakdownItem}
                >
                  <View style={styles.breakdownItemLeft}>
                    <View
                      style={[
                        styles.breakdownIcon,
                        { backgroundColor: item.color + '20' },
                      ]}
                    >
                      <Ionicons name={item.icon} size={24} color={item.color} />
                    </View>
                    <View style={styles.breakdownText}>
                      <Text style={styles.breakdownCategory}>{item.category}</Text>
                      <Text style={styles.breakdownPoints}>
                        {formatPoints(item.points)} points
                      </Text>
                    </View>
                  </View>
                  <View style={styles.breakdownPercentage}>
                    <Text style={styles.breakdownPercentageText}>
                      {Math.round((item.points / userPoints) * 100)}%
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* How to Earn Points */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.earnCardContainer}
        >
          <View style={styles.earnCard}>
            <View style={styles.earnHeader}>
              <View style={styles.earnIconContainer}>
                <Ionicons name="bulb" size={22} color={COLORS.purple} />
              </View>
              <Text style={styles.earnTitle}>How to Earn Points</Text>
            </View>
            <View style={styles.earnList}>
              <View style={styles.earnItem}>
                <View style={[styles.earnItemIcon, { backgroundColor: COLORS.softGreen }]}>
                  <Ionicons name="document-text" size={18} color={COLORS.green} />
                </View>
                <Text style={styles.earnText}>
                  Submit a report: <Text style={styles.earnPoints}>+50 points</Text>
                </Text>
              </View>
              <View style={styles.earnItem}>
                <View style={[styles.earnItemIcon, { backgroundColor: COLORS.softBlue }]}>
                  <Ionicons name="calendar" size={18} color={COLORS.blue} />
                </View>
                <Text style={styles.earnText}>
                  Attend an event: <Text style={styles.earnPoints}>+100 points</Text>
                </Text>
              </View>
              <View style={styles.earnItem}>
                <View style={[styles.earnItemIcon, { backgroundColor: '#FEF9C3' }]}>
                  <Ionicons name="trash" size={18} color={COLORS.gold} />
                </View>
                <Text style={styles.earnText}>
                  Report waste: <Text style={styles.earnPoints}>+30 points</Text>
                </Text>
              </View>
              <View style={styles.earnItem}>
                <View style={[styles.earnItemIcon, { backgroundColor: COLORS.softPurple }]}>
                  <Ionicons name="people" size={18} color={COLORS.purple} />
                </View>
                <Text style={styles.earnText}>
                  Community engagement: <Text style={styles.earnPoints}>+25 points</Text>
                </Text>
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
    fontSize: 14,
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

  // Points Card
  pointsCardContainer: {
    marginBottom: 18,
  },
  pointsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  levelBadgeContainer: {
    marginBottom: 16,
  },
  pointsCounter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsText: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  pointsLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressSection: {
    width: '100%',
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressPoints: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'right',
    fontWeight: '500',
  },

  // Circular Card
  circularCardContainer: {
    marginBottom: 18,
  },
  circularCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  circularInfo: {
    marginTop: 28,
    alignItems: 'center',
  },
  circularTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  circularSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Breakdown Card
  breakdownCardContainer: {
    marginBottom: 18,
  },
  breakdownCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 22,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  breakdownSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 20,
    fontWeight: '500',
  },
  breakdownList: {
    gap: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  breakdownText: {
    flex: 1,
  },
  breakdownCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  breakdownPoints: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  breakdownPercentage: {
    marginLeft: 12,
  },
  breakdownPercentageText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.blue,
  },

  // Earn Card
  earnCardContainer: {
    marginBottom: 18,
  },
  earnCard: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  earnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  earnIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  earnTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  earnList: {
    gap: 14,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  earnText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  earnPoints: {
    fontWeight: '700',
    color: COLORS.green,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
