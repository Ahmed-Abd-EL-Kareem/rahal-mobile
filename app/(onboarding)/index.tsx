// app/(onboarding)/index.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  titleKey: string;
  subtitleKey: string;
  defaultTitle: string;
  defaultSubtitle: string;
  tagKey: string;
  defaultTag: string;
  icon: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    titleKey: 'onboarding.slide1.title',
    defaultTitle: 'AI Trip Planner',
    subtitleKey: 'onboarding.slide1.subtitle',
    defaultSubtitle: 'Your personal Egyptian guide in your pocket. Seamless itineraries crafted by artificial intelligence and ancient wisdom.',
    tagKey: 'onboarding.slide1.tag',
    defaultTag: 'AI-Powered Heritage',
    icon: 'sparkles',
  },
  {
    id: 2,
    titleKey: 'onboarding.slide2.title',
    defaultTitle: 'Smart Hotel Search',
    subtitleKey: 'onboarding.slide2.subtitle',
    defaultSubtitle: 'Describe your dream stay in natural language. Rahal AI finds the perfect hotels across Egypt.',
    tagKey: 'onboarding.slide2.tag',
    defaultTag: 'Bespoke Stays',
    icon: 'bed-outline',
  },
  {
    id: 3,
    titleKey: 'onboarding.slide3.title',
    defaultTitle: '24/7 AI Concierge',
    subtitleKey: 'onboarding.slide3.subtitle',
    defaultSubtitle: 'Instant answers on historical sights, transport, local food. Break language barriers with real-time translation.',
    tagKey: 'onboarding.slide3.tag',
    defaultTag: 'Instant Assistance',
    icon: 'chatbubbles-outline',
  },
];

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  
  const isRTL = i18n.language === 'ar';

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      router.replace('/(auth)/signup');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-obsidian relative">
      {/* Full-bleed Hero Background */}
      <View className="absolute inset-0">
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADLa1jSaA0ai2kwKsFBNyb4E9-Wa7Qh-5mKEW00WwJh1LcxEohtONBtLTobs9wWKwHZVNYRuguVoxpCxypsppoiVc0IJe-xvBFsSSW37vaBatzNdltbHHfKfTa20ULvJvGy4b3xZOIHA7AnjhlzfWpXy1ZHHfXQsroBsN0w__zYJhKVdyrVByydKPki07X0FUIYD4HvJLixjBY5EUjL8kZauNS7DTz5aYn1MuqVzDC_Z9tHzbrv_nnpQFziLqZQ-LK5peiJcxg29c',
          }}
          className="w-full h-full opacity-90"
          resizeMode="cover"
        />
        {/* Dark Overlay for readability */}
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20, 16, 8, 0.45)' }} />
      </View>

      {/* Main Container styled with insets for camera and bottom margin safety */}
      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 32) + 20,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
        className="justify-between z-10"
      >
        {/* Header: Brand Logo & Wordmark */}
        <View className="items-center">
          <View 
            className="w-20 h-20 rounded-full border-2 border-pharaoh-gold flex items-center justify-center p-3" 
            style={{ backgroundColor: 'rgba(20, 16, 8, 0.4)' }}
          >
            <Image
              source={require('../../assets/logo-2.png')}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <Text className="font-headline text-display-lg-mobile text-pharaoh-gold tracking-tight mt-3">
            Rahal
          </Text>
          <View className="w-24 h-[1px] mt-2" style={{ backgroundColor: 'rgba(200, 146, 42, 0.3)' }} />
        </View>

        {/* Horizontal Carousel */}
        <View style={{ height: 220 }} className="justify-center mt-4">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slideIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentSlide(slideIndex);
            }}
            className="w-full"
          >
            {ONBOARDING_SLIDES.map((slide) => (
              <View
                key={slide.id}
                style={{ width: SCREEN_WIDTH }}
                className="items-center px-8 justify-center"
              >
                {/* Badge Tag */}
                <View 
                  className="flex-row items-center gap-2 mb-4 px-4 py-1.5 rounded-full border" 
                  style={{ 
                    backgroundColor: 'rgba(20, 16, 8, 0.4)',
                    borderColor: 'rgba(200, 146, 42, 0.2)'
                  }}
                >
                  <Ionicons name={slide.icon as any} size={14} color="#C8922A" />
                  <Text className="text-label-sm text-pharaoh-gold uppercase tracking-widest font-semibold">
                    {t(slide.tagKey, slide.defaultTag)}
                  </Text>
                </View>

                {/* Title */}
                <Text className="font-headline text-headline-md-mobile text-surface-bright text-center mb-3">
                  {t(slide.titleKey, slide.defaultTitle)}
                </Text>

                {/* Description */}
                <Text className="text-body-md text-outline-variant/90 text-center leading-relaxed max-w-sm">
                  {t(slide.subtitleKey, slide.defaultSubtitle)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Footer: Page Indicators & Actions */}
        <View className="px-6 items-center gap-6">
          {/* Carousel Indicators */}
          <View className="flex-row gap-2 justify-center mb-2">
            {ONBOARDING_SLIDES.map((_, index) => (
              <View
                key={index}
                className="h-1.5 rounded-full"
                style={{
                  width: index === currentSlide ? 32 : 8,
                  backgroundColor: index === currentSlide ? '#C8922A' : 'rgba(211, 196, 178, 0.3)',
                }}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View className="w-full max-w-sm gap-4">
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              className="w-full h-14 bg-pharaoh-gold rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-pharaoh-gold/20"
            >
              <Text className="text-white text-label-md uppercase tracking-wider font-bold">
                {currentSlide === ONBOARDING_SLIDES.length - 1
                  ? t('onboarding.getStarted', 'Start Planning Free')
                  : t('onboarding.next', 'Next')}
              </Text>
              <Ionicons
                name={isRTL ? 'arrow-back' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.7}
              className="py-2 items-center"
            >
              <Text className="text-label-md text-outline-variant text-center">
                {t('onboarding.alreadyHaveAccount', 'Already have an account?')}{' '}
                <Text className="font-bold text-surface-bright underline">
                  {t('onboarding.logIn', 'Log In')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sahara AI Attribution */}
          <Text className="text-label-sm text-outline/40 uppercase tracking-widest text-center mt-2">
            {t('onboarding.poweredBy', 'Est. 2024 • Powered by Sahara AI')}
          </Text>
        </View>
      </View>
    </View>
  );
}