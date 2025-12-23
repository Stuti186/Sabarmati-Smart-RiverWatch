/**
 * SpeciesDetailsScreen
 * Detailed species information with map and similar species
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import MapView, { Marker } from 'react-native-maps';
import { getCategoryColor, getCategoryIcon } from '@/utils/biodiversity';
import { biodiversityApi, type Species } from '@/services/biodiversityApi';
import { MAP_CONFIG } from '@/constants';

const { width } = Dimensions.get('window');

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
};

export default function SpeciesDetailsScreen() {
  const router = useRouter();
  const { speciesId } = useLocalSearchParams<{ speciesId: string }>();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const placeholderImage = 'https://placehold.co/600x300?text=No+Image';

  useEffect(() => {
    loadSpecies();
  }, [speciesId]);

  const loadSpecies = async () => {
    if (!speciesId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await biodiversityApi.getSpeciesById(speciesId);
      setSpecies(result.data);
    } catch (error: any) {
      console.error('Error loading species:', error);
      Alert.alert(
        'Error',
        'Unable to load species details. Please ensure backend is running.',
        [{ text: 'Retry', onPress: loadSpecies }, { text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loading...</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading species data from GBIF...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!species) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Species Details</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Species not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const statusColor =
    species.status === 'least_concern'
      ? '#22C55E'
      : species.status === 'vulnerable'
      ? '#FACC15'
      : '#EF4444';

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
          <Text style={styles.headerTitle}>Species Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Header Image */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.imageContainer}>
            {!!species.image && species.image.trim().length > 0 ? (
              <Image source={{ uri: species.image }} style={styles.headerImage} />
            ) : (
              <Image source={{ uri: placeholderImage }} style={styles.headerImage} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageGradient}>
              <View style={styles.imageContent}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(species.category) + '20' },
                  ]}>
                  <Ionicons
                    name={getCategoryIcon(species.category) as any}
                    size={20}
                    color={getCategoryColor(species.category)}
                  />
                </View>
                <Text style={styles.imageTitle}>{species.name}</Text>
                <Text style={styles.imageSubtitle}>{species.scientificName}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Main Info Card */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.infoCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={styles.statusText}>
                  {species.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{species.description}</Text>

            {species.behavior && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Behavior</Text>
                <Text style={styles.infoValue}>{species.behavior}</Text>
              </View>
            )}

            {species.diet && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Diet</Text>
                <Text style={styles.infoValue}>{species.diet}</Text>
              </View>
            )}

            {species.size && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{species.size}</Text>
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Habitat</Text>
              <View style={styles.habitatTags}>
                {species.habitat.map((hab, index) => (
                  <View key={index} style={styles.habitatTag}>
                    <Text style={styles.habitatTagText}>{hab}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Similar Species */}
          {species.similarSpecies && species.similarSpecies.length > 0 && (
            <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>Similar Species</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {species.similarSpecies.map((name: string, index: number) => (
                  <View key={index} style={styles.similarCard}>
                    <Text style={styles.similarText}>{name}</Text>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Sightings Map */}
          <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Sightings Map</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: MAP_CONFIG.DEFAULT_LATITUDE,
                  longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
                  latitudeDelta: MAP_CONFIG.REGION_DELTA.latitudeDelta,
                  longitudeDelta: MAP_CONFIG.REGION_DELTA.longitudeDelta,
                }}>
                <Marker
                  coordinate={{
                    latitude: MAP_CONFIG.DEFAULT_LATITUDE,
                    longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
                  }}
                  title={species.name}
                />
              </MapView>
            </View>
          </Animated.View>

          {/* Bottom Spacing */}
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
    paddingBottom: 100,
  },
  imageContainer: {
    width: width,
    height: 280,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  imageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textWhite,
    flex: 1,
  },
  imageSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusRow: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  habitatTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  habitatTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  habitatTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  similarCard: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  similarText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSpacer: {
    height: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textWhite,
    textAlign: 'center',
  },
});

