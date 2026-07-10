// app/(tabs)/explore.tsx
import { ScrollView, View, Text, TouchableOpacity, Image, SafeAreaView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, Badge, Button, Input } from '@/components/ui';
import { SearchBar } from '@/components/ui/SearchBar';

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categories = [
    t('destinationsListing.allRegions'),
    t('destinationsListing.historical'),
    t('destinationsListing.beach'),
    t('destinationsListing.adventure'),
    t('destinationsListing.cultural'),
    t('destinationsListing.religious'),
    t('destinationsListing.nature'),
    t('destinationsListing.landmark'),
  ];

  const destinations = [
    { id: 1, name: { en: 'Great Pyramid of Giza', ar: 'الهرم الأكبر بالجيزة' }, city: 'Cairo', region: 'Lower Egypt', category: 'historical', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400', rating: 4.9, reviews: 12400, budget: 360 },
    { id: 2, name: { en: 'Luxor Temple', ar: 'معبد الأقصر' }, city: 'Luxor', region: 'Upper Egypt', category: 'historical', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400', rating: 4.8, reviews: 8900, budget: 280 },
    { id: 3, name: { en: 'Abu Simbel', ar: 'أبو سمبل' }, city: 'Aswan', region: 'Upper Egypt', category: 'historical', image: 'https://images.unsplash.com/photo-1573212163686-513a473a6c4a?w=400', rating: 4.9, reviews: 5600, budget: 450 },
    { id: 4, name: { en: 'Sharm El Sheikh', ar: 'شرم الشيخ' }, city: 'Sharm El-Sheikh', region: 'Red Sea', category: 'beach', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.7, reviews: 15200, budget: 520 },
    { id: 5, name: { en: 'White Desert', ar: 'الصحراء البيضاء' }, city: 'Faiyum', region: 'Western Desert', category: 'adventure', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400', rating: 4.8, reviews: 3400, budget: 380 },
    { id: 6, name: { en: 'Siwa Oasis', ar: 'واحة سيوة' }, city: 'Siwa', region: 'Western Desert', category: 'nature', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', rating: 4.9, reviews: 2100, budget: 290 },
    { id: 7, name: { en: 'Khan el-Khalili', ar: 'خان الخليلي' }, city: 'Cairo', region: 'Lower Egypt', category: 'cultural', image: 'https://images.unsplash.com/photo-1570108356363-237584d7d9b2?w=400', rating: 4.6, reviews: 9800, budget: 120 },
    { id: 8, name: { en: 'Alexandria Library', ar: 'مكتبة الإسكندرية' }, city: 'Alexandria', region: 'Mediterranean', category: 'cultural', image: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=400', rating: 4.7, reviews: 4300, budget: 180 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search & AI Chat */}
        <View className="px-4 py-4">
          <SearchBar placeholder={t('destinationsListing.searchPlaceholder')} />
          
          <View className="mt-4 flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ai')}
              className="flex-1 bg-primary/10 border border-primary/30 rounded-xl p-4 flex-row items-center gap-3"
            >
              <View className="w-12 h-12 rounded-xl bg-primary/20 flex-items-center justify-center">
                <Ionicons name="sparkles" size={24} color="#C8922A" />
              </View>
              <View>
                <Text className="text-label-md font-medium text-primary">{t('destinationsListing.rahalAi')}</Text>
                <Text className="text-label-sm text-primary/80 mt-1">{t('destinationsListing.startAIChatTitle')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#C8922A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filters */}
        <View className="px-4 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                className={`px-4 py-2 rounded-full border ${
                  i === 0
                    ? 'bg-primary border-primary'
                    : 'bg-surface-container border-outline-variant'
                }`}
              >
                <Text className={i === 0 ? 'text-on-primary' : 'text-on-surface-variant'}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Filters */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-label-md text-on-surface-variant">{t('destinationsListing.activeFilters')}</Text>
            <Badge variant="gold" className="ml-auto">{t('destinationsListing.historical')}</Badge>
          </View>
        </View>

        {/* Grid View Toggle */}
        <View className="px-4 mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-label-md text-on-surface-variant">{t('destinationsListing.showingResults', { count: destinations.length })}</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="p-2 rounded-lg bg-surface-container">
              <Ionicons name="grid-outline" size={24} color="#1C1C19" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-lg bg-surface-container">
              <Ionicons name="map-outline" size={24} color="#827564" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Destinations Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 gap-4 pb-4">
          {destinations.map((dest) => (
            <TouchableOpacity key={dest.id} className="w-72 flex-shrink-0" onPress={() => router.push(`/destination/${dest.id}`)}>
              <Card className="p-0 overflow-hidden">
                <View className="relative h-48">
                  <Image source={{ uri: dest.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <View className="absolute top-3 left-3">
                    <Badge variant="gold">{t(`destinationsListing.${dest.category}`)}</Badge>
                  </View>
                  <View className="absolute top-3 right-3">
                    <Badge variant="green">{dest.rating} ({dest.reviews})</Badge>
                  </View>
                </View>
                <CardContent>
                  <Text className="text-headline-md-mobile font-headline text-on-surface">{dest.name.en}</Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Ionicons name="location-outline" size={14} color="#827564" />
                    <Text className="text-body-md text-on-surface-variant">{dest.city}, {dest.region}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center gap-1">
                      <Text className="text-body-md font-bold text-primary">{dest.budget} EGP</Text>
                      <Text className="text-label-sm text-on-surface-variant">{t('destinationsListing.averageBudgetUnit')}</Text>
                    </View>
                    <Button variant="outline" size="sm" className="ml-2">
                      {t('destinationsListing.exploreBtn')}
                    </Button>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Load More */}
        <View className="px-4 py-4">
          <Button variant="outline" fullWidth>
            {t('destinationsListing.loadMore')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}