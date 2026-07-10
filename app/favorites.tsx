// app/favorites.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Card, Badge, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useRouter } from 'expo-router';

function RenderHotelCard({
  hotel,
  router,
  onRemove,
}: {
  hotel: any;
  router: any;
  onRemove: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      key={hotel._id}
      onPress={() => router.push(`/hotel/${hotel._id}`)}
      className="w-full"
    >
      <Card className="flex-row p-0 overflow-hidden" style={{ borderRadius: 16 }}>
        <View className="w-32 flex-shrink-0">
          <Image
            source={{ uri: hotel.coverImage }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View className="flex-1 p-4">
          <View className="flex-row items-start justify-between gap-2 mb-2">
            <View className="flex-1">
              <Text
                className="text-headline-md-mobile font-headline text-on-surface"
                numberOfLines={1}
              >
                {hotel.name.en}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-body-md text-on-surface-variant">{hotel.city}</Text>
                {[...Array(hotel.stars)].map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#F8BC51" />
                ))}
              </View>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onRemove(hotel._id);
              }}
              className="p-2 rounded-lg bg-surface-container"
            >
              <MaterialIcons name="favorite" size={24} color="#C8922A" />
            </TouchableOpacity>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-body-lg font-bold text-primary">
                {hotel.averagePricePerNight} {hotel.currency}
              </Text>
              <Text className="text-label-sm text-on-surface-variant">/ night</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function RenderDestinationCard({
  dest,
  router,
  onRemove,
}: {
  dest: any;
  router: any;
  onRemove: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      key={dest._id}
      onPress={() => router.push(`/destination/${dest.slug}`)}
      className="w-full"
    >
      <Card className="flex-row p-0 overflow-hidden" style={{ borderRadius: 16 }}>
        <View className="w-32 flex-shrink-0">
          <Image
            source={{ uri: dest.coverImage }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View className="flex-1 p-4">
          <Text className="text-headline-md-mobile font-headline text-on-surface mb-1">
            {dest.name.en}
          </Text>
          <View className="flex-row items-center gap-2 text-on-surface-variant mb-2">
            <MaterialIcons name="location-on" size={16} />
            <Text className="text-body-md">
              {dest.city}, {dest.region}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Badge variant="blue">{dest.category}</Badge>
            <Text className="text-label-md text-on-surface-variant">
              {dest.averageBudgetPerDay} {dest.currency} / day
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function EmptyState({ router, icon }: { router: any; icon: string }) {
  const { t } = useTranslation();
  return (
    <View className="items-center py-20">
      <MaterialIcons name={icon as any} size={64} color="#827564" />
      <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">
        {t('favoritesPage.emptyTitle')}
      </Text>
      <Text className="text-on-surface-variant text-center px-8">
        {t('favoritesPage.emptySubtitle')}
      </Text>
      <Button
        variant="outline"
        className="mt-4 w-auto"
        onPress={() => router.push('/(tabs)/explore')}
      >
        {t('favoritesPage.exploreBtn')}
      </Button>
    </View>
  );
}

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();
  const [favoriteHotels, setFavoriteHotels] = useState<any[]>([]);
  const [favoriteDestinations, setFavoriteDestinations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hotels' | 'destinations'>('hotels');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  const loadFavorites = () => {
    // Mock data - replace with actual API call
    const mockHotels = [
      {
        _id: '1',
        name: { en: 'Old Cataract Hotel', ar: 'فندق أولد كتاركت' },
        city: 'Aswan',
        stars: 5,
        averagePricePerNight: 450,
        currency: 'USD',
        coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        isActive: true,
      },
      {
        _id: '2',
        name: { en: 'The Ritz-Carlton, Cairo', ar: 'ريتز كارلتون، القاهرة' },
        city: 'Cairo',
        stars: 5,
        averagePricePerNight: 320,
        currency: 'USD',
        coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
        isActive: true,
      },
      {
        _id: '3',
        name: { en: 'Four Seasons Sharm El Sheikh', ar: 'فور سيزونز شرم الشيخ' },
        city: 'Sharm El-Sheikh',
        stars: 5,
        averagePricePerNight: 580,
        currency: 'USD',
        coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
        isActive: true,
      },
    ];

    const mockDestinations = [
      {
        _id: 'd1',
        name: { en: 'Luxor', ar: 'الأقصر' },
        slug: 'luxor',
        city: 'Luxor',
        region: 'Upper Egypt',
        category: 'historical',
        coverImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400',
        averageBudgetPerDay: 280,
        currency: 'USD',
      },
      {
        _id: 'd2',
        name: { en: 'Siwa Oasis', ar: 'واحة سيوة' },
        slug: 'siwa',
        city: 'Siwa',
        region: 'Western Desert',
        category: 'nature',
        coverImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400',
        averageBudgetPerDay: 290,
        currency: 'USD',
      },
    ];

    setFavoriteHotels(mockHotels);
    setFavoriteDestinations(mockDestinations);
  };

  const handleRemoveHotel = (hotelId: string) => {
    Alert.alert(
      'Remove from favorites?',
      'This hotel will be removed from your saved sanctuaries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavoriteHotels((prev) => prev.filter((h) => h._id !== hotelId));
            showToast?.({ type: 'success', message: 'Removed from your sanctuaries.' });
          },
        },
      ]
    );
  };

  const handleRemoveDestination = (destId: string) => {
    Alert.alert(
      'Remove from favorites?',
      'This destination will be removed from your saved wonders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavoriteDestinations((prev) => prev.filter((d) => d._id !== destId));
            showToast?.({ type: 'success', message: 'Removed from your wonders.' });
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
            <MaterialIcons name="bookmark-border" size={48} color="#C8922A" />
          </View>
          <Text className="text-headline-md font-headline text-on-surface text-center mb-2">
            {t('favoritesPage.loginRequiredTitle')}
          </Text>
          <Text className="text-body-md text-on-surface-variant text-center mb-6 px-8">
            {t('favoritesPage.loginRequiredSubtitle')}
          </Text>
          <Button onPress={() => router.push('/(auth)/login')}>
            {t('favoritesPage.loginBtn')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-display-lg-mobile font-headline text-on-surface">
                {t('favoritesPage.title')}
              </Text>
              <Text className="text-body-md text-on-surface-variant mt-1">
                {t('favoritesPage.subtitle')}
              </Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View className="flex-row gap-2 mb-6 bg-surface-container rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setActiveTab('hotels')}
              className={`flex-1 py-2 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
                activeTab === 'hotels' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              <MaterialIcons name="hotel" size={20} />
              <Text className="text-label-md font-medium">{t('common.nav.favorites')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('destinations')}
              className={`flex-1 py-2 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
                activeTab === 'destinations'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <MaterialIcons name="location-on" size={20} />
              <Text className="text-label-md font-medium">
                {t('common.nav.favoriteDestinations')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'hotels' ? (
            favoriteHotels.length === 0 ? (
              <EmptyState router={router} icon="hotel" />
            ) : (
              <View className="gap-4">
                {favoriteHotels.map((hotel) => (
                  <RenderHotelCard
                    key={hotel._id}
                    hotel={hotel}
                    router={router}
                    onRemove={handleRemoveHotel}
                  />
                ))}
              </View>
            )
          ) : favoriteDestinations.length === 0 ? (
            <EmptyState router={router} icon="location-on" />
          ) : (
            <View className="gap-4">
              {favoriteDestinations.map((dest) => (
                <RenderDestinationCard
                  key={dest._id}
                  dest={dest}
                  router={router}
                  onRemove={handleRemoveDestination}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
