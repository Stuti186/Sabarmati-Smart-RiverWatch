/**
 * AISpeciesIdentificationScreen
 * AI-powered species identification from photos
 * Futuristic UI with blurred cards and neon edges
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { getSpeciesById, type AISpeciesIdentification } from '@/utils/biodiversity';
import { biodiversityApi } from '@/services/biodiversityApi';
import * as FileSystem from 'expo-file-system';

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
  neonBlue: '#00D4FF',
  neonPurple: '#8B5CF6',
};

export default function AISpeciesIdentificationScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<AISpeciesIdentification | null>(null);

  const toDataUri = async (uri: string): Promise<{ dataUri: string; mime: string }> => {
    if (uri.startsWith('data:')) {
      const match = uri.match(/^data:(.+);base64,/);
      const mime = match?.[1] || 'image/jpeg';
      return { dataUri: uri, mime };
    }

    // Web: fetch and convert
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('Failed to convert image to base64'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const match = dataUri.match(/^data:(.+);base64,/);
      const mime = match?.[1] || 'image/jpeg';
      return { dataUri, mime };
    }

    // Native: use FileSystem
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return { dataUri: `data:${mimeType};base64,${base64}`, mime: mimeType };
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permission to identify species.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true, // always request base64
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset?.base64) {
        const mimeType = asset.mimeType || 'image/jpeg';
        setImage(`data:${mimeType};base64,${asset.base64}`);
        setImageMime(mimeType);
      } else if (asset?.uri) {
        setImage(asset.uri);
        setImageMime(asset.mimeType || 'image/jpeg');
      } else {
        Alert.alert('Error', 'Could not read the selected image. Please try again.');
        return;
      }
      setResult(null);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permission to identify species.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true, // always request base64
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset?.base64) {
        const mimeType = asset.mimeType || 'image/jpeg';
        setImage(`data:${mimeType};base64,${asset.base64}`);
        setImageMime(mimeType);
      } else if (asset?.uri) {
        setImage(asset.uri);
        setImageMime(asset.mimeType || 'image/jpeg');
      } else {
        Alert.alert('Error', 'Could not read the captured image. Please try again.');
        return;
      }
      setResult(null);
    }
  };

  const handleIdentify = async () => {
    if (!image) {
      Alert.alert('Image Required', 'Please select an image first.');
      return;
    }

    setIdentifying(true);
    try {
      const { dataUri, mime } = await toDataUri(image);

      // Get AI identification using Google Gemini (through backend)
      const response = await biodiversityApi.aiIdentifySpecies(dataUri, mime || 'image/jpeg');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to identify species');
      }

      const identification = response.data;
      
      // Check if Sabarmati validated
      if (!identification.sabarmatiValidated && identification.validationMessage) {
        Alert.alert(
          'Not a Sabarmati Species',
          identification.validationMessage,
          [{ text: 'OK' }]
        );
        setIdentifying(false);
        return;
      }
      
      setResult(identification);
    } catch (error: any) {
      Alert.alert(
        'Network / AI Error',
        error.message ||
          'Failed to identify species. Please ensure backend is reachable and try again.'
      );
    } finally {
      setIdentifying(false);
    }
  };

  const handleAddToSightings = () => {
    if (result) {
      router.push({
        pathname: '/(tabs)/biodiversity/submit-sighting',
        params: { speciesId: result.primaryMatch.speciesId },
      });
    }
  };

  const handleViewDetails = (speciesId: string) => {
    router.push({
      pathname: '/(tabs)/biodiversity/species-details',
      params: { speciesId },
    });
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
          <Text style={styles.headerTitle}>AI Species ID</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Upload Section */}
          {!image ? (
            <Animated.View entering={FadeInUp.duration(500)} style={styles.uploadSection}>
              <View style={styles.uploadCard}>
                <Ionicons name="sparkles" size={64} color={COLORS.neonPurple} />
                <Text style={styles.uploadTitle}>Upload Photo to Identify</Text>
                <Text style={styles.uploadSubtitle}>
                  Our AI will analyze the image and identify Sabarmati Riverfront species
                </Text>
                <Text style={styles.uploadNote}>
                  📍 Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)
                </Text>
                <View style={styles.uploadButtons}>
                  <TouchableOpacity onPress={handleTakePhoto} style={styles.uploadButton}>
                    <Ionicons name="camera" size={24} color={COLORS.textWhite} />
                    <Text style={styles.uploadButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePickImage} style={styles.uploadButton}>
                    <Ionicons name="images" size={24} color={COLORS.textWhite} />
                    <Text style={styles.uploadButtonText}>Choose Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ) : (
            <>
              {/* Image Preview */}
              <Animated.View entering={FadeInUp.duration(500)} style={styles.imageSection}>
                <View style={styles.imageCard}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <TouchableOpacity
                    onPress={() => {
                      setImage(null);
                      setResult(null);
                    }}
                    style={styles.removeButton}>
                    <Ionicons name="close-circle" size={28} color={COLORS.textWhite} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handleIdentify}
                  disabled={identifying}
                  style={styles.identifyButton}>
                  <LinearGradient
                    colors={[COLORS.neonPurple, COLORS.neonBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.identifyButtonGradient}>
                    {identifying ? (
                      <ActivityIndicator color={COLORS.textWhite} />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={20} color={COLORS.textWhite} />
                        <Text style={styles.identifyButtonText}>Identify Species</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Results */}
              {result && (
                <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.resultsSection}>
                  {/* Primary Match */}
                  <View style={styles.resultCard}>
                    <BlurView intensity={80} tint="light" style={styles.resultCardBlur}>
                      <View style={styles.resultHeader}>
                        <Ionicons name="checkmark-circle" size={32} color={COLORS.neonBlue} />
                        <Text style={styles.resultTitle}>Primary Match</Text>
                      </View>
                      <Text style={styles.resultSpeciesName}>
                        {getSpeciesById(result.primaryMatch.speciesId)?.name || result.primaryMatch.speciesName}
                      </Text>
                      <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceLabel}>Confidence</Text>
                        <View style={styles.confidenceBar}>
                          <LinearGradient
                            colors={[COLORS.neonBlue, COLORS.neonPurple]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.confidenceFill, { width: `${result.primaryMatch.confidence}%` }]}
                          />
                        </View>
                        <Text style={styles.confidenceValue}>{result.primaryMatch.confidence}%</Text>
                      </View>
                      <View style={styles.resultActions}>
                        <TouchableOpacity
                          onPress={handleAddToSightings}
                          style={styles.actionButton}>
                          <Ionicons name="add-circle" size={20} color={COLORS.textWhite} />
                          <Text style={styles.actionButtonText}>Add to Sightings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleViewDetails(result.primaryMatch.speciesId)}
                          style={[styles.actionButton, styles.actionButtonSecondary]}>
                          <Ionicons name="information-circle" size={20} color={COLORS.neonBlue} />
                          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                            View Details
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </View>

                  {/* Alternative Matches */}
                  {result.alternativeMatches.length > 0 && (
                    <View style={styles.alternativesSection}>
                      <Text style={styles.alternativesTitle}>Alternative Matches</Text>
                      {result.alternativeMatches.map((match, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleViewDetails(match.speciesId)}
                          style={styles.alternativeCard}>
                          <Text style={styles.alternativeName}>
                            {getSpeciesById(match.speciesId)?.name || match.speciesName}
                          </Text>
                          <Text style={styles.alternativeConfidence}>{match.confidence}% match</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Animated.View>
              )}
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  uploadSection: {
    marginTop: 40,
  },
  uploadCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: COLORS.neonPurple,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginTop: 8,
  },
  imageSection: {
    marginTop: 20,
  },
  imageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.textMuted,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  identifyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  identifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  identifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  resultsSection: {
    marginTop: 20,
  },
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.neonBlue + '40',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  resultCardBlur: {
    padding: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  resultSpeciesName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  confidenceContainer: {
    marginBottom: 24,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neonBlue,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.neonBlue,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.neonBlue,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  actionButtonTextSecondary: {
    color: COLORS.neonBlue,
  },
  alternativesSection: {
    marginTop: 8,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  alternativeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  alternativeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  alternativeConfidence: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  bottomSpacer: {
    height: 20,
  },
});

