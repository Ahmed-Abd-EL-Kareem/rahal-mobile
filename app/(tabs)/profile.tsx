// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, subscription, logout, updateProfile, isLoading: profileLoading } = useAuthStore();
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
      // In real app: upload to backend and update user
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

  const handleLogout = () => {
    Alert.alert(
      t('common.nav.logout'),
      'Are you sure you want to log out?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.nav.logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const planNames = {
    free: t('home.pricing.wanderer.title'),
    pro: t('home.pricing.pro.title'),
    enterprise: 'Enterprise',
  };

  const planBadges = {
    free: 'default',
    pro: 'gold',
    enterprise: 'blue',
  } as const;

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
                  <input
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

          {/* Subscription Card */}
          {subscription && (
            <View className="px-4 mb-4">
              <Card className="bg-primary/5 border-primary/30">
                <CardContent>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                        <MaterialIcons name={subscription?.planName === 'pro' ? 'workspace-premium' : 'star'} size={24} color="#C8922A" />
                      </View>
                      <View>
                        <Text className="text-headline-md font-headline text-on-surface">
                          {planNames[subscription.planName as keyof typeof planNames]}
                        </Text>
                        <Text className="text-body-md text-on-surface-variant">
                          {subscription.status === 'active' ? t('account.activePlanBadge') : t('account.canceledPlanBadge')}
                        </Text>
                      </View>
                    </View>
                    {subscription.planName === 'free' && (
                      <Button variant="secondary" size="sm" onPress={() => router.push('/subscription/plans')}>
                        {t('account.upgradeBtn')}
                      </Button>
                    )}
                  </View>
                  
                  <View className="mt-6 grid grid-cols-3 gap-4">
                    <View className="col-span-1">
                      <Text className="text-label-sm text-on-surface/70">{t('account.tripsLimit')}</Text>
                      <Text className="text-headline-md font-headline text-on-primary mt-1">
                        {subscription.usage?.tripsThisMonth || 0} / {subscription.plan?.limits?.tripsPerMonth || '∞'}
                      </Text>
                    </View>
                    <View className="col-span-1">
                      <Text className="text-label-sm text-on-primary/70">{t('account.tokensLimit')}</Text>
                      <Text className="text-headline-md font-headline text-on-primary mt-1">
                        {(subscription.usage?.tokensUsedThisMonth || 0).toLocaleString()} / {(subscription.plan?.limits?.tokensPerMonth || 15000).toLocaleString()}
                      </Text>
                    </View>
                    <View className="col-span-1">
                      <Text className="text-label-sm text-on-primary/70">{t('account.requestsLimit')}</Text>
                      <Text className="text-headline-md font-headline text-on-primary mt-1">
                        {subscription.usage?.requestsToday || 0} / {subscription.plan?.limits?.requestsPerDay || 10}
                      </Text>
                    </View>
                  </View>

                  {subscription.planName !== 'free' && (
                    <Button variant="outline" className="mt-6" fullWidth onPress={() => router.push('/settings/account')}>
                      {t('account.cancelBtn')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </View>
          )}

          {/* Menu Sections */}
          <View className="px-4 space-y-4">
            {/* Account Settings */}
            <Card className="p-0 overflow-hidden">
              <Text className="text-label-md text-on-surface-variant uppercase tracking-wider px-4 py-3 border-b border-outline-variant">
                {t('account.sidebarProfile')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/settings/profile')} className="flex-row items-center gap-4 py-4">
                <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                  <Ionicons name="person-outline" size={24} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">{t('account.sidebarProfile')}</Text>
                  <Text className="text-label-sm text-on-surface-variant">{t('account.profileSubtitle')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#827564" />
              </TouchableOpacity>
              <View className="h-px bg-outline-variant mx-4" />
              <TouchableOpacity onPress={() => router.push('/subscription/plans')} className="flex-row items-center gap-4 py-4">
                <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                  <Ionicons name="card-outline" size={24} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">{t('account.sidebarSubscription')}</Text>
                  <Text className="text-body-md text-on-surface-variant mt-1">{t('account.subscriptionSubtitle')}</Text>
                </View>
              </TouchableOpacity>
              <View className="h-px bg-outline-variant mx-4" />
              <TouchableOpacity onPress={() => router.push('/settings/account')} className="flex-row items-center gap-4 py-4">
                <View className="w-10 h-10 rounded-lg bg-secondary/10 flex-items-center justify-center">
                  <Ionicons name="lock-closed-outline" size={24} color="#366286" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">{t('account.changePasswordBtn')}</Text>
                  <Text className="text-body-md text-on-surface-variant mt-1">{t('account.changePasswordDesc')}</Text>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Preferences */}
            <Card className="p-0 overflow-hidden">
              <Text className="text-label-md text-on-surface-variant uppercase tracking-wider px-4 py-3 border-b border-outline-variant">
                {t('account.sidebarPreferences')}
              </Text>
              <TouchableOpacity onPress={() => setLanguage(t('common.locale') === 'ar' ? 'en' : 'ar')} className="flex-row items-center justify-between py-4 px-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                    <Ionicons name="language-outline" size={24} color="#C8922A" />
                  </View>
                  <View>
                    <Text className="text-body-lg font-medium text-on-surface">{t('account.preferredLanguage')}</Text>
                    <Text className="text-label-sm text-on-surface-variant">
                      {t('common.locale') === 'ar' ? 'العربية' : 'English'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setLanguage(t('common.locale') === 'ar' ? 'en' : 'ar')} className="p-2">
                  <Ionicons name="chevron-forward" size={24} color="#827564" />
                </TouchableOpacity>
              </TouchableOpacity>
              <View className="h-px bg-outline-variant mx-4" />
              <TouchableOpacity className="flex-row items-center justify-between py-4 px-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-lg bg-secondary/10 flex-items-center justify-center">
                    <Ionicons name="cash-outline" size={24} color="#366286" />
                  </View>
                  <View>
                    <Text className="text-label-md text-on-surface-variant">{t('account.currency')}</Text>
                    <Text className="text-body-md text-on-surface mt-1">EGP</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Favorites */}
            <Card className="p-0 overflow-hidden">
              <Text className="text-label-md text-on-surface-variant uppercase tracking-wider px-4 py-3 border-b border-outline-variant">
                {t('common.nav.favorites')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/favorites')} className="flex-row items-center gap-4 py-4">
                <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                  <Ionicons name="heart-outline" size={24} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">{t('common.nav.favorites')}</Text>
                  <Text className="text-label-sm text-on-surface-variant">{t('common.nav.favoriteDestinations')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#827564" />
              </TouchableOpacity>
            </Card>

            {/* Support */}
            <Card className="p-0 overflow-hidden">
              <Text className="text-label-md text-on-surface-variant uppercase tracking-wider px-4 py-3 border-b border-outline-variant">
                Support
              </Text>
              <TouchableOpacity className="flex-row items-center gap-4 py-4 px-4">
                <View className="w-10 h-10 rounded-lg bg-primary/10 flex-items-center justify-center">
                  <Ionicons name="help-circle-outline" size={24} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">Help Center</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#827564" />
              </TouchableOpacity>
              <View className="h-px bg-outline-variant mx-4" />
              <TouchableOpacity className="flex-row items-center gap-4 py-4 px-4">
                <View className="w-10 h-10 rounded-lg bg-secondary/10 flex-items-center justify-center">
                  <Ionicons name="document-text-outline" size={24} color="#366286" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#827564" />
              </TouchableOpacity>
              <View className="h-px bg-outline-variant mx-4" />
              <TouchableOpacity className="flex-row items-center gap-4 py-4 px-4">
                <View className="w-10 h-10 rounded-lg bg-tertiary/10 flex-items-center justify-center">
                  <Ionicons name="shield-checkmark-outline" size={24} color="#B12D17" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md text-on-surface">Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#827564" />
              </TouchableOpacity>
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