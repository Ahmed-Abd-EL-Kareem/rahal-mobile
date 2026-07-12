// src/components/layout/FloatingNavbar.tsx
import React, { useEffect, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export interface FloatingNavbarProps {
  scrollY: Animated.Value;
  tabs: Array<{
    name: string;
    label: string;
    icon: string;
    selectedIcon?: string;
    badge?: number;
  }>;
  activeTab: string;
  onTabPress: (name: string) => void;
  showFloatingAt?: number;
}

export const FloatingNavbar = ({
  scrollY,
  tabs,
  activeTab,
  onTabPress,
  showFloatingAt = 100,
}: FloatingNavbarProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [isFloating, setIsFloating] = useState(false);

  // Animate navbar transform and opacity based on scroll
  const translateY = scrollY.interpolate({
    inputRange: [0, showFloatingAt, showFloatingAt + 50],
    outputRange: [0, 0, -100],
    extrapolate: 'clamp',
  });

  const floatingOpacity = scrollY.interpolate({
    inputRange: [0, showFloatingAt, showFloatingAt + 50],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const backgroundOpacity = scrollY.interpolate({
    inputRange: [0, showFloatingAt, showFloatingAt + 50],
    outputRange: [0, 0, 0.95],
    extrapolate: 'clamp',
  });

  const borderOpacity = scrollY.interpolate({
    inputRange: [0, showFloatingAt, showFloatingAt + 50],
    outputRange: [0, 0, 0.3],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const listenerId = scrollY.addListener((state: { value: number }) => {
      setIsFloating(state.value > showFloatingAt);
    });
    return () => scrollY.removeListener(listenerId);
  }, [scrollY, showFloatingAt]);

  // Hero state (transparent, full-width)
  const heroStyle = {
    transform: [{ translateY }],
    opacity: scrollY.interpolate({
      inputRange: [0, showFloatingAt / 2],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
  };

  // Floating state (pill-shaped, centered)
  const floatingStyle = {
    opacity: floatingOpacity,
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [showFloatingAt, showFloatingAt + 50],
          outputRange: [-100, 16],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Hero Navbar - Transparent, full width at top */}
      <Animated.View style={[styles.heroWrapper, heroStyle]} pointerEvents="box-none">
        <View
          style={[
            styles.heroBar,
            {
              backgroundColor: 'transparent',
              borderBottomWidth: 0,
            },
          ]}
        >
          <View style={styles.heroContent}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                onPress={() => onTabPress(tab.name)}
                style={[
                  styles.heroTab,
                  activeTab === tab.name && styles.heroTabActive,
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={(activeTab === tab.name ? tab.selectedIcon : tab.icon) as any}
                  size={26}
                  color={activeTab === tab.name ? colors['pharaoh-gold'] : colors['on-surface-variant']}
                />
                {tab.badge && tab.badge > 0 && (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Floating Navbar - Pill shaped, centered */}
      <Animated.View style={[styles.floatingWrapper, floatingStyle]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.floatingBar,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.outline + '4D',
              shadowColor: '#141008',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 8,
            },
          ]}
        >
          <View style={styles.floatingContent}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                onPress={() => onTabPress(tab.name)}
                style={[
                  styles.floatingTab,
                  activeTab === tab.name && styles.floatingTabActive,
                ]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <View style={styles.floatingTabIconWrapper}>
                  <Ionicons
                    name={(activeTab === tab.name ? tab.selectedIcon : tab.icon) as any}
                    size={24}
                    color={activeTab === tab.name ? colors['pharaoh-gold'] : colors['on-surface-variant']}
                  />
                </View>
                <Text
                  style={[
                    styles.floatingTabLabel,
                    activeTab === tab.name && styles.floatingTabLabelActive,
                  ]}
                >
                  {t(`common.nav.${tab.name}`)}
                </Text>
                {tab.badge && tab.badge > 0 && (
                  <View style={styles.floatingBadge}>
                    <Text style={styles.floatingBadgeText}>
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  heroWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroBar: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroTab: {
    padding: 8,
    borderRadius: 12,
  },
  heroTabActive: {
    backgroundColor: 'rgba(200, 146, 42, 0.1)',
  },
  heroBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C8922A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  floatingWrapper: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  floatingBar: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  floatingContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  floatingTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    minHeight: 48,
  },
  floatingTabActive: {
    backgroundColor: '#C8922A',
  },
  floatingTabIconWrapper: {
    flex: 0,
  },
  floatingTabLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.6,
    color: '#827564',
  },
  floatingTabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  floatingBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  floatingBadgeText: {
    color: '#C8922A',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
});

export default FloatingNavbar;