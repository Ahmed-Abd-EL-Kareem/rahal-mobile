// src/components/media/ImageCarousel.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ImageCarouselProps {
  images: string[];
  aspectRatio?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showCounter?: boolean;
  showNavArrows?: boolean;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
  onImagePress?: (index: number, image: string) => void;
}

export const ImageCarousel = ({
  images,
  aspectRatio = 16 / 9,
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showCounter = false,
  showNavArrows = false,
  borderRadius = 16,
  className = '',
  style,
  onImagePress,
}: ImageCarouselProps) => {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const animationRef = useRef<number | null>(null);

  const containerHeight = SCREEN_WIDTH / aspectRatio;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    animationRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [autoPlay, autoPlayInterval, images.length]);

  // Scroll to current index when it changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }] as any,
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
  };

  const handlePress = (index: number) => {
    onImagePress?.(index, images[index]);
  };

  if (images.length === 0) {
    return (
      <View
        style={[
          styles.placeholder,
          { height: containerHeight, borderRadius },
          style,
        ]}
        className={className}
      >
        <Ionicons name="image-outline" size={48} color={colors['on-surface-variant']} />
        <Text style={styles.placeholderText}>No images</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { height: containerHeight, borderRadius },
        style,
      ]}
      className={className}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.contentContainer}
        style={styles.scrollView}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            style={styles.imageWrapper}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: image }}
              style={[
                styles.image,
                { width: SCREEN_WIDTH, height: containerHeight, borderRadius },
              ]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <View style={styles.indicatorsContainer}>
          {images.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.indicatorActive : {},
              ]}
            />
          ))}
        </View>
      )}

      {/* Counter */}
      {showCounter && images.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {/* Navigation arrows */}
      {showNavArrows && images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.navPrev]}
            onPress={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navNext]}
            onPress={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// Full-screen modal image viewer
interface FullScreenImageViewerProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  visible: boolean;
}

export const FullScreenImageViewer = ({
  images,
  initialIndex = 0,
  onClose,
  visible,
}: FullScreenImageViewerProps) => {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (!visible || images.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.modalOverlay,
        { backgroundColor: isDark ? 'rgba(20, 16, 8, 0.95)' : 'rgba(28, 28, 25, 0.95)' },
      ]}
    >
      <TouchableOpacity onPress={onClose} style={styles.modalCloseArea} />
      
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
        contentContainerStyle={styles.modalContentContainer}
        style={styles.modalScrollView}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.modalImageWrapper}>
            <Image
              source={{ uri: image }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Counter */}
      <View style={styles.modalCounter}>
        <Text style={styles.modalCounterText}>{currentIndex + 1} / {images.length}</Text>
      </View>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={styles.modalNavPrev}
            onPress={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 15 }}
          >
            <Ionicons name="chevron-back" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalNavNext}
            onPress={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            hitSlop={{ top: 30, bottom: 30, left: 15, right: 30 }}
          >
            <Ionicons name="chevron-forward" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F0EDE9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    // height handled by parent
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  image: {
    flex: 1,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  counterContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(20, 16, 8, 0.7)',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  navButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navPrev: {
    left: 0,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  navNext: {
    right: 0,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBE8E3',
  },
  placeholderText: {
    marginTop: 8,
    color: '#827564',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },

  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFill,
  },
  modalScrollView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  modalContentContainer: {
    // width handled by paging
  },
  modalImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 16, 8, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCounter: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  modalCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    backgroundColor: 'rgba(20, 16, 8, 0.5)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  modalNavPrev: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    zIndex: 10,
  },
  modalNavNext: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    zIndex: 10,
  },
});

export default ImageCarousel;