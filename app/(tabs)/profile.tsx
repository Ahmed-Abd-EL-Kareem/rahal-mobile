// app/(tabs)/profile.tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'nativewind';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { user, subscription, logout, updateProfile, isLoading: profileLoading } = useAuthStore();
  const { toggleSideMenu, setLanguage } = useUIStore();

  const handleImagePick = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          `Please grant access to your ${useCamera ? 'camera' : 'photo library'} in settings.`
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        await updateProfile({ image: base64Image });
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update photo');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose how you want to select your photo',
      [
        { text: 'Take Photo', onPress: () => handleImagePick(true) },
        { text: 'Choose from Gallery', onPress: () => handleImagePick(false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(nextTheme);
  };

  if (!user) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background dark:bg-obsidian justify-center items-center p-6">
        <Image source={require('../../assets/logo-2.png')} style={{ width: 80, height: 80, marginBottom: 16 }} resizeMode="contain" />
        <Text className="text-3xl font-headline text-pharaoh-gold mb-2">Rahal</Text>
        <Text className="text-body-md text-on-surface-variant dark:text-outline text-center mb-8 px-6">
          Log in or sign up to access your profile settings, booking details, and personalized trip planners.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="w-full h-12 bg-pharaoh-gold rounded-full justify-center items-center shadow-md active:scale-95"
        >
          <Text className="text-white font-semibold uppercase tracking-wider text-label-md">
            Log In / Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background dark:bg-obsidian">
      {/* Top App Bar */}
      <View className="h-16 flex-row justify-between items-center px-4 border-b border-outline-variant/10 bg-surface dark:bg-obsidian">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={toggleSideMenu} className="p-2 active:scale-95">
            <Ionicons name="menu-outline" size={24} color="#C8922A" />
          </TouchableOpacity>
          <Text className="text-headline-md-mobile font-headline text-pharaoh-gold">Rahal</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} className="p-2 active:scale-95">
          <Ionicons name="sparkles-outline" size={22} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View className="flex-col items-center mt-6 mb-8">
          <View className="relative">
            {/* Papyrus double gold border style */}
            <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 2, borderRadius: 9999 }}>
              <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 2, borderRadius: 9999 }}>
                <View className="w-28 h-28 rounded-full overflow-hidden bg-primary-container/20">
                  {user?.image ? (
                    <Image source={{ uri: user.image }} className="w-full h-full object-cover" />
                  ) : (
                    <View className="w-full h-full bg-primary-fixed flex items-center justify-center">
                      <Text className="text-4xl font-headline text-on-primary-fixed">
                        {user?.name?.charAt(0).toUpperCase() || 'R'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            {profileLoading ? (
              <View className="absolute inset-0 w-32 h-32 justify-center items-center bg-black/30 rounded-full">
                <ActivityIndicator size="small" color="#C8922A" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={showImagePickerOptions}
                className="absolute bottom-1 right-1 bg-pharaoh-gold p-2.5 rounded-full shadow-lg active:scale-90"
              >
                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View className="items-center mt-4">
            <Text className="text-headline-md-mobile font-headline text-on-surface dark:text-inverse-on-surface">
              {user?.name || 'Guest'}
            </Text>
            <Text className="text-body-md text-on-surface-variant dark:text-outline mt-0.5">
              {user?.email}
            </Text>
            <View className="flex-row items-center mt-3 px-4 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/20">
              <Ionicons name="star" size={14} color="#C8922A" style={{ marginRight: 6 }} />
              <Text className="text-label-md font-semibold text-pharaoh-gold">
                {subscription?.planName === 'pro' ? 'Premium Tier' : 'Wanderer Tier'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu List (Bento-inspired List) */}
        <View className="mb-8">
          {/* Profile & Preferences */}
          <TouchableOpacity
            onPress={() => router.push('/settings/profile')}
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="person-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                Profile & Preferences
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                Bio, interests, and discovery settings
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#D4C4B0" />
          </TouchableOpacity>

          {/* Subscription */}
          <TouchableOpacity
            onPress={() => router.push('/subscription/plans')}
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="card-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                Subscription
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                Manage your Premium plan and billing
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#D4C4B0" />
          </TouchableOpacity>

          {/* Favorites */}
          <TouchableOpacity
            onPress={() => router.push('/favorites')}
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="heart-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                Favorites
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                Your saved temples, oases, and stays
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#D4C4B0" />
          </TouchableOpacity>

          {/* Bookings */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/trips')}
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="calendar-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                Bookings
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                Current and past travel itineraries
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#D4C4B0" />
          </TouchableOpacity>

          {/* Security */}
          <TouchableOpacity
            onPress={() => router.push('/settings/profile')}
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="shield-checkmark-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                Security
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                Password, 2FA, and privacy control
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#D4C4B0" />
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity
            onPress={toggleLanguage}
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="language-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center pr-2">
                <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                  Language
                </Text>
                <View className="bg-primary-fixed px-2 py-0.5 rounded">
                  <Text className="text-[10px] font-bold text-pharaoh-gold">EN / AR</Text>
                </View>
              </View>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                {i18n.language === 'ar' ? 'العربية' : 'English (US)'}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#D4C4B0" />
          </TouchableOpacity>

          {/* Theme */}
          <View
            className="flex-row items-center p-4 bg-surface-container-low dark:bg-sand-dark rounded-xl border border-outline-variant/10 mb-3"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="contrast-outline" size={22} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-on-surface dark:text-inverse-on-surface">
                Theme
              </Text>
              <Text className="text-xs text-on-surface-variant dark:text-outline mt-0.5">
                Light / Obsidian mode
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              className={`w-10 h-5 rounded-full relative justify-center ${
                isDarkMode ? 'bg-pharaoh-gold' : 'bg-outline-variant/60'
              }`}
            >
              <View
                style={{
                  transform: [{ translateX: isDarkMode ? 24 : 2 }],
                  width: 12,
                  height: 12,
                }}
                className="bg-white rounded-full"
              />
            </TouchableOpacity>
          </View>

          {/* Log Out */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4 bg-tertiary-container/5 dark:bg-tertiary-container/10 rounded-xl border border-tertiary-container/20 mb-3 active:opacity-85"
          >
            <View className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest/10 shadow-sm mr-4">
              <Ionicons name="log-out-outline" size={22} color="#8F1301" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-tertiary">
                Log Out
              </Text>
              <Text className="text-xs text-tertiary/80 mt-0.5">
                Securely exit your session
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(143, 19, 1, 0.4)" />
          </TouchableOpacity>
        </View>

        {/* Rahal Insight Tip Card */}
        <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 2, borderRadius: 12 }} className="mb-12">
          <View style={{ borderColor: '#C8922A', borderWidth: 1, borderRadius: 10 }} className="p-5 bg-surface-container-lowest dark:bg-sand-dark flex-row items-start gap-4">
            <View className="p-2.5 bg-primary-fixed/20 rounded-lg">
              <Ionicons name="sparkles" size={20} color="#C8922A" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-label-sm font-bold text-pharaoh-gold uppercase tracking-wider">
                  Rahal Insight
                </Text>
                <Text className="text-[10px] text-on-surface-variant dark:text-outline">
                  AI Concierge
                </Text>
              </View>
              <Text className="text-body-md text-on-surface dark:text-inverse-on-surface italic leading-5">
                "The Nile is at its most serene during the golden hour in Aswan. We recommend booking your felucca trip between 4:30 PM and 5:00 PM for the best atmospheric lighting."
              </Text>
            </View>
          </View>
        </View>

        {/* Extra Bottom Padding to clear Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}