/**
 * WasteCard Component
 * Modern premium card displaying AI-detected waste with severity badge
 * Updated to match the 2024/2025 design system
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;

export type WasteSeverity = 'low' | 'medium' | 'high';

interface WasteCardProps {
  imageUrl?: string;
  severity: WasteSeverity;
  wasteType: string;
  timestamp: string;
  location?: string;
  delay?: number;
}

// Modern Color Palette
const COLORS = {
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.97)',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.4)',
  shadowColor: '#1E3A8A',
  // Gradients for placeholder
  gradientStart: '#38BDF8',
  gradientEnd: '#0EA5E9',
};

const severityConfig = {
  low: {
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    gradient: ['#4ADE80', '#22C55E'] as const,
    label: 'Low',
    iconBg: 'rgba(34, 197, 94, 0.15)',
  },
  medium: {
    color: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    gradient: ['#FACC15', '#EAB308'] as const,
    label: 'Medium',
    iconBg: 'rgba(234, 179, 8, 0.15)',
  },
  high: {
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gradient: ['#F87171', '#EF4444'] as const,
    label: 'High',
    iconBg: 'rgba(239, 68, 68, 0.15)',
  },
};

const wasteTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  plastic: 'bag',
  paper: 'document',
  metal: 'construct',
  glass: 'cube',
  organic: 'leaf',
  other: 'trash',
};

export default function WasteCard({
  imageUrl,
  severity,
  wasteType,
  timestamp,
  location,
  delay = 0,
}: WasteCardProps) {
  const config = severityConfig[severity];
  const icon = wasteTypeIcons[wasteType.toLowerCase()] || 'trash';

  // Format timestamp
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
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

  const renderCardContent = () => (
    <>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.placeholderImage}
          >
            <View style={styles.placeholderIconContainer}>
              <Ionicons name="trash-bin" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.placeholderText}>Waste Detected</Text>
          </LinearGradient>
        )}

        {/* Dark Overlay for better badge visibility */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'transparent', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.4 }}
          style={styles.imageOverlay}
        />

        {/* Severity Badge - Top Right */}
        <View style={styles.severityBadgeContainer}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.severityBadge}
          >
            <Text style={styles.severityText}>{config.label}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Waste Type Row */}
        <View style={styles.wasteTypeRow}>
          <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
            <Ionicons name={icon} size={22} color={config.color} />
          </View>
          <Text style={styles.wasteType}>{wasteType}</Text>
        </View>

        {/* Metadata Section */}
        <View style={styles.metadataContainer}>
          {/* Timestamp */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataIconContainer}>
              <Ionicons
                name="time-outline"
                size={15}
                color={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.metadataText}>{formatTimestamp(timestamp)}</Text>
          </View>

          {/* Location (if provided) */}
          {location && (
            <View style={styles.metadataRow}>
              <View style={styles.metadataIconContainer}>
                <Ionicons
                  name="location-outline"
                  size={15}
                  color={COLORS.textSecondary}
                />
              </View>
              <Text style={styles.metadataText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

  return (
    <Animated.View
      entering={FadeInRight.duration(500).delay(delay)}
      style={styles.container}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={85} tint="light" style={styles.blurCard}>
          {renderCardContent()}
        </BlurView>
      ) : (
        <View style={styles.androidCard}>
          {renderCardContent()}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  blurCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  androidCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  severityBadgeContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  severityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  content: {
    padding: 18,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.5)',
  },
  wasteTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wasteType: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    letterSpacing: 0.2,
  },
  metadataContainer: {
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metadataText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
});
