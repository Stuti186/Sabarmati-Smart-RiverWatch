/**
 * SegmentedControl Component
 * Modern tab-like segmented control with animated indicator
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Segment {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function SegmentedControl({
  segments,
  selectedKey,
  onSelect,
}: SegmentedControlProps) {
  const selectedIndex = segments.findIndex((s) => s.key === selectedKey);
  const segmentWidth = (width - 56) / segments.length;
  
  const translateX = useSharedValue(selectedIndex * segmentWidth);

  const handleSelect = useCallback((key: string, index: number) => {
    translateX.value = withSpring(index * segmentWidth, {
      damping: 18,
      stiffness: 150,
    });
    onSelect(key);
  }, [segmentWidth, onSelect, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth - 4,
  }));

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        {/* Animated Indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {/* Segments */}
        {segments.map((segment, index) => {
          const isSelected = segment.key === selectedKey;
          return (
            <TouchableOpacity
              key={segment.key}
              style={[styles.segment, { width: segmentWidth }]}
              onPress={() => handleSelect(segment.key, index)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={segment.icon}
                size={18}
                color={isSelected ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextActive,
                ]}
                numberOfLines={1}
              >
                {segment.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  background: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 44,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 6,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});

