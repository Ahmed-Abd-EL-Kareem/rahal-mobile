// app/settings/profile.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, subscription, updateProfile, isLoading: profileLoading } = useAuthStore();
  const { setLanguage } = useUIStore();
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Upload image to server
      // For now, just update local state
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || '', email: user?.email || '' });
    setIsEditing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Profile Header */}
          <View className="flex-row items-center gap-4 mb-8">
            <TouchableOpacity onPress={handleImagePick} className="relative">
              <View className="w-28 h-28 rounded-full bg-primary-container flex-items-center justify-center overflow-hidden border-2 border-primary/30">
                {user?.image ? (
                  <Image source={{ uri: user.image }} style={{ width: 112, height: 112, borderRadius: 56 }} />
                ) : (
                  <Text style={{ fontSize: 48, fontFamily: 'PlayfairDisplay_700Bold', color: '#7E5700' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'R'}
                  </Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex-items-center justify-center border-2 border-background">
                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-headline-md font-headline text-on-surface">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChangeText={(v) => setFormData(prev => ({ ...prev, name: v }))}
                    className="w-auto"
                    autoFocus
                  />
                ) : (
                  user?.name || t('common.appName')
                )}
              </Text>
              <Text className="text-body-md text-on-surface-variant mt-1">{user?.email}</Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View className="w-8 h-8 rounded-full bg-primary/10 flex-items-center justify-center">
                  <MaterialIcons name={isDark ? 'dark_mode' : 'light_mode'} size={18} color="#C8922A" />
                </View>
                <Text className="text-label-md text-on-surface-variant">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
            </View>
          </View>

          {/* Edit/Save Actions */}
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="w-full flex-row items-center justify-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/30"
            >
              <Ionicons name="create-outline" size={24} color="#C8922A" />
              <Text className="text-body-md text-primary font-medium">Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-3">
              <Button variant="primary" onPress={handleSave} fullWidth flex={1}>
                {t('account.saveChanges')}
              </Button>
              <Button variant="outline" onPress={handleCancel} fullWidth flex={1}>
                {t('account.cancel')}
              </Button>
            </View>
          )}

          {/* Profile Form */}
          {isEditing && (
            <Card className="mt-6">
              <CardContent>
                <Text className="text-headline-md font-headline text-on-surface mb-4">
                  {t('account.fullName')}
                </Text>
                <Input
                  label={t('account.fullName')}
                  value={formData.name}
                  onChangeText={(v) => setFormData(prev => ({ ...prev, name: v }))}
                  placeholder={t('auth.namePlaceholder')}
                />
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <View className="px-4 mt-8">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4">
              Account Information
            </Text>

            <Card className="mb-4">
              <CardContent>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                    <Ionicons name="person-outline" size={24} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-md text-on-surface-variant">Full Name</Text>
                    <Text className="text-body-md text-on-surface mt-1">{user?.name || 'Not set'}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-secondary/10 flex-items-center justify-center">
                    <Ionicons name="mail-outline" size={24} color="#366286" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-md text-on-surface-variant">Email Address</Text>
                    <Text className="text-body-md text-on-surface mt-1">{user?.email}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-success/10 flex-items-center justify-center">
                    <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-md text-on-surface-variant">Member Since</Text>
                    <Text className="text-body-md text-on-surface mt-1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                    <Ionicons name="cash-outline" size={24} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-md text-on-surface-variant">Preferred Currency</Text>
                    <Text className="text-body-md text-on-surface mt-1">EGP (Egyptian Pound)</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>

          {/* Connected Accounts */}
          <View className="px-4 mt-8">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4">
              Connected Accounts
            </Text>

            <Card className="mb-4">
              <CardContent>
                <TouchableOpacity className="flex-row items-center gap-4 py-3">
                  <View className="w-12 h-12 rounded-lg bg-primary/10 flex-items-center justify-center">
                    <Ionicons name="logo-google" size={28} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-md text-on-surface">Google</Text>
                    <Text className="text-label-sm text-on-surface-variant">Connected</Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  </View>
                </TouchableOpacity>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent>
                <TouchableOpacity className="flex-row items-center gap-4 py-3">
                  <View className="w-12 h-12 rounded-lg bg-secondary/10 flex-items-center justify-center">
                    <Ionicons name="logo-apple" size={28} color="#366286" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-md text-on-surface">Apple</Text>
                    <Text className="text-label-sm text-on-surface-variant">Not connected</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={28} color="#827564" />
                </TouchableOpacity>
              </CardContent>
            </Card>
          </View>

          {/* Support */}
          <View className="px-4 mt-8">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4">
              Support
            </Text>

            <Card className="mb-4">
              <CardContent>
                <TouchableOpacity className="flex-row items-center gap-4 py-3">
                  <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                    <Ionicons name="help-circle-outline" size={24} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-md text-on-surface">Help Center</Text>
                    <Text className="text-label-sm text-on-surface-variant">FAQs, guides, and support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#827564" />
                </TouchableOpacity>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent>
                <TouchableOpacity className="flex-row items-center gap-4 py-3">
                  <View className="w-10 h-10 rounded-lg bg-secondary/10 flex-items-center justify-center">
                    <Ionicons name="document-text-outline" size={24} color="#366286" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-md text-on-surface">Privacy Policy</Text>
                    <Text className="text-label-sm text-on-surface-variant">How we protect your data</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#827564" />
                </TouchableOpacity>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent>
                <TouchableOpacity className="flex-row items-center gap-4 py-3">
                  <View className="w-10 h-10 rounded-lg bg-tertiary/10 flex-items-center justify-center">
                    <Ionicons name="shield-checkmark-outline" size={24} color="#B12D17" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-md text-on-surface">Terms of Service</Text>
                    <Text className="text-label-sm text-on-surface-variant">Our terms and conditions</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#827564" />
                </TouchableOpacity>
              </CardContent>
            </Card>

            {/* Logout */}
            <View className="pt-4">
              <Button variant="ghost" fullWidth destructive onPress={handleLogout} disabled={profileLoading}>
                <Ionicons name="log-out-outline" size={24} style={{ marginRight: 8 }} />
                <Text>{t('common.nav.logout')}</Text>
              </Button>
            </View>

            <View className="h-20" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}