// app/settings/profile.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'nativewind';

export default function ProfileSettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();

  const { user, updateProfile, changePassword, isLoading: profileLoading } = useAuthStore();
  const { showToast, setLanguage } = useUIStore();

  const [fullName, setFullName] = useState(user?.name || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(user?.preferredLanguage || 'en');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EGP'>(user?.preferredCurrency || 'USD');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Password States
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Flow States
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setSelectedTheme(mode);
    if (mode === 'system') {
      setColorScheme('system');
    } else {
      setColorScheme(mode);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }

    if (showPasswordFields) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Validation Error', 'Please fill in all password fields.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Validation Error', 'New passwords do not match.');
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // 1. Update Profile Information (Name, Language, Currency)
      await updateProfile({
        name: fullName,
        preferredLanguage: selectedLanguage,
        preferredCurrency: selectedCurrency,
      });

      // 2. Update local UI i18n settings to stay synchronized
      if (selectedLanguage !== i18n.language) {
        await i18n.changeLanguage(selectedLanguage);
        setLanguage(selectedLanguage);
      }

      // 3. Update Password if requested
      if (showPasswordFields) {
        await changePassword(currentPassword, newPassword);
      }

      // 4. Update Success state
      setSaveStatus('success');
      showToast({ type: 'success', message: 'Profile updated successfully!' });

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      setIsSaving(false);
      setSaveStatus('error');
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save changes');
    }
  };

  // Formatted Member Since date
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '2024';

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background dark:bg-obsidian">
      {/* Top App Bar */}
      <View className="h-16 flex-row justify-between items-center px-4 border-b border-outline-variant/10 bg-surface dark:bg-obsidian">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-95">
            <Ionicons name="arrow-back-outline" size={24} color="#827564" />
          </TouchableOpacity>
          <Text className="text-headline-md-mobile font-headline text-pharaoh-gold">Settings</Text>
        </View>
        <Ionicons name="sparkles" size={18} color="#C8922A" style={{ marginRight: 8 }} />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Profile Header Section */}
        <View className="flex-col items-center mt-6 mb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest dark:border-sand-dark shadow-xl ring-2 ring-pharaoh-gold/20 bg-primary-container/20">
              {user?.image ? (
                <Image source={{ uri: user.image }} className="w-full h-full object-cover" />
              ) : (
                <View className="w-full h-full bg-primary-fixed flex items-center justify-center">
                  <Text className="text-5xl font-headline text-on-primary-fixed">
                    {user?.name?.charAt(0).toUpperCase() || 'R'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={showImagePickerOptions}
              className="absolute bottom-0 right-0 p-2.5 bg-pharaoh-gold text-white rounded-full shadow-lg active:scale-95"
            >
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View className="mt-4 text-center">
            <Text className="text-headline-md font-headline text-on-surface dark:text-surface-bright text-center">
              {fullName || user?.name || 'Omar Al-Sayed'}
            </Text>
            <Text className="text-body-md text-on-surface-variant dark:text-outline text-center mt-1">
              Exploring the Nile since {memberSince}
            </Text>
          </View>
        </View>

        {/* Basic Information Form */}
        <View className="space-y-6">
          <Text className="text-label-md font-bold text-pharaoh-gold uppercase tracking-widest mb-3">
            Identity
          </Text>

          <View className="space-y-1.5 mb-4">
            <Text className="text-label-sm text-on-surface-variant dark:text-outline">
              Full Name
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low dark:bg-sand-dark border border-outline-variant/40 text-on-surface dark:text-inverse-on-surface focus:border-nile-blue font-body-md"
              placeholder="Enter your name"
            />
          </View>

          {/* Password Action */}
          <TouchableOpacity
            onPress={() => setShowPasswordFields(!showPasswordFields)}
            className="flex-row items-center gap-2 py-2 mb-4"
          >
            <Ionicons name="lock-closed-outline" size={18} color="#C8922A" />
            <Text className="text-label-md text-nile-blue dark:text-secondary-fixed-dim hover:underline decoration-pharaoh-gold">
              {showPasswordFields ? 'Hide Password Form' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          {/* Change Password Inline Fields */}
          {showPasswordFields && (
            <View className="space-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-sand-dark border border-outline-variant/20 mb-6">
              <View className="space-y-1">
                <Text className="text-label-sm text-on-surface-variant dark:text-outline">Current Password</Text>
                <TextInput
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface dark:bg-obsidian border border-outline-variant/40 text-on-surface dark:text-inverse-on-surface font-body-md"
                  placeholder="••••••••"
                />
              </View>
              <View className="space-y-1">
                <Text className="text-label-sm text-on-surface-variant dark:text-outline">New Password</Text>
                <TextInput
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface dark:bg-obsidian border border-outline-variant/40 text-on-surface dark:text-inverse-on-surface font-body-md"
                  placeholder="••••••••"
                />
              </View>
              <View className="space-y-1">
                <Text className="text-label-sm text-on-surface-variant dark:text-outline">Confirm New Password</Text>
                <TextInput
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface dark:bg-obsidian border border-outline-variant/40 text-on-surface dark:text-inverse-on-surface font-body-md"
                  placeholder="••••••••"
                />
              </View>
            </View>
          )}
        </View>

        <View className="h-px bg-outline-variant/30 w-full my-6" />

        {/* Regional Preferences Section */}
        <View className="space-y-6">
          {/* Language Cards */}
          <View className="mb-6">
            <Text className="text-label-md font-bold text-pharaoh-gold uppercase tracking-widest mb-3">
              Language
            </Text>
            <View className="flex-row gap-3">
              {/* English */}
              <TouchableOpacity
                onPress={() => setSelectedLanguage('en')}
                className={`flex-1 flex-row items-center justify-between p-4 rounded-xl border ${
                  selectedLanguage === 'en'
                    ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                    : 'border-outline-variant/40 bg-surface dark:bg-sand-dark'
                }`}
              >
                <Text className="font-body-md text-on-surface dark:text-inverse-on-surface">English</Text>
                <View
                  style={{ borderColor: '#C8922A', borderWidth: 2 }}
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {selectedLanguage === 'en' && (
                    <View className="w-2 h-2 rounded-full bg-pharaoh-gold" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Arabic */}
              <TouchableOpacity
                onPress={() => setSelectedLanguage('ar')}
                className={`flex-1 flex-row items-center justify-between p-4 rounded-xl border ${
                  selectedLanguage === 'ar'
                    ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                    : 'border-outline-variant/40 bg-surface dark:bg-sand-dark'
                }`}
              >
                <Text className="font-body-md text-on-surface dark:text-inverse-on-surface">العربية</Text>
                <View
                  style={{ borderColor: '#C8922A', borderWidth: 2 }}
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {selectedLanguage === 'ar' && (
                    <View className="w-2 h-2 rounded-full bg-pharaoh-gold" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Currency Cards */}
          <View className="mb-6">
            <Text className="text-label-md font-bold text-pharaoh-gold uppercase tracking-widest mb-3">
              Currency
            </Text>
            <View className="flex-row gap-3">
              {/* USD */}
              <TouchableOpacity
                onPress={() => setSelectedCurrency('USD')}
                className={`flex-1 flex-row items-center justify-between p-4 rounded-xl border ${
                  selectedCurrency === 'USD'
                    ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                    : 'border-outline-variant/40 bg-surface dark:bg-sand-dark'
                }`}
              >
                <Text className="font-body-md text-on-surface dark:text-inverse-on-surface">USD ($)</Text>
                <View
                  style={{ borderColor: '#C8922A', borderWidth: 2 }}
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {selectedCurrency === 'USD' && (
                    <View className="w-2 h-2 rounded-full bg-pharaoh-gold" />
                  )}
                </View>
              </TouchableOpacity>

              {/* EGP */}
              <TouchableOpacity
                onPress={() => setSelectedCurrency('EGP')}
                className={`flex-1 flex-row items-center justify-between p-4 rounded-xl border ${
                  selectedCurrency === 'EGP'
                    ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                    : 'border-outline-variant/40 bg-surface dark:bg-sand-dark'
                }`}
              >
                <Text className="font-body-md text-on-surface dark:text-inverse-on-surface">EGP (ج.م)</Text>
                <View
                  style={{ borderColor: '#C8922A', borderWidth: 2 }}
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {selectedCurrency === 'EGP' && (
                    <View className="w-2 h-2 rounded-full bg-pharaoh-gold" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="space-y-6 pt-4 mb-4">
          <View className="mb-2">
            <Text className="text-label-md font-bold text-pharaoh-gold uppercase tracking-widest">
              Appearance
            </Text>
            <Text className="text-label-sm text-on-surface-variant dark:text-outline mt-0.5">
              Customize your interface theme
            </Text>
          </View>
          <View className="flex-row gap-3">
            {/* Light */}
            <TouchableOpacity
              onPress={() => handleThemeChange('light')}
              className={`flex-1 flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selectedTheme === 'light'
                  ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                  : 'border-outline-variant/20 bg-surface dark:bg-sand-dark'
              }`}
            >
              <Ionicons name="sunny-outline" size={20} color="#C8922A" />
              <Text className="text-label-sm text-on-surface dark:text-inverse-on-surface">Light</Text>
            </TouchableOpacity>

            {/* Dark */}
            <TouchableOpacity
              onPress={() => handleThemeChange('dark')}
              className={`flex-1 flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selectedTheme === 'dark'
                  ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                  : 'border-outline-variant/20 bg-surface dark:bg-sand-dark'
              }`}
            >
              <Ionicons name="moon-outline" size={20} color="#C8922A" />
              <Text className="text-label-sm text-on-surface dark:text-inverse-on-surface">Dark</Text>
            </TouchableOpacity>

            {/* System */}
            <TouchableOpacity
              onPress={() => handleThemeChange('system')}
              className={`flex-1 flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selectedTheme === 'system'
                  ? 'border-pharaoh-gold bg-primary-fixed/20 dark:bg-primary-container/20'
                  : 'border-outline-variant/20 bg-surface dark:bg-sand-dark'
              }`}
            >
              <Ionicons name="phone-portrait-outline" size={20} color="#C8922A" />
              <Text className="text-label-sm text-on-surface dark:text-inverse-on-surface">System</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Papyrus Decorative Divider */}
        <View className="flex-row items-center justify-center gap-4 py-8">
          <View className="h-px bg-pharaoh-gold flex-grow opacity-30" />
          <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 2 }}>
            <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 4 }} className="bg-surface dark:bg-sand-dark">
              <Ionicons name="home-outline" size={18} color="#C8922A" />
            </View>
          </View>
          <View className="h-px bg-pharaoh-gold flex-grow opacity-30" />
        </View>
      </ScrollView>

      {/* Sticky Footer Buttons */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute bottom-0 left-0 right-0 z-50 bg-surface/90 dark:bg-obsidian/90 border-t border-outline-variant/20 px-6 py-4 flex-row gap-4"
      >
        <TouchableOpacity
          disabled={isSaving}
          onPress={() => router.back()}
          className="flex-1 px-6 py-3.5 rounded-full border-2 border-outline-variant/60 hover:bg-surface-container-highest justify-center items-center active:scale-95"
        >
          <Text className="text-label-md font-semibold text-on-surface dark:text-inverse-on-surface">
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isSaving}
          onPress={handleSave}
          style={{
            flex: 2,
            backgroundColor: saveStatus === 'success' ? '#2D7A4F' : '#C8922A',
          }}
          className="px-8 py-3.5 rounded-full shadow-lg shadow-pharaoh-gold/20 justify-center items-center flex-row gap-2 active:scale-95"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text className="text-white font-semibold text-label-md">
                {saveStatus === 'success' ? 'Saved Successfully!' : 'Save Changes'}
              </Text>
              <Ionicons
                name={saveStatus === 'success' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={18}
                color="#FFFFFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}