// app/(tabs)/trips.tsx
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, CardContent, Badge, Button } from '@/components/ui';

export default function TripsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const upcomingTrips = [
    { id: '1', title: '4 Days in Luxor', destination: 'Luxor', date: 'Oct 15-18, 2024', status: 'upcoming', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400' },
    { id: '2', title: 'Red Sea Diving', destination: 'Sharm El Sheikh', date: 'Nov 20-24, 2024', status: 'upcoming', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400' },
  ];

  const pastTrips = [
    { id: '3', title: 'Cairo Food Tour', destination: 'Cairo', date: 'Sep 1-3, 2024', status: 'completed', image: 'https://images.unsplash.com/photo-1570108356363-237584d7d9b2?w=400' },
  ];

  const bookings = [
    { id: 'b1', hotel: 'Old Cataract Hotel', city: 'Aswan', checkIn: 'Oct 15', checkOut: 'Oct 18', status: 'confirmed', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
    { id: 'b2', hotel: 'Four Seasons Sharm', city: 'Sharm El Sheikh', checkIn: 'Nov 20', checkOut: 'Nov 24', status: 'pending', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
  ];

  const renderUpcomingTrips = () => {
    if (upcomingTrips.length === 0) {
      return (
        <Card className="bg-surface-container border border-outline-variant">
          <CardContent className="py-8 items-center">
            <Ionicons name="map-outline" size={48} color="#827564" />
            <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">
              {t('bookings.emptyStateTitle')}
            </Text>
            <Text className="text-body-md text-on-surface-variant text-center px-6 mb-4">
              {t('bookings.emptyStateSubtitle')}
            </Text>
            <Button variant="outline" onPress={() => router.push('/trip/generate')}>
              {t('bookings.exploreHotels')}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
        {upcomingTrips.map((trip) => (
          <TouchableOpacity key={trip.id} className="w-80 flex-shrink-0" onPress={() => router.push(`/trip/${trip.id}`)}>
            <Card className="p-0 overflow-hidden">
              <View className="relative h-40">
                <Image source={{ uri: trip.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View className="absolute top-3 right-3">
                  <Badge variant={trip.status === 'upcoming' ? 'blue' : 'green'}>
                    {trip.status === 'upcoming' ? '⏰' : '✅'} {t(`bookings.tabs.${trip.status}`)}
                  </Badge>
                </View>
              </View>
              <CardContent>
                <Text className="text-headline-md-mobile font-headline text-on-surface">{trip.title}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <Ionicons name="location-outline" size={14} color="#827564" />
                  <Text className="text-body-md text-on-surface-variant">{trip.destination}</Text>
                </View>
                <View className="flex-row items-center gap-2 mt-1">
                  <Ionicons name="calendar-outline" size={14} color="#827564" />
                  <Text className="text-body-md text-on-surface-variant">{trip.date}</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderPastTrips = () => (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-headline-md font-headline text-on-surface">
          {t('bookings.tabs.completed')}
        </Text>
        <TouchableOpacity>
          <Text className="text-label-md text-primary">{t('common.seeAll')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
        {pastTrips.map((trip) => (
          <TouchableOpacity key={trip.id} className="w-80 flex-shrink-0" onPress={() => router.push(`/trip/${trip.id}`)}>
            <Card className="p-0 overflow-hidden">
              <View className="relative h-40">
                <Image source={{ uri: trip.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View className="absolute top-3 right-3">
                  <Badge variant="green">✅ {t('bookings.tabs.completed')}</Badge>
                </View>
              </View>
              <CardContent>
                <Text className="text-headline-md-mobile font-headline text-on-surface">{trip.title}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <Ionicons name="location-outline" size={14} color="#827564" />
                  <Text className="text-body-md text-on-surface-variant">{trip.destination}</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBookings = () => (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-headline-md font-headline text-on-surface">
          {t('common.nav.bookings')}
        </Text>
        <TouchableOpacity>
          <Text className="text-label-md text-primary">{t('common.seeAll')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
        {bookings.map((booking) => (
          <TouchableOpacity key={booking.id} className="w-80 flex-shrink-0" onPress={() => router.push(`/booking/${booking.id}`)}>
            <Card className="p-0 overflow-hidden">
              <View className="relative h-40">
                <Image source={{ uri: booking.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View className="absolute top-3 right-3">
                  <Badge variant={booking.status === 'confirmed' ? 'green' : 'blue'}>
                    {booking.status === 'confirmed' ? '✅' : '⏳'} {t(`bookings.status.${booking.status}`)}
                  </Badge>
                </View>
              </View>
              <CardContent>
                <Text className="text-headline-md-mobile font-headline text-on-surface">{booking.hotel}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <Ionicons name="location-outline" size={14} color="#827564" />
                  <Text className="text-body-md text-on-surface-variant">{booking.city}</Text>
                </View>
                <View className="flex-row items-center gap-4 mt-2">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="calendar-outline" size={14} color="#827564" />
                    <Text className="text-label-md text-on-surface-variant">{booking.checkIn} - {booking.checkOut}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Header with Create Trip */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-display-lg-mobile font-headline text-on-surface">
                {t('common.nav.trips')}
              </Text>
              <Text className="text-body-md text-on-surface-variant mt-1">
                {t('home.destinations.subtitle')}
              </Text>
            </View>
            <Button variant="ai" size="sm" onPress={() => router.push('/trip/generate')}>
              <Ionicons name="sparkles" size={18} />
              <Text>{t('home.hero.ctaPrimary')}</Text>
            </Button>
          </View>

          {/* Upcoming Trips */}
          <View className="mb-8">
            {renderUpcomingTrips()}
          </View>

          {/* Past Trips */}
          <View className="mt-8 mb-8">
            {renderPastTrips()}
          </View>

          {/* My Bookings */}
          <View className="mb-8">
            {renderBookings()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}