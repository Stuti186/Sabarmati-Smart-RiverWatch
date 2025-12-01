/**
 * ExpandableAlert Component
 * Expandable safety alert item with icon, text, and severity
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import StatusChip from './StatusChip';
import GlassCard from './GlassCard';
import { colors } from '@/theme';
import {
  type SafetyAlert,
  getSafetySeverityColor,
  getSafetySeverityStatus,
  getAlertIcon,
} from '@/utils/safetyAlerts';

interface ExpandableAlertProps extends ViewProps {
  alert: SafetyAlert;
  delay?: number;
}

export default function ExpandableAlert({
  alert,
  delay = 0,
  style,
  ...props
}: ExpandableAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const severityColor = getSafetySeverityColor(alert.severity);
  const statusType = getSafetySeverityStatus(alert.severity);
  const alertIcon = getAlertIcon(alert.category);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 90, {
      damping: 15,
      stiffness: 100,
    });
    height.value = withTiming(isExpanded ? 0 : 1, { duration: 300 });
    opacity.value = withTiming(isExpanded ? 0 : 1, { duration: 300 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: height.value === 1 ? 1000 : 0,
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]} {...props}>
      <GlassCard intensity={80} tint="light" style={styles.card}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.8}
          style={styles.header}>
          {/* Alert Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: severityColor + '20' },
            ]}>
            <Ionicons name={alertIcon} size={24} color={severityColor} />
          </View>

          {/* Alert Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {alert.title}
              </Text>
              <StatusChip
                status={statusType}
                label={alert.severity.toUpperCase()}
                size="sm"
              />
            </View>
            <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
              {alert.description}
            </Text>
            {alert.location && (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={12}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.location}>{alert.location}</Text>
              </View>
            )}
          </View>

          {/* Chevron Icon */}
          <Animated.View style={chevronStyle}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.text.secondary.light}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Expanded Content */}
        <Animated.View style={[styles.expandedContent, contentStyle]}>
          {alert.details && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>Details</Text>
              <Text style={styles.detailsText}>{alert.details}</Text>
            </View>
          )}

          {alert.actionRequired && (
            <View
              style={[
                styles.actionSection,
                { backgroundColor: severityColor + '15' },
              ]}>
              <Ionicons
                name="information-circle"
                size={18}
                color={severityColor}
              />
              <Text
                style={[styles.actionText, { color: severityColor }]}
                numberOfLines={3}>
                {alert.actionRequired}
              </Text>
            </View>
          )}

          {alert.reportedBy && (
            <View style={styles.metaSection}>
              <Ionicons
                name="person-outline"
                size={14}
                color={colors.text.secondary.light}
              />
              <Text style={styles.metaText}>Reported by: {alert.reportedBy}</Text>
            </View>
          )}
        </Animated.View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  description: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  detailsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary.light,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsText: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginTop: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
});

