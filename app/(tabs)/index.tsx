// app/(tabs)/index.tsx
import { ScrollView, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, SparkleBadge, Button } from '@/components/ui';
import { SearchBar } from '@/components/ui/SearchBar';
import { HeroHeader } from '@/components/layout/HeroHeader';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const destinations = [
    { id: 1, name: t('home.destinations.cairo.name'), tag: t('home.destinations.cairo.tag'), image: 'https://images.unsplash.com/photo-1570108356363-237584d7d9b2?w=400', gradient: ['#C8922A', '#F8BC51'] },
    { id: 2, name: t('home.destinations.luxor.name'), tag: t('home.destinations.luxor.tag'), image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400', gradient: ['#B12D17', '#FF6E53'] },
    { id: 3, name: t('home.destinations.aswan.name'), tag: t('home.destinations.aswan.tag'), image: 'https://images.unsplash.com/photo-1573212163686-513a473a6c4a?w=400', gradient: ['#1B4B6E', '#366286'] },
    { id: 4, name: t('home.destinations.sharm.name'), tag: t('home.destinations.sharm.tag'), image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', gradient: ['#2D7A4F', '#6BBF6B'] },
    { id: 5, name: t('home.destinations.alexandria.name'), tag: t('home.destinations.alexandria.tag'), image: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=400', gradient: ['#1B4B6E', '#8AB4D8'] },
  ];

  const hotels = [
    { id: 1, name: t('home.hotels.h1.name'), desc: t('home.hotels.h1.desc'), price: t('home.hotels.h1.price'), image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', topPick: true },
    { id: 2, name: t('home.hotels.h2.name'), desc: t('home.hotels.h2.desc'), price: t('home.hotels.h2.price'), image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', topPick: false },
    { id: 3, name: t('home.hotels.h3.name'), desc: t('home.hotels.h3.desc'), price: t('home.hotels.h3.price'), image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', topPick: false },
  ];

  const features = [
    { icon: 'calendar-outline', title: t('home.features.f1Title'), desc: t('home.features.f1Desc') },
    { icon: 'search-outline', title: t('home.features.f2Title'), desc: t('home.features.f2Desc') },
    { icon: 'chatbubbles-outline', title: t('home.features.f3Title'), desc: t('home.features.f3Desc') },
    { icon: 'shield-checkmark-outline', title: t('home.features.f4Title'), desc: t('home.features.f4Desc') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <HeroHeader 
          title={t('home.hero.title')}
          subtitle={t('home.hero.subtitle')}
          ctaPrimary={t('home.hero.ctaPrimary')}
          ctaSecondary={t('home.hero.ctaSecondary')}
          stats={[
            { value: t('home.hero.statDestinations'), label: '' },
            { value: t('home.hero.statHotels'), label: '' },
            { value: t('home.hero.statEngine'), label: '' },
          ]}
        />

        {/* Search Bar */}
        <View className="px-4 mb-6">
          <SearchBar placeholder={t('home.chatbot.placeholder')} />
        </View>

        {/* Quick Suggestions */}
        <View className="px-4 mb-4">
          <Text className="text-label-md text-on-surface-variant mb-3">{t('home.chatbot.suggestion1')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {[
              t('home.chatbot.suggestion1'),
              t('home.chatbot.suggestion2'),
              t('home.chatbot.suggestion3'),
            ].map((suggestion, i) => (
              <TouchableOpacity key={i} className="bg-surface-container px-4 py-2 rounded-full border border-outline-variant">
                <Text className="text-body-md text-on-surface">{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Destinations Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline-md font-headline text-on-surface">{t('home.destinations.subtitle')}</Text>
            <Text className="text-nile-blue font-medium">{t('home.destinations.cta')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
            {destinations.map((dest) => (
              <TouchableOpacity key={dest.id} className="w-72 flex-shrink-0" onPress={() => router.push(`/destination/${dest.name.toLowerCase()}`)}>
                <View className="relative rounded-2xl overflow-hidden">
                  <Image source={{ uri: dest.image }} style={{ width: 288, height: 180 }} resizeMode="cover" />
                  <View className="absolute inset-0" style={{ background: `linear-gradient(to top, ${dest.gradient[0]}, ${dest.gradient[1]})` }} />
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-headline-md-mobile font-headline text-white">{dest.name}</Text>
                    <Text className="text-body-md text-white/80 mt-1">{dest.tag}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features Section */}
        <View className="px-4 py-8 bg-surface-container">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{t('home.features.subtitle')}</Text>
          <Text className="text-headline-md font-headline text-on-surface mb-6">{t('home.features.title')}</Text>
          <View className="gap-4">
            {features.map((feature, i) => (
              <View key={i} className="flex-row items-start gap-4 p-4 bg-surface rounded-2xl border border-outline-variant">
                <View className={`w-12 h-12 rounded-xl flex-items-center justify-center ${isDark ? 'bg-primary/20' : 'bg-primary-container'}`}>
                  <Ionicons name={feature.icon} size={24} color={isDark ? '#F8BC51' : '#7E5700'} />
                </View>
                <View className="flex-1">
                  <Text className="text-headline-md-mobile font-headline text-on-surface">{feature.title}</Text>
                  <Text className="text-body-md text-on-surface-variant mt-1">{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hotels Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-wider">{t('home.hotels.subtitle')}</Text>
            <Text className="text-headline-md font-headline text-on-surface">{t('home.hotels.title')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
            {hotels.map((hotel) => (
              <TouchableOpacity key={hotel.id} className="w-80 flex-shrink-0" onPress={() => router.push(`/hotel/${hotel.id}`)}>
                <Card className="p-0 overflow-hidden">
                  <View className="relative h-48">
                    <Image source={{ uri: hotel.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    {hotel.topPick && (
                      <SparkleBadge className="absolute top-3 left-3">
                        {t('home.hotels.topPick')}
                      </SparkleBadge>
                    )}
                  </View>
                  <CardContent>
                    <Text className="text-headline-md-mobile font-headline text-on-surface">{hotel.name}</Text>
                    <Text className="text-body-md text-on-surface-variant mt-1 line-clamp-2">{hotel.desc}</Text>
                    <View className="flex-row items-center justify-between mt-3">
                      <Text className="text-body-lg font-bold text-primary">{hotel.price}</Text>
                      <Button variant="outline" size="sm" className="ml-2">
                        {t('home.hotels.explore')}
                      </Button>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Planner Callout */}
        <View className="px-4 mb-4">
          <Card className="p-6 bg-primary" style={{ borderRadius: 24 }}>
            <View className="flex-row items-start gap-4">
              <View className="w-14 h-14 rounded-2xl bg-primary-container/30 flex-items-center justify-center">
                <Ionicons name="sparkles" size={28} color="#F8BC51" />
              </View>
              <View className="flex-1">
                <Text className="text-headline-md font-headline text-on-primary">{t('home.plannerCallout.title')}</Text>
                <Text className="text-body-md text-on-primary/80 mt-2">{t('home.plannerCallout.desc')}</Text>
                <Button variant="secondary" size="sm" className="mt-4 w-auto">
                  {t('home.plannerCallout.cta')}
                </Button>
              </View>
            </View>
          </Card>
        </View>

        {/* Chatbot Preview */}
        <View className="px-4 mb-4">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{t('home.chatbot.subtitle')}</Text>
          <Text className="text-headline-md font-headline text-on-surface mb-4">{t('home.chatbot.title')}</Text>
          <Card className="p-4">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-full bg-primary-container flex-items-center justify-center">
                <Ionicons name="sparkles" size={24} color="#7E5700" />
              </View>
              <View>
                <Text className="text-label-md font-medium text-on-surface">{t('home.chatbot.mockName')}</Text>
                <Text className="text-label-sm text-on-surface-variant">{t('home.chatbot.mockStatus')}</Text>
              </View>
            </View>
            <View className="space-y-3 mb-4">
              <View className="bg-surface-container rounded-2xl p-4">
                <Text className="text-body-md text-on-surface">{t('home.chatbot.mockMsg1')}</Text>
              </View>
              <View className="flex-row-reverse">
                <View className="bg-primary rounded-2xl p-4 max-w-[80%]">
                  <Text className="text-body-md text-on-primary">{t('home.chatbot.mockMsg2')}</Text>
                </View>
              </View>
              <View className="bg-surface-container rounded-2xl p-4">
                <Text className="text-body-md text-on-surface">{t('home.chatbot.mockMsg3')}</Text>
              </View>
            </View>
            <TextInput
              placeholder={t('home.chatbot.placeholder')}
              className="w-full px-4 py-3 rounded-full bg-surface-container border border-outline-variant text-on-surface placeholder-text-on-surface-variant"
            />
            <Text className="text-label-sm text-on-surface-variant text-center mt-3">{t('home.chatbot.disclaimer')}</Text>
          </Card>
        </View>

        {/* Pricing Section */}
        <View className="px-4 mb-8">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{t('home.pricing.badge')}</Text>
          <Text className="text-headline-md font-headline text-on-surface mb-2">{t('home.pricing.title')}</Text>
          <Text className="text-body-md text-on-surface-variant mb-6">{t('home.pricing.subtitle')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
            {/* Wanderer Plan */}
            <Card className="w-72 flex-shrink-0 p-6">
              <Badge variant="gold" className="mb-2">{t('home.pricing.wanderer.price')}</Badge>
              <Text className="text-headline-md font-headline text-on-surface">{t('home.pricing.wanderer.title')}</Text>
              <Text className="text-body-md text-on-surface-variant mt-2">{t('home.pricing.wanderer.desc')}</Text>
              <View className="mt-4 space-y-2">
                {t('home.pricing.wanderer.features').split('\n').map((f, i) => (
                  <View key={i} className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={18} color="#2D7A4F" />
                    <Text className="text-body-md text-on-surface-variant">{f}</Text>
                  </View>
                ))}
              </View>
              <Button variant="outline" className="mt-6" fullWidth>
                {t('home.pricing.wanderer.cta')}
              </Button>
            </Card>
            {/* Pro Plan */}
            <Card className="w-72 flex-shrink-0 p-6 border-2 border-primary relative" style={{ borderRadius: 24 }}>
              <Badge variant="gold" className="mb-2 absolute -top-2 left-1/2 -translate-x-1/2">
                {t('home.pricing.pro.badge')}
              </Badge>
              <View className="pt-4">
                <View className="flex-row items-baseline gap-1 mb-1">
                  <Text className="text-4xl font-bold text-on-surface">{t('home.pricing.pro.priceAnnual')}</Text>
                  <Text className="text-body-md text-on-surface-variant">{t('home.pricing.annual')}</Text>
                </View>
                <Text className="text-label-md text-primary">{t('home.pricing.save20')}</Text>
                <Text className="text-headline-md font-headline text-on-surface mt-2">{t('home.pricing.pro.title')}</Text>
                <Text className="text-body-md text-on-surface-variant mt-2">{t('home.pricing.pro.desc')}</Text>
                <View className="mt-4 space-y-2">
                  {t('home.pricing.pro.features').split('\n').map((f, i) => (
                    <View key={i} className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={18} color="#2D7A4F" />
                      <Text className="text-body-md text-on-surface-variant">{f}</Text>
                    </View>
                  ))}
                </View>
                <Button variant="primary" className="mt-6" fullWidth>
                  {t('home.pricing.pro.cta')}
                </Button>
              </View>
            </Card>
          </ScrollView>
        </View>

        {/* Testimonials */}
        <View className="px-4 mb-8">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{t('home.testimonials.title')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
            {[
              { quote: t('home.testimonials.t1.quote'), author: t('home.testimonials.t1.author'), loc: t('home.testimonials.t1.loc') },
              { quote: t('home.testimonials.t2.quote'), author: t('home.testimonials.t2.author'), loc: t('home.testimonials.t2.loc') },
              { quote: t('home.testimonials.t3.quote'), author: t('home.testimonials.t3.author'), loc: t('home.testimonials.t3.loc') },
            ].map((t, i) => (
              <Card key={i} className="w-80 flex-shrink-0 p-6">
                <Text className="text-body-lg text-on-surface leading-relaxed mb-4">"{t.quote}"</Text>
                <View className="border-t border-outline-variant pt-4">
                  <Text className="text-label-md font-medium text-on-surface">{t.author}</Text>
                  <Text className="text-label-sm text-on-surface-variant">{t.loc}</Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Final CTA */}
        <View className="px-4 mb-8">
          <Card className="p-8 bg-primary" style={{ borderRadius: 24 }}>
            <Text className="text-display-lg-mobile font-headline text-on-primary text-center mb-3">{t('home.finalCta.title')}</Text>
            <Text className="text-body-lg text-on-primary/80 text-center mb-6">{t('home.finalCta.subtitle')}</Text>
            <Button variant="secondary" size="lg" className="w-full max-w-xs mx-auto" onPress={() => router.push('/trip/generate')}>
              {t('home.finalCta.cta')}
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}