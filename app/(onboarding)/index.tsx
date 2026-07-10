// app/(onboarding)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/authStore';

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Discover Egypt, Intelligently',
    subtitle: 'Your AI-powered travel companion for the land of the Pharaohs. Bespoke itineraries, heritage insights, and seamless bookings.',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800',
    gradient: ['#C8922A', '#F8BC51'],
  },
  {
    id: 2,
    title: 'AI Trip Planner',
    subtitle: 'Custom itineraries generated in seconds, optimized for your interests. From ancient history to Red Sea diving.',
    image: 'https://images.unsplash.com/photo-1570108356363-237584d7d9b2?w=800',
    gradient: ['#B12D17', '#FF6E53'],
  },
  {
    id: 3,
    title: 'Smart Hotel Search',
    subtitle: 'Describe your dream stay in natural language. Rahal AI finds the perfect hotels across Egypt.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    gradient: ['#1B4B6E', '#366286'],
  },
  {
    id: 4,
    title: '24/7 AI Concierge',
    subtitle: 'Instant answers on historical sights, transport, local food. Break language barriers with real-time translation.',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    gradient: ['#2D7A4F', '#6BBF6B'],
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { checkAuth } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentOffset={{ x: currentSlide * 375, y: 0 }}
      >
        {ONBOARDING_SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image
              source={{ uri: slide.image }}
              style={styles.slideImage}
              resizeMode="cover"
            />
            <View style={styles.gradientOverlay} />
            <View style={styles.content}>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleNext}
        style={[
          styles.nextButton,
          currentSlide === ONBOARDING_SLIDES.length - 1 && styles.nextButtonLast,
        ]}
        disabled={isAnimating}
      >
        <Text style={styles.nextButtonText}>
          {currentSlide === ONBOARDING_SLIDES.length - 1
            ? t('onboarding.getStarted')
            : t('onboarding.next')}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={24}
          color="#FFFFFF"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipContainer: {
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: 375,
    flex: 1,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    bottom: 150,
    left: 24,
    right: 24,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 40,
  },
  slideSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    lineHeight: 26,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#C8922A',
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#C8922A',
    marginHorizontal: 24,
    marginBottom: 40,
  },
  nextButtonLast: {
    backgroundColor: '#B12D17',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  arrowIcon: {
    marginTop: 2,
  },
});