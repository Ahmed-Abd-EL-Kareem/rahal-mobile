// app/favorites.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useColorScheme } from 'nativewind';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function FavoritesScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { 
    favoriteHotels, 
    favoriteDestinations, 
    removeHotelFavorite, 
    removeDestinationFavorite 
  } = useFavoritesStore();

  const [activeTab, setActiveTab] = useState<'hotels' | 'destinations'>('hotels');

  const handleRemoveHotel = (hotelId: string) => {
    Alert.alert(
      'Remove Favorite?',
      'This hotel will be removed from your saved treasures.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeHotelFavorite(hotelId);
            showToast({ type: 'success', message: 'Removed from favorites' });
          },
        },
      ]
    );
  };

  const handleRemoveDestination = (destId: string) => {
    Alert.alert(
      'Remove Favorite?',
      'This destination will be removed from your saved treasures.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeDestinationFavorite(destId);
            showToast({ type: 'success', message: 'Removed from favorites' });
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background dark:bg-obsidian justify-center items-center p-6">
        <Image source={require('../assets/logo-2.png')} style={{ width: 80, height: 80, marginBottom: 16 }} resizeMode="contain" />
        <Text className="text-3xl font-headline text-pharaoh-gold mb-2">Rahal</Text>
        <Text className="text-body-md text-on-surface-variant dark:text-outline text-center mb-8 px-6">
          Log in or sign up to view and manage your saved hotels and destinations.
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

  const showHotels = activeTab === 'hotels';
  const showDestinations = activeTab === 'destinations';
  const hasItems = showHotels ? favoriteHotels.length > 0 : favoriteDestinations.length > 0;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background dark:bg-obsidian">
      {/* Top App Bar */}
      <View className="h-16 flex-row justify-between items-center px-4 border-b border-outline-variant/10 bg-surface dark:bg-obsidian">
        <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-95">
          <Ionicons name="arrow-back-outline" size={24} color="#C8922A" />
        </TouchableOpacity>
        <Text className="text-headline-md-mobile font-headline text-pharaoh-gold">Rahal</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} className="p-2 active:scale-95">
          <Ionicons name="sparkles-outline" size={22} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        {/* Page Title */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-3xl font-headline text-primary dark:text-primary-fixed mb-6 text-center">
            My Treasures
          </Text>

          {/* Segmented Control */}
          <View className="flex-row bg-surface-container-low dark:bg-sand-dark rounded-full p-1 border border-outline-variant/40 self-center">
            <TouchableOpacity
              onPress={() => setActiveTab('hotels')}
              className="px-8 py-2.5 rounded-full"
              style={showHotels ? { backgroundColor: '#C8922A' } : null}
            >
              <Text 
                className="text-label-md font-semibold"
                style={{ color: showHotels ? '#FFFFFF' : (isDarkMode ? '#9C8F7C' : '#4F4537') }}
              >
                Hotels
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('destinations')}
              className="px-8 py-2.5 rounded-full"
              style={showDestinations ? { backgroundColor: '#C8922A' } : null}
            >
              <Text 
                className="text-label-md font-semibold"
                style={{ color: showDestinations ? '#FFFFFF' : (isDarkMode ? '#9C8F7C' : '#4F4537') }}
              >
                Destinations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content list */}
        {!hasItems ? (
          /* Empty State */
          <View className="flex-col items-center justify-center py-20 text-center">
            <View className="relative w-44 h-44 mb-8 justify-center items-center">
              <View className="absolute inset-0 bg-pharaoh-gold/5 dark:bg-pharaoh-gold/10 rounded-full" />
              <Ionicons name="heart-dislike-outline" size={80} color="rgba(200,146,42,0.3)" />
            </View>
            <Text className="text-headline-md font-headline text-primary dark:text-primary-fixed mb-3">
              Your Map is Empty
            </Text>
            <Text className="text-on-surface-variant dark:text-outline text-body-md max-w-xs text-center mb-8 leading-relaxed">
              The treasures of the Nile are waiting to be discovered. Start your journey by saving hotels or destinations that inspire you.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/explore')}
              className="px-10 py-3.5 bg-pharaoh-gold rounded-full flex-row items-center gap-2 shadow-md active:scale-95"
            >
              <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold text-label-md">Explore Stays</Text>
            </TouchableOpacity>
          </View>
        ) : showHotels ? (
          /* Hotels Grid */
          <View className="gap-6">
            {favoriteHotels.map((hotel) => (
              <View
                key={hotel._id}
                className="bg-surface-container-lowest dark:bg-sand-dark rounded-xl overflow-hidden border border-outline-variant/40 shadow-sm"
              >
                <View className="relative aspect-[4/3] w-full">
                  <Image source={{ uri: hotel.coverImage }} className="w-full h-full object-cover" />
                  <TouchableOpacity
                    onPress={() => handleRemoveHotel(hotel._id)}
                    className="absolute top-4 right-4 z-10 bg-black/30 p-2.5 rounded-full"
                  >
                    <Ionicons name="heart" size={20} color="#C8922A" />
                  </TouchableOpacity>
                  {(hotel.stars === 5 || (hotel as any).isPremium) && (
                    <View className="absolute bottom-0 left-0 w-full p-3 bg-black/50">
                      <Text className="text-[10px] font-bold text-white uppercase tracking-widest">
                        Premium AI Choice
                      </Text>
                    </View>
                  )}
                </View>
                <View className="p-5">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-headline-md-mobile font-headline text-primary dark:text-primary-fixed flex-1 pr-2">
                      {typeof hotel.name === 'string' ? hotel.name : (hotel.name[locale] || hotel.name.en)}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <Ionicons name="star" size={14} color="#C8922A" style={{ marginRight: 4 }} />
                      <Text className="text-label-sm font-bold text-pharaoh-gold">
                        {hotel.stars}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-on-surface-variant dark:text-outline text-body-md mb-4">
                    {hotel.city} • {(hotel as any).type || (hotel.stars === 5 ? 'Luxury Sanctuary' : 'Boutique Hotel')}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-primary dark:text-primary-fixed font-bold text-lg">
                      ${hotel.averagePricePerNight}
                      <Text className="text-on-surface-variant dark:text-outline font-normal text-sm">/night</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push(`/hotel/${hotel.slug}`)}
                      className="px-6 py-2.5 bg-nile-blue rounded-full active:scale-95"
                    >
                      <Text className="text-white font-semibold text-label-md">Book Stay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Destinations Grid */
          <View className="gap-6">
            {favoriteDestinations.map((dest) => (
              <View
                key={dest._id}
                className="relative aspect-video rounded-2xl overflow-hidden border border-outline-variant/40 shadow-sm"
              >
                {/* Image background & overlay */}
                <Image source={{ uri: dest.coverImage }} className="w-full h-full object-cover absolute inset-0" />
                <View className="absolute inset-0 bg-black/60" />

                <TouchableOpacity
                  onPress={() => handleRemoveDestination(dest._id)}
                  className="absolute top-4 right-4 z-10 bg-black/30 p-2.5 rounded-full"
                >
                  <Ionicons name="heart" size={20} color="#C8922A" />
                </TouchableOpacity>

                <View className="absolute bottom-6 left-6 right-6">
                  <View className="flex-row items-center gap-1.5 mb-1.5">
                    <Ionicons name="location-outline" size={14} color="#C8922A" />
                    <Text className="text-white/80 font-semibold uppercase tracking-wider text-[11px]">
                      {dest.city}
                    </Text>
                  </View>
                  <Text className="text-xl font-headline text-white mb-1">
                    {typeof dest.name === 'string' ? dest.name : (dest.name[locale] || dest.name.en)}
                  </Text>
                  <Text className="text-white/70 text-body-md mb-4" numberOfLines={2}>
                    {typeof dest.description === 'string' ? dest.description : (dest.description[locale] || dest.description.en)}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                      onPress={() => router.push(`/destination/${dest.slug}`)}
                      className="px-5 py-2 bg-pharaoh-gold rounded-full active:scale-95"
                    >
                      <Text className="text-white font-semibold text-label-md">Explore Site</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                      <Text className="text-white/60 text-label-sm">45 mins from center</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Heritage Divider */}
        <View className="flex-row items-center justify-center gap-4 my-16">
          <View className="h-[1px] flex-grow bg-pharaoh-gold/30" />
          <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 2 }}>
            <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 4 }} className="bg-surface dark:bg-sand-dark">
              <Ionicons name="home-outline" size={16} color="#C8922A" />
            </View>
          </View>
          <View className="h-[1px] flex-grow bg-pharaoh-gold/30" />
        </View>
      </ScrollView>
    </View>
  );
}
