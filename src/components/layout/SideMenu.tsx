// src/components/layout/SideMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, logout } = useAuthStore();

  if (!isOpen) return null;

  const navItems = [
    { label: t('common.nav.home', 'Home'), icon: 'home-outline', route: '/(tabs)' },
    { label: t('common.nav.destinations', 'Explore'), icon: 'compass-outline', route: '/(tabs)/explore' },
    { label: t('common.nav.hotels', 'Hotels'), icon: 'business-outline', route: '/(tabs)/hotel' },
    { label: t('common.nav.planner', 'AI Planner'), icon: 'sparkles-outline', route: '/(tabs)/ai' },
    { label: t('common.nav.trips', 'My Trips'), icon: 'map-outline', route: '/(tabs)/trips' },
    { label: t('common.nav.profile', 'Profile'), icon: 'person-outline', route: '/(tabs)/profile' },
  ];

  return (
    <View className="absolute inset-0 z-[100] flex-row">
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <View 
        className="w-[75%] max-w-[300px] h-full shadow-2xl p-6 justify-between border-r"
        style={{ 
          backgroundColor: colors.surface, 
          borderColor: colors.outlineVariant + '33' 
        }}
      >
        <View>
          <View className="flex-row justify-between items-center mb-8 mt-4">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-full border flex items-center justify-center p-0.5" style={{ borderColor: '#C8922A' }}>
                <Ionicons name="compass" size={20} color="#C8922A" />
              </View>
              <Text className="font-headline text-body-lg text-pharaoh-gold mt-0.5">Rahal</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View className="gap-1">
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onClose();
                  router.push(item.route as any);
                }}
                className="flex-row items-center gap-4 py-3.5 px-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={20} color="#C8922A" />
                <Text className="font-semibold text-label-md" style={{ color: colors.onSurface }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="gap-6 pt-6 border-t" style={{ borderTopColor: colors.outlineVariant + '33' }}>
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-label-md" style={{ color: colors.onSurfaceVariant }}>
              {t('common.language', 'Language')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const newLang = i18n.language === 'en' ? 'ar' : 'en';
                i18n.changeLanguage(newLang);
              }}
              className="bg-pharaoh-gold/10 px-3 py-1 rounded-lg border border-pharaoh-gold/20"
            >
              <Text className="text-pharaoh-gold font-bold text-label-sm">
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>

          {isAuthenticated ? (
            <TouchableOpacity
              onPress={async () => {
                onClose();
                logout();
                router.replace('/(onboarding)');
              }}
              className="w-full h-12 border rounded-full flex-row items-center justify-center gap-2"
              style={{ borderColor: '#8F1301' }}
            >
              <Ionicons name="log-out-outline" size={18} color="#8F1301" />
              <Text className="text-label-md font-bold uppercase tracking-wider" style={{ color: '#8F1301' }}>
                {t('common.nav.logout', 'Log Out')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push('/(auth)/login');
              }}
              className="w-full h-12 bg-pharaoh-gold rounded-full flex-row items-center justify-center gap-2"
            >
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              <Text className="text-white text-label-md font-bold uppercase tracking-wider">
                {t('common.nav.login', 'Log In')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
