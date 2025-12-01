/**
 * MiniChart Component
 * Small animated line or bar chart
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { colors } from '@/theme';

const { width } = Dimensions.get('window');
const chartWidth = (width - 48) / 2 - 16; // Half width minus padding

interface MiniChartProps {
  data: number[];
  type?: 'line' | 'bar';
  color?: string;
  label?: string;
  height?: number;
}

export default function MiniChart({
  data,
  type = 'line',
  color = colors.primary[500],
  label,
  height = 80,
}: MiniChartProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const chartData = {
    labels: data.map((_, i) => ''),
    datasets: [
      {
        data,
        color: (opacity = 1) => color,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => color,
    labelColor: (opacity = 1) => colors.text.secondary.light,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.gray[200],
      strokeWidth: 1,
    },
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={[styles.container, animatedStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
        </View>
      )}
      {type === 'line' ? (
        <LineChart
          data={chartData}
          width={chartWidth}
          height={height}
          chartConfig={chartConfig}
          bezier
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          withDots={true}
          withShadow={false}
          style={styles.chart}
        />
      ) : (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={height}
          chartConfig={chartConfig}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          withShadow={false}
          style={styles.chart}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chart: {
    marginVertical: -10,
  },
});

