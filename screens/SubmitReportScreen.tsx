/**
 * SubmitReportScreen
 * Modern premium citizen report submission with photo, GPS location, and description
 * Fully redesigned for 2024/2025 design standards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { submitReport } from '@/services/reports';
import { ISSUE_TYPES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

// Premium color palette
const COLORS = {
  // Gradients
  bgGradientStart: '#38BDF8',
  bgGradientEnd: '#2563EB',
  headerGradientStart: '#3B82F6',
  headerGradientEnd: '#1E40AF',
  buttonBlueStart: '#3B82F6',
  buttonBlueEnd: '#2563EB',
  buttonGreenStart: '#22C55E',
  buttonGreenEnd: '#16A34A',
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  textLink: '#3B82F6',
  // Card
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(255, 255, 255, 0.6)',
  // Status
  activeBlue: '#3B82F6',
  activeBlueBg: '#EFF6FF',
  activeBorder: '#3B82F6',
  // Inputs
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  // Other
  danger: '#EF4444',
  shadowColor: '#1E3A8A',
};

export default function SubmitReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<string>(ISSUE_TYPES.OTHER);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to submit reports.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (locationStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please grant location permission to automatically include your location in the report.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to submit reports.'
        );
        setGettingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      // Reverse geocode to get location name
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (address) {
          const addressParts = [
            address.street,
            address.district,
            address.city,
          ].filter(Boolean);
          setLocationName(addressParts.join(', ') || 'Current Location');
        }
      } catch (geocodeError) {
        setLocationName('Current Location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setGettingLocation(false);
    }
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
        setImage(result.assets[0].uri);
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
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please provide a description for your report.');
      return;
    }

    if (!location) {
      Alert.alert(
        'Location Required',
        'Please wait for location to be detected or try again.'
      );
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to submit a report.');
      return;
    }

    setSubmitting(true);

    try {
      await submitReport(issueType, description, location, image || undefined);
      Alert.alert(
        'Report Submitted',
        'Your report has been submitted successfully. Thank you for your contribution!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setImage(null);
              setDescription('');
              setIssueType(ISSUE_TYPES.OTHER);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Submission Failed',
        error.message || 'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const issueTypeOptions = [
    { value: ISSUE_TYPES.WASTE, label: 'Waste', icon: 'trash' },
    { value: ISSUE_TYPES.POLLUTION, label: 'Pollution', icon: 'warning' },
    { value: ISSUE_TYPES.SAFETY, label: 'Safety', icon: 'shield' },
    { value: ISSUE_TYPES.VANDALISM, label: 'Vandalism', icon: 'construct' },
    { value: ISSUE_TYPES.OTHER, label: 'Other', icon: 'ellipse' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]}
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
        <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
      </TouchableOpacity>

      {/* Header Card */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.headerIconContainer}>
            <Ionicons name="document-text" size={28} color={COLORS.textWhite} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Submit Report</Text>
            <Text style={styles.headerSubtitle}>
              Help us keep the riverfront safe and clean
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Issue Type Selection */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(100)}
          style={styles.section}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Issue Type</Text>
            <View style={styles.issueTypeGrid}>
              {issueTypeOptions.map((option) => {
                const isActive = issueType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setIssueType(option.value)}
                    style={[
                      styles.issueTypeButton,
                      isActive && styles.issueTypeButtonActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.issueTypeIconContainer,
                        isActive && styles.issueTypeIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={isActive ? COLORS.textWhite : COLORS.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.issueTypeLabel,
                        isActive && styles.issueTypeLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Photo Section */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          style={styles.section}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Photo (Optional)</Text>
            {image ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setImage(null)}
                  style={styles.removeImageButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={36} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                {/* Take Photo Button */}
                <Pressable
                  onPress={handleTakePhoto}
                  style={({ pressed }) => [
                    styles.photoButton,
                    pressed && styles.photoButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[COLORS.buttonBlueStart, COLORS.buttonBlueEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.photoButtonGradient}
                  >
                    <Ionicons name="camera" size={22} color={COLORS.textWhite} />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </LinearGradient>
                </Pressable>

                {/* Choose from Gallery Button */}
                <Pressable
                  onPress={handlePickImage}
                  style={({ pressed }) => [
                    styles.photoButton,
                    pressed && styles.photoButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[COLORS.buttonGreenStart, COLORS.buttonGreenEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.photoButtonGradient}
                  >
                    <Ionicons name="images" size={22} color={COLORS.textWhite} />
                    <Text style={styles.photoButtonText}>Choose from Gallery</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Location Section */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.section}
        >
          <View style={styles.card}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              {gettingLocation && (
                <ActivityIndicator size="small" color={COLORS.activeBlue} />
              )}
            </View>

            {location ? (
              <View style={styles.locationInfo}>
                <View style={styles.locationRow}>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="location" size={22} color={COLORS.activeBlue} />
                  </View>
                  <Text style={styles.locationText}>
                    {locationName || 'Current Location'}
                  </Text>
                </View>
                <Text style={styles.locationCoords}>
                  📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View style={styles.locationPlaceholder}>
                <View style={styles.locationPlaceholderIcon}>
                  <Ionicons name="location-outline" size={36} color={COLORS.textMuted} />
                </View>
                <Text style={styles.locationPlaceholderText}>
                  Getting your location...
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.refreshLocationButton}
              disabled={gettingLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={COLORS.activeBlue} />
              <Text style={styles.refreshLocationText}>Refresh Location</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Description Section */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.section}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <View style={styles.descriptionContainer}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.helperText}>
              Please provide as much detail as possible about the issue.
            </Text>
          </View>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          style={styles.submitSection}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || !location || !description.trim()}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              (submitting || !location || !description.trim()) && styles.submitButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={[COLORS.buttonBlueStart, COLORS.buttonBlueEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {submitting ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.textWhite} />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                  <Ionicons name="arrow-forward" size={22} color={COLORS.textWhite} />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Bottom Spacing */}
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
    top: 40,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
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
    color: COLORS.textWhite,
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
    paddingTop: 16,
  },

  // Sections
  section: {
    marginBottom: 18,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 22,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  // Issue Type Grid
  issueTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  issueTypeButton: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  issueTypeButtonActive: {
    backgroundColor: COLORS.activeBlueBg,
    borderColor: COLORS.activeBorder,
  },
  issueTypeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  issueTypeIconContainerActive: {
    backgroundColor: COLORS.activeBlue,
  },
  issueTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  issueTypeLabelActive: {
    color: COLORS.activeBlue,
    fontWeight: '700',
  },

  // Photo Section
  photoButtons: {
    gap: 14,
  },
  photoButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  photoButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  photoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.2,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.textWhite,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Location Section
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.activeBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  locationCoords: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: 52,
  },
  locationPlaceholder: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 14,
  },
  locationPlaceholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationPlaceholderText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.activeBlueBg,
    gap: 8,
  },
  refreshLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.activeBlue,
  },

  // Description Section
  descriptionContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    marginBottom: 10,
    minHeight: 140,
  },
  descriptionInput: {
    padding: 18,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    minHeight: 140,
    lineHeight: 24,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Submit Button
  submitSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  submitButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.buttonBlueEnd,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 28,
    gap: 12,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
