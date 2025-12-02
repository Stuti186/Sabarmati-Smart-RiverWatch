/**
 * StatCard Component
 * Beautiful stat card for displaying water quality parameters
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, gradients, shadows } from '@/theme';
import AnimatedCounter from './AnimatedCounter';

export type StatusType = 'good' | 'moderate' | 'bad';

interface StatCardProps extends ViewProps {
  title: string;
  value: number | string;
  unit: string;
  status: StatusType;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: string;
  delay?: number;
  animateValue?: boolean; // Use AnimatedCounter for numeric values
}

const statusConfig = {
  good: {
    color: colors.ecoGreen[500],
    bgColor: colors.ecoGreen[50],
    borderColor: colors.ecoGreen[200],
    gradient: gradients.status.success,
    label: 'Good',
  },
  moderate: {
    color: colors.warning[500],
    bgColor: colors.warning[50],
    borderColor: colors.warning[200],
    gradient: gradients.status.warning,
    label: 'Moderate',
  },
  bad: {
    color: colors.alert[500],
    bgColor: colors.alert[50],
    borderColor: colors.alert[200],
    gradient: gradients.status.alert,
    label: 'Bad',
  },
};

export default function StatCard({
  title,
  value,
  unit,
  status,
  icon,
  trend,
  lastUpdated,
  delay = 0,
  animateValue = false,
  style,
  ...props
}: StatCardProps) {
  const config = statusConfig[status];
  const isNumeric = typeof value === 'number';

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={[styles.container, style]}
      {...props}>
      <LinearGradient
        colors={config.gradient.colors}
        start={config.gradient.start}
        end={config.gradient.end}
        style={styles.gradient}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
              {icon && (
                <Ionicons name={icon} size={24} color={config.color} />
              )}
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: config.color }]} />
              <Text style={[styles.statusText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Value */}
          <View style={styles.valueContainer}>
            {isNumeric && animateValue ? (
              <AnimatedCounter
                value={value}
                duration={1500}
                style={styles.value}
                formatter={(val) => val.toFixed(1)}
              />
            ) : (
              <Text style={styles.value}>{value}</Text>
            )}
            <Text style={styles.unit}>{unit}</Text>
          </View>

          {/* Trend Indicator */}
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons
                name={
                  trend === 'up'
                    ? 'trending-up'
                    : trend === 'down'
                    ? 'trending-down'
                    : 'remove'
                }
                size={16}
                color={
                  trend === 'up'
                    ? colors.ecoGreen[600]
                    : trend === 'down'
                    ? colors.alert[600]
                    : colors.gray[500]
                }
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      trend === 'up'
                        ? colors.ecoGreen[600]
                        : trend === 'down'
                        ? colors.alert[600]
                        : colors.gray[500],
                  },
                ]}>
                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
              </Text>
            </View>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <Text style={styles.lastUpdated}>Updated: {lastUpdated}</Text>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    padding: 20,
    minHeight: 160,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse.light,
    opacity: 0.9,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.inverse.light,
    marginRight: 8,
  },
  unit: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.inverse.light,
    opacity: 0.8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  lastUpdated: {
    fontSize: 10,
    color: colors.text.inverse.light,
    opacity: 0.6,
    marginTop: 8,
  },
});

