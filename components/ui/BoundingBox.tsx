/**
 * BoundingBox Component
 * Displays bounding box with label on image
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, shadows } from '@/theme';

export interface BoundingBoxData {
  id: string;
  label: string;
  confidence: number; // 0-100
  x: number; // X position (0-1, relative to image width)
  y: number; // Y position (0-1, relative to image height)
  width: number; // Width (0-1, relative to image width)
  height: number; // Height (0-1, relative to image height)
}

interface BoundingBoxProps {
  box: BoundingBoxData;
  imageWidth: number;
  imageHeight: number;
  delay?: number;
}

const wasteTypeColors: Record<string, string> = {
  plastic: colors.alert[500],
  paper: colors.primary[500],
  metal: colors.warning[500],
  glass: colors.deepBlue[500],
  organic: colors.ecoGreen[500],
  other: colors.gray[500],
};

export default function BoundingBox({
  box,
  imageWidth,
  imageHeight,
  delay = 0,
}: BoundingBoxProps) {
  const left = box.x * imageWidth;
  const top = box.y * imageHeight;
  const width = box.width * imageWidth;
  const height = box.height * imageHeight;

  const color = wasteTypeColors[box.label.toLowerCase()] || colors.primary[500];

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(delay)}
      style={[
        styles.container,
        {
          left,
          top,
          width,
          height,
        },
      ]}>
      {/* Bounding Box Border */}
      <View
        style={[
          styles.border,
          {
            borderColor: color,
          },
        ]}
      />

      {/* Label */}
      <View
        style={[
          styles.labelContainer,
          {
            backgroundColor: color,
          },
        ]}>
        <Text style={styles.labelText}>{box.label}</Text>
        <Text style={styles.confidenceText}>
          {Math.round(box.confidence)}%
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 4,
    ...shadows.md,
  },
  labelContainer: {
    position: 'absolute',
    top: -24,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    ...shadows.sm,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.inverse.light,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.inverse.light,
    opacity: 0.9,
  },
});

