/**
 * WasteUploadScreen
 * Modern premium AI-powered waste photo upload and detection
 * Updated for 2024/2025 design standards
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn, FadeInDown } from 'react-native-reanimated';
import { BoundingBox } from '@/components/ui';
import { simulateAIDetection, getDetectionSummary, getAverageConfidence } from '@/utils/aiDetection';
import type { BoundingBoxData } from '@/components/ui/BoundingBox';
import { useRouter } from 'expo-router';
import { analyzeWasteWithGemini } from '@/services/geminiClient';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 40;

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#8B5CF6',
  headerGradientEnd: '#7C3AED',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  shadowColor: '#1E3A8A',
  primaryBlue: '#3B82F6',
  softBlue: '#E0F2FE',
  softPurple: '#F3E8FF',
  green: '#22C55E',
  red: '#EF4444',
};

export default function WasteUploadScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<BoundingBoxData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const hasGeminiKey = useMemo(() => !!process.env.EXPO_PUBLIC_GEMINI_API_KEY, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage(asset.uri);
        setImageDimensions({
          width: asset.width || IMAGE_WIDTH,
          height: asset.height || (IMAGE_WIDTH * 3) / 4,
        });
        setDetections([]);
        setTimeout(() => processImage(), 500);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage(asset.uri);
        setImageDimensions({
          width: asset.width || IMAGE_WIDTH,
          height: asset.height || (IMAGE_WIDTH * 3) / 4,
        });
        setDetections([]);
        setTimeout(() => processImage(), 500);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const toDataUri = async (uri: string): Promise<string> => {
    if (uri.startsWith('data:')) return uri;

    // Web: fetch and convert
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      return await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('Failed to convert image to base64'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Native: use FileSystem
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  };

  const processImage = async () => {
    if (!image) return;
    setProcessing(true);
    setStatus(hasGeminiKey ? 'Sending to Gemini...' : 'Simulating detection...');
    try {
      let detected: BoundingBoxData[] = [];

      if (hasGeminiKey) {
        const dataUri = await toDataUri(image);
        const result = await analyzeWasteWithGemini(dataUri);

        // Map Gemini results to bounding boxes (placeholder positions)
        detected = result.items.slice(0, 5).map((item, idx) => ({
          id: `${item.label}-${idx}`,
          label: item.label,
          confidence: item.confidence || 0.5,
          color: COLORS.primaryBlue,
          // simple distributed boxes
          x: 10 + (idx * 12) % 60,
          y: 10 + (idx * 8) % 50,
          width: 30,
          height: 20,
        }));

        // If Gemini returns nothing, fallback to simulate
        if (!detected.length) {
          detected = simulateAIDetection();
        }
      } else {
        // Fallback simulation
        detected = simulateAIDetection();
      }

      setDetections(detected);
      setStatus(null);
    } catch (error: any) {
      console.warn('Gemini analysis failed, falling back to simulation:', error?.message);
      const detected = simulateAIDetection();
      setDetections(detected);
      setStatus('Using offline simulation (Gemini unavailable)');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setDetections([]);
    setImageDimensions(null);
    setProcessing(false);
  };

  const summary = getDetectionSummary(detections);
  const avgConfidence = getAverageConfidence(detections);

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerTitleSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="camera" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Upload Waste Photo</Text>
            <Text style={styles.headerSubtitle}>AI-powered waste detection</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderUploadButtons = () => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(100)}
      style={styles.uploadCardContainer}
    >
      <View style={styles.uploadCard}>
        <View style={styles.uploadIconContainer}>
          <Ionicons name="cloud-upload" size={56} color={COLORS.primaryBlue} />
        </View>
        <Text style={styles.uploadTitle}>Capture or Select Photo</Text>
        <Text style={styles.uploadSubtitle}>Take a new photo or choose from gallery</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primaryBlue, '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="camera-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.green, '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="images-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Pick from Gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderImageWithDetections = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.imageCardContainer}>
      <View style={styles.imageCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image! }}
            style={[
              styles.image,
              imageDimensions && {
                width: IMAGE_WIDTH,
                height: (IMAGE_WIDTH * imageDimensions.height) / imageDimensions.width,
              },
            ]}
            resizeMode="contain"
            onLoad={(e) => {
              const { width: imgWidth, height: imgHeight } = e.nativeEvent.source;
              if (imgWidth && imgHeight) {
                setImageDimensions({ width: imgWidth, height: imgHeight });
              }
            }}
          />

          {/* Bounding Boxes */}
          {imageDimensions &&
            detections.map((box, index) => (
              <BoundingBox
                key={box.id}
                box={box}
                imageWidth={IMAGE_WIDTH}
                imageHeight={(IMAGE_WIDTH * imageDimensions.height) / imageDimensions.width}
                delay={index * 100}
              />
            ))}

          {/* Processing Overlay */}
          {processing && (
            <View style={styles.processingOverlay}>
              <View style={styles.processingCard}>
                <ActivityIndicator size="large" color={COLORS.primaryBlue} />
                <Text style={styles.processingText}>{status || 'Analyzing image...'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Detection Results */}
        {detections.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(600).delay(500)}
            style={styles.resultsContainer}
          >
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Detection Results</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{avgConfidence}% avg confidence</Text>
              </View>
            </View>

            <View style={styles.summaryContainer}>
              {Object.entries(summary).map(([type, count]) => {
                const typeColors: Record<string, string> = {
                  plastic: '#EF4444',
                  paper: '#3B82F6',
                  metal: '#F59E0B',
                  glass: '#1E40AF',
                  organic: '#22C55E',
                  other: '#64748B',
                };
                return (
                  <View key={type} style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: typeColors[type] || COLORS.primaryBlue }]} />
                    <Text style={styles.summaryText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, (processing || !image) && styles.buttonDisabled]}
            onPress={processImage}
            disabled={processing || !image}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color={COLORS.primaryBlue} />
            <Text style={styles.actionButtonText}>Process Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Ionicons name="close-outline" size={18} color={COLORS.red} />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Custom Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Header */}
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!image ? renderUploadButtons() : renderImageWithDetections()}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Custom Back Button
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop:90,
    paddingBottom: 5,
    zIndex: 10,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20
  },

  // Upload Card
  uploadCardContainer: {
    marginTop: 1,
  },
  uploadCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  uploadIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Image Card
  imageCardContainer: {
    marginTop: 16,
  },
  imageCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 18,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: 18,
  },
  image: {
    width: IMAGE_WIDTH,
    height: (IMAGE_WIDTH * 3) / 4,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  processingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  processingText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Results
  resultsContainer: {
    marginBottom: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  confidenceBadge: {
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  summaryContainer: {
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softBlue,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.red,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
