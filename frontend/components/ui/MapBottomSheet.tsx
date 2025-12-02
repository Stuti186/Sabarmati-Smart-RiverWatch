/**
 * MapBottomSheet Component
 * Animated bottom sheet for map detail views
 * Three states: collapsed, half, full
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Sheet positions
const COLLAPSED_HEIGHT = 80;
const HALF_HEIGHT = SCREEN_HEIGHT * 0.45;
const FULL_HEIGHT = SCREEN_HEIGHT * 0.8;

type SheetState = 'collapsed' | 'half' | 'full';

interface MapBottomSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  headerColor: string;
  headerIcon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  onClose: () => void;
  onStateChange?: (state: SheetState) => void;
  initialState?: SheetState;
  onInteractionChange?: (isInteracting: boolean) => void;
}

const getPositionForState = (state: SheetState): number => {
  switch (state) {
    case 'collapsed':
      return SCREEN_HEIGHT - COLLAPSED_HEIGHT;
    case 'half':
      return SCREEN_HEIGHT - HALF_HEIGHT;
    case 'full':
      return SCREEN_HEIGHT - FULL_HEIGHT;
    default:
      return SCREEN_HEIGHT - HALF_HEIGHT;
  }
};

export default function MapBottomSheet({
  visible,
  title,
  subtitle,
  headerColor,
  headerIcon,
  children,
  onClose,
  onStateChange,
  initialState = 'half',
  onInteractionChange,
}: MapBottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const currentState = useSharedValue<SheetState>(initialState);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (visible) {
      const targetY = getPositionForState(initialState);
      translateY.value = withSpring(targetY, { damping: 20, stiffness: 150 });
      currentState.value = initialState;
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible, initialState, translateY, currentState]);

  const updateState = useCallback((newState: SheetState) => {
    onStateChange?.(newState);
  }, [onStateChange]);

  const handleInteractionChange = useCallback((isInteracting: boolean) => {
    onInteractionChange?.(isInteracting);
  }, [onInteractionChange]);

  const handleScrollBegin = useCallback(() => {
    handleInteractionChange(true);
  }, [handleInteractionChange]);

  const handleScrollEnd = useCallback(() => {
    handleInteractionChange(false);
  }, [handleInteractionChange]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      // Clamp between full and collapsed positions
      translateY.value = Math.max(
        SCREEN_HEIGHT - FULL_HEIGHT,
        Math.min(newY, SCREEN_HEIGHT - COLLAPSED_HEIGHT)
      );
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const currentY = translateY.value;

      // Determine target state based on position and velocity
      let targetState: SheetState;
      
      if (velocity > 500) {
        // Fast downward swipe
        if (currentY > SCREEN_HEIGHT - HALF_HEIGHT) {
          targetState = 'collapsed';
        } else {
          targetState = 'half';
        }
      } else if (velocity < -500) {
        // Fast upward swipe
        if (currentY < SCREEN_HEIGHT - HALF_HEIGHT) {
          targetState = 'full';
        } else {
          targetState = 'half';
        }
      } else {
        // Snap to nearest position
        const collapsedDist = Math.abs(currentY - (SCREEN_HEIGHT - COLLAPSED_HEIGHT));
        const halfDist = Math.abs(currentY - (SCREEN_HEIGHT - HALF_HEIGHT));
        const fullDist = Math.abs(currentY - (SCREEN_HEIGHT - FULL_HEIGHT));

        if (collapsedDist < halfDist && collapsedDist < fullDist) {
          targetState = 'collapsed';
        } else if (fullDist < halfDist) {
          targetState = 'full';
        } else {
          targetState = 'half';
        }
      }

      currentState.value = targetState;
      translateY.value = withSpring(getPositionForState(targetState), {
        damping: 20,
        stiffness: 150,
      });
      runOnJS(updateState)(targetState);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = useCallback(() => {
    handleInteractionChange(false);
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    setTimeout(onClose, 250);
  }, [onClose, translateY, handleInteractionChange]);

  if (!visible) return null;

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <GestureDetector gesture={gesture}>
          <View>
            {/* Handle (drag area) */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: `${headerColor}20` }]}>
                <Ionicons name={headerIcon} size={22} color={headerColor} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle && (
                  <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </GestureDetector>

        {/* Content - Scrollable */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled
          onTouchStart={() => handleInteractionChange(true)}
          onTouchMove={() => handleInteractionChange(true)}
          onTouchEnd={() => handleInteractionChange(false)}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollBegin={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FULL_HEIGHT + 50,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
});

