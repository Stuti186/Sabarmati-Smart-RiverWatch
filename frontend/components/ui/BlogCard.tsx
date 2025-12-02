/**
 * BlogCard Component
 * Card displaying a blog article with thumbnail
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors, gradients, shadows } from '@/theme';
import { BlogArticle, getCategoryIcon, formatPublishedDate } from '@/utils/blogArticles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface BlogCardProps {
  article: BlogArticle;
  onPress?: () => void;
  delay?: number;
}

export default function BlogCard({
  article,
  onPress,
  delay = 0,
}: BlogCardProps) {
  const categoryIcon = getCategoryIcon(article.category);

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}>
        <BlurView intensity={80} tint="light" style={styles.blurCard}>
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            {article.thumbnail ? (
              <Image
                source={{ uri: article.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={gradients.water.flow.colors as unknown as readonly [string, string, ...string[]]}
                start={gradients.water.flow.start}
                end={gradients.water.flow.end}
                style={styles.placeholderThumbnail}>
                <Ionicons
                  name={categoryIcon}
                  size={48}
                  color={colors.text.inverse.light}
                />
              </LinearGradient>
            )}

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Ionicons
                name={categoryIcon}
                size={14}
                color={colors.text.inverse.light}
              />
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {article.title}
            </Text>
            <Text style={styles.excerpt} numberOfLines={3}>
              {article.excerpt}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.footerText}>{article.author}</Text>
              </View>
              <View style={styles.footerRight}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.footerText}>{article.readTime}</Text>
              </View>
            </View>

            {/* Published Date */}
            <Text style={styles.publishedDate}>
              {formatPublishedDate(article.publishedDate)}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  blurCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse.light,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 8,
    lineHeight: 26,
  },
  excerpt: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  publishedDate: {
    fontSize: 11,
    color: colors.text.secondary.light,
    fontStyle: 'italic',
  },
});

