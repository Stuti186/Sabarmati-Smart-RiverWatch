/**
 * Loading Example
 * Example of using SkeletonLoader in a screen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenWrapper, SkeletonLoader, SkeletonCard, SkeletonList, GlassCard } from '@/components/ui';
import { colors } from '@/theme';

export default function LoadingExample() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <ScreenWrapper
      title="Loading Example"
      subtitle="Skeleton loaders demonstration"
    >
      {loading ? (
        <>
          {/* Card Skeleton */}
          <SkeletonCard style={styles.skeleton} />
          
          {/* List Skeleton */}
          <SkeletonList count={5} style={styles.skeleton} />
          
          {/* Custom Skeleton */}
          <View style={styles.customSkeleton}>
            <SkeletonLoader variant="circle" width={60} style={styles.avatar} />
            <View style={styles.customContent}>
              <SkeletonLoader variant="text" height={20} style={styles.title} />
              <SkeletonLoader variant="text" height={16} width="80%" />
            </View>
          </View>
        </>
      ) : (
        <GlassCard>
          {/* Actual content when loaded */}
          <View>
            {/* Your content here */}
          </View>
        </GlassCard>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    marginBottom: 16,
  },
  customSkeleton: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    marginRight: 12,
  },
  customContent: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
});

