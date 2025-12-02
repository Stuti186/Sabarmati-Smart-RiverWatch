/**
 * CCTVFrame Component
 * Grid item for CCTV snapshot
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Image } from 'react-native';
import { colors, gradients, shadows } from '@/theme';
import { CCTVSnapshot, formatSnapshotTimestamp, getStatusColor } from '@/utils/cctvSnapshots';

const { width } = Dimensions.get('window');
const FRAME_SIZE = (width - 60) / 2; // 2 columns with padding

interface CCTVFrameProps {
  snapshot: CCTVSnapshot;
  onPress: () => void;
  delay?: number;
}

export default function CCTVFrame({
  snapshot,
  onPress,
  delay = 0,
}: CCTVFrameProps) {
  const statusColor = getStatusColor(snapshot.status);

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}>
        <BlurView intensity={60} tint="light" style={styles.blurCard}>
          {/* Image/Placeholder */}
          <View style={styles.imageContainer}>
            {snapshot.imageUrl ? (
              <Image
                source={{ uri: snapshot.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={gradients.water.flow.colors as unknown as readonly [string, string, ...string[]]}
                start={gradients.water.flow.start}
                end={gradients.water.flow.end}
                style={styles.placeholderImage}>
                <Ionicons
                  name="videocam"
                  size={32}
                  color={colors.text.inverse.light}
                />
              </LinearGradient>
            )}

            {/* Status Indicator */}
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColor },
                ]}
              />
            </View>

            {/* Timestamp Overlay */}
            <View style={styles.timestampOverlay}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.text.inverse.light}
              />
              <Text style={styles.timestampText}>
                {formatSnapshotTimestamp(snapshot.timestamp)}
              </Text>
            </View>
          </View>

          {/* Info Footer */}
          <View style={styles.footer}>
            <Text style={styles.cameraName} numberOfLines={1}>
              {snapshot.cameraName}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              {snapshot.location}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: FRAME_SIZE,
    marginBottom: 12,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  blurCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: FRAME_SIZE * 0.75,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timestampText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.inverse.light,
  },
  footer: {
    padding: 12,
  },
  cameraName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 4,
  },
  location: {
    fontSize: 11,
    color: colors.text.secondary.light,
  },
});

