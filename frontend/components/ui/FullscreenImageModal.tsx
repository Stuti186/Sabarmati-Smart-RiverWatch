/**
 * FullscreenImageModal Component
 * Fullscreen modal for viewing images
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '@/theme';
import { CCTVSnapshot, formatSnapshotTimestamp } from '@/utils/cctvSnapshots';

const { width, height } = Dimensions.get('window');

interface FullscreenImageModalProps {
  visible: boolean;
  snapshot: CCTVSnapshot | null;
  onClose: () => void;
}

export default function FullscreenImageModal({
  visible,
  snapshot,
  onClose,
}: FullscreenImageModalProps) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible || !snapshot) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={[styles.backdrop, backdropStyle]}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          activeOpacity={0.8}>
          <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
            <Ionicons name="close" size={24} color={colors.text.inverse.light} />
          </BlurView>
        </TouchableOpacity>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {snapshot.imageUrl ? (
            <Image
              source={{ uri: snapshot.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <LinearGradient
              colors={gradients.water.flow.colors as unknown as readonly [string, string, ...string[]]}
              start={gradients.water.flow.start}
              end={gradients.water.flow.end}
              style={styles.placeholderImage}>
              <Ionicons
                name="videocam"
                size={64}
                color={colors.text.inverse.light}
              />
              <Text style={styles.placeholderText}>CCTV Feed</Text>
            </LinearGradient>
          )}
        </View>

        {/* Info Footer */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={styles.footer}>
          <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
            <View style={styles.footerContent}>
              <View style={styles.footerLeft}>
                <View style={styles.footerIconContainer}>
                  <Ionicons
                    name="videocam"
                    size={20}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.footerTextContainer}>
                  <Text style={styles.footerTitle}>{snapshot.cameraName}</Text>
                  <Text style={styles.footerSubtitle}>{snapshot.location}</Text>
                </View>
              </View>
              <View style={styles.footerRight}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.footerTimestamp}>
                  {formatSnapshotTimestamp(snapshot.timestamp)}
                </Text>
              </View>
            </View>
            {snapshot.description && (
              <Text style={styles.footerDescription}>{snapshot.description}</Text>
            )}
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    ...shadows.lg,
  },
  closeButtonBlur: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  placeholderImage: {
    width: width - 40,
    height: height * 0.6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse.light,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  footerBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    ...shadows.xl,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  footerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerTextContainer: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTimestamp: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  footerDescription: {
    fontSize: 13,
    color: colors.text.secondary.light,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

