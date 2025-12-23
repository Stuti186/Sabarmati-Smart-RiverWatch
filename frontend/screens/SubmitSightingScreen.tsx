/**
 * SubmitSightingScreen
 * Form to submit wildlife sightings with photo and location
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { biodiversityApi, type Species } from '@/services/biodiversityApi';
import Snackbar from '@/components/ui/Snackbar';
import { checkBackendHealth } from '@/services/backendHealth';

const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#1E3A8A',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  shadowColor: '#1E3A8A',
  success: '#22C55E',
};

export default function SubmitSightingScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'warning' | 'info'>('info');
  const placeholderImage = 'https://placehold.co/400x300?text=No+Image';

  useEffect(() => {
    loadSpecies();
  }, []);

  const loadSpecies = async () => {
    try {
      setLoadingSpecies(true);
      const result = await biodiversityApi.searchSpecies('', 20);
      setSpeciesList(result.data || []);
    } catch (error) {
      console.error('Error loading species:', error);
    } finally {
      setLoadingSpecies(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Please grant camera and location permissions to submit sightings.');
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get location. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Photo Required', 'Please add a photo of the wildlife sighting.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please enable location to submit your sighting.');
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await biodiversityApi.submitSighting({
        speciesId: selectedSpecies?.id,
        speciesName: selectedSpecies?.name,
        location: location!,
        image: image!,
        notes,
      });

      if (result.queued) {
        // Offline mode - queued for sync
        setSnackbarMessage('Sighting queued for sync when online. You can continue using the app.');
        setSnackbarType('warning');
        setShowSnackbar(true);
        
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        // Online mode - submitted successfully
        setSnackbarMessage(result.message || 'Sighting submitted successfully!');
        setSnackbarType('success');
        setShowSnackbar(true);
        
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      setSnackbarMessage('Could not submit sighting. It has been queued for sync when online.');
      setSnackbarType('warning');
      setShowSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Sighting</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Photo Upload */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Photo *</Text>
            {image ? (
              <View style={styles.imageContainer}>
              {image && image.trim().length > 0 ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Image source={{ uri: placeholderImage }} style={styles.image} />
              )}
                <TouchableOpacity
                  onPress={() => setImage(null)}
                  style={styles.removeImageButton}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  style={styles.uploadButton}>
                  <Ionicons name="camera" size={32} color={COLORS.textPrimary} />
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={styles.uploadButton}>
                  <Ionicons name="images" size={32} color={COLORS.textPrimary} />
                  <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Species Selection */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Species (Optional)</Text>
            <TouchableOpacity
              onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
              style={styles.speciesPicker}>
              <Text style={selectedSpecies ? styles.speciesPickerText : styles.speciesPickerPlaceholder}>
                {selectedSpecies ? selectedSpecies.name : 'Select species if known'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            {showSpeciesPicker && (
              <View style={styles.speciesList}>
                {loadingSpecies ? (
                  <Text style={styles.loadingText}>Loading species...</Text>
                ) : (
                  speciesList.slice(0, 10).map((species) => (
                    <TouchableOpacity
                      key={species.id}
                      onPress={() => {
                        setSelectedSpecies(species);
                        setShowSpeciesPicker(false);
                      }}
                      style={styles.speciesItem}>
                      <Text style={styles.speciesItemText}>{species.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </Animated.View>

          {/* Location */}
          <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Location *</Text>
            <TouchableOpacity
              onPress={handleGetLocation}
              style={styles.locationButton}>
              <Ionicons name="location" size={20} color={COLORS.textWhite} />
              <Text style={styles.locationButtonText}>
                {location ? 'Location Captured ✓' : 'Get Current Location'}
              </Text>
            </TouchableOpacity>
            {location && (
              <Text style={styles.locationText}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any additional observations..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInUp.duration(500).delay(400)}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !image || !location}
              style={[
                styles.submitButton,
                (!image || !location || submitting) && styles.submitButtonDisabled,
              ]}>
              <LinearGradient
                colors={[COLORS.success, '#16A34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}>
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Sighting'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        {/* Snackbar for submission status */}
        <Snackbar
          visible={showSnackbar}
          message={snackbarMessage}
          type={snackbarType}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.textMuted,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  speciesPicker: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  speciesPickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  speciesPickerPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  speciesList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  speciesItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  speciesItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  locationButton: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  bottomSpacer: {
    height: 20,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 16,
  },
});

