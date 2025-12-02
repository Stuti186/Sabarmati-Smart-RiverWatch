/**
 * ReportCard Component
 * Card displaying a user report with status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import StatusChip from './StatusChip';
import { colors, gradients, shadows } from '@/theme';
import {
  CitizenReport,
  getReportStatusColor,
  getReportStatusLabel,
} from '@/services/reports';
import { ISSUE_TYPES } from '@/constants';

const { width } = Dimensions.get('window');

interface ReportCardProps {
  report: CitizenReport;
  onPress?: () => void;
  delay?: number;
}

const issueTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  [ISSUE_TYPES.WASTE]: 'trash',
  [ISSUE_TYPES.POLLUTION]: 'warning',
  [ISSUE_TYPES.SAFETY]: 'shield',
  [ISSUE_TYPES.VANDALISM]: 'construct',
  [ISSUE_TYPES.OTHER]: 'ellipse',
};

export default function ReportCard({
  report,
  onPress,
  delay = 0,
}: ReportCardProps) {
  const statusColor = getReportStatusColor(report.status);
  const statusLabel = getReportStatusLabel(report.status);
  const issueIcon = issueTypeIcons[report.issueType] || 'ellipse';

  // Format timestamp
  const formatTimestamp = (timestamp: Date | any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusChipType = (status: CitizenReport['status']): 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'resolved':
        return 'success';
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}>
        <BlurView intensity={80} tint="light" style={styles.blurCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: statusColor + '20' },
                ]}>
                <Ionicons name={issueIcon} size={20} color={statusColor} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.issueType}>
                  {report.issueType.charAt(0).toUpperCase() +
                    report.issueType.slice(1)}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(report.timestamp)}
                </Text>
              </View>
            </View>
            <StatusChip
              status={getStatusChipType(report.status)}
              label={statusLabel}
              size="sm"
            />
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={3}>
            {report.description}
          </Text>

          {/* Image Preview */}
          {report.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: report.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Ionicons
                name="location"
                size={14}
                color={colors.text.secondary.light}
              />
              <Text style={styles.footerText}>
                {report.location.latitude.toFixed(4)},{' '}
                {report.location.longitude.toFixed(4)}
              </Text>
            </View>
            {report.imageUrl && (
              <View style={styles.footerItem}>
                <Ionicons
                  name="image"
                  size={14}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.footerText}>Photo attached</Text>
              </View>
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  blurCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  issueType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  description: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
});

