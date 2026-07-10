// app/trip/[id].tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useTrip, useUpdateTrip } from '@/api/hooks/useTrips';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatRelativeTime } from '@/utils';
import { formatDate, formatRelativeTime as formatRelativeTimeUtil } from '@/utils/date';

interface TripDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
  tips?: string;
  estimatedCost: number;
}

interface TripDetail {
  _id: string;
  title: string;
  destination: string;
  duration: number;
  budget: string;
  travelers: number;
  interests: string[];
  days: TripDay[];
  summary: string;
  estimatedTotalCost: number;
  currency: string;
  status: string;
  isAIGenerated: boolean;
  imageUrl?: string;
  createdAt: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TripDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const { data: trip, isLoading, error } = useTrip(params.id);
  const { mutateAsync: updateTrip, isPending: isUpdating } = useUpdateTrip();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#C8922A" />
      </SafeAreaView>
    );
  }

  if (error || !trip) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#8F1301" />
        <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">Trip Not Found</Text>
        <Button variant="outline" className="mt-4 w-auto" onPress={() => router.back()}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const tData = trip as TripDetail;
  const locale = t('common.locale') || 'en';

  const totalDays = tData.days?.length || tData.duration;
  const startDate = new Date(tData.createdAt);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + tData.duration - 1);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="relative h-[350px]">
          <Image
            source={{ uri: tData.imageUrl || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800' }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20,16,15,0.6)' }} />
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/20 flex-items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="absolute bottom-4 left-4 right-4">
            <View className="flex-row items-center gap-2 mb-2 text-white/80">
              <MaterialIcons name="location-on" size={16} />
              <Text>{tData.destination}</Text>
            </View>
            <Text className="text-display-lg-mobile font-headline text-white mb-1">{tData.title}</Text>
            <View className="flex-row items-center gap-4 mt-2 text-white/80">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="event" size={16} />
                <Text>{tData.duration} {t('common.days')}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="people" size={16} />
                <Text>{tData.travelers} {t('common.travelers')}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="attach-money" size={16} />
                <Text>{formatCurrency(tData.estimatedTotalCost, tData.currency)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4 pb-20">
          {/* Summary */}
          <View className="mb-8">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('trip.detail.summary')}</Text>
            <Text className="text-body-md text-on-surface-variant leading-relaxed">{tData.summary}</Text>
          </View>

          {/* AI Insight */}
          {tData.isAIGenerated && (
            <Card variant="outlined" className="mb-6 border-primary/30">
              <CardContent>
                <View className="flex-row items-start gap-3">
                  <View className="p-2 rounded-xl bg-primary/10">
                    <Ionicons name="sparkles" size={20} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-md font-medium text-primary mb-1">{t('home.chatbot.rahalInsight')}</Text>
                    <Text className="text-body-md text-on-surface-variant">
                      This itinerary was crafted by Rahal AI based on your preferences. 
                      {tData.days.length} days of curated experiences await you!
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Days */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-headline-md font-headline text-on-surface">{t('trip.detail.itinerary')}</Text>
              {tData.isAIGenerated && (
                <Badge variant="sparkle">{t('home.pricing.wanderer.title')} AI</Badge>
              )}
            </View>
            
            <View className="gap-4">
              {tData.days?.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className={`p-4 rounded-2xl border-2 transition-colors ${
                    expandedDay === day.day
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant bg-surface'
                  }`}
                >
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-3 mb-2">
                        <View className="w-10 h-10 rounded-full bg-primary/10 flex-items-center justify-center">
                          <Text className="text-headline-md font-headline text-primary">{day.day}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-headline-md-mobile font-headline text-on-surface">{day.title}</Text>
                          <Text className="text-label-md text-on-surface-variant">{t('trip.detail.estimatedCost', { cost: formatCurrency(day.estimatedCost, tData.currency) })}</Text>
                        </View>
                      </View>
                      <Text className="text-body-md text-on-surface-variant leading-relaxed mb-3">
                        {day.activities.slice(0, 2).join(', ')}
                        {day.activities.length > 2 && '...'}
                      </Text>
                    </View>
                    <Ionicons 
                      name={expandedDay === day.day ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color={colors.onSurfaceVariant} 
                    />
                  </View>

                  {expandedDay === day.day && (
                    <View className="mt-4 pt-4 border-t border-outline-variant space-y-4">
                      <View>
                        <Text className="text-label-md font-medium text-on-surface mb-2">{t('trip.detail.activities')}</Text>
                        <View className="space-y-2">
                          {day.activities.map((activity, i) => (
                            <View key={i} className="flex-row items-start gap-3 p-3 rounded-xl bg-surface-container">
                              <View className="w-2 h-2 rounded-full bg-primary mt-2" />
                              <Text className="text-body-md text-on-surface flex-1">{activity}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View>
                        <Text className="text-label-md font-medium text-on-surface mb-2">{t('trip.detail.meals')}</Text>
                        <View className="flex-row gap-3">
                          {day.meals.map((meal, i) => (
                            <Badge key={i} variant="green" className="flex-row items-center gap-1">
                              <Ionicons name="restaurant-outline" size={14} />
                              <Text>{meal}</Text>
                            </Badge>
                          ))}
                        </View>
                      </View>

                      {day.accommodation && (
                        <View>
                          <Text className="text-label-md font-medium text-on-surface mb-2">{t('trip.detail.accommodation')}</Text>
                          <Text className="text-body-md text-on-surface-variant">{day.accommodation}</Text>
                        </View>
                      )}

                      {day.tips && (
                        <View className="p-3 rounded-xl bg-primary/5 border border-primary/30">
                          <View className="flex-row items-start gap-2">
                            <Ionicons name="lightbulb-outline" size={20} color="#C8922A" style={{ marginTop: 2 }} />
                            <Text className="text-body-md text-on-surface">{day.tips}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button variant="outline" fullWidth onPress={() => router.push(`/trip/generate`)}>
              <Ionicons name="add-circle-outline" size={20} style={{ marginRight: 8 }} />
              <Text>{t('trip.detail.newTrip')}</Text>
            </Button>
            <Button variant="primary" fullWidth onPress={() => { /* Share */ }}>
              <Ionicons name="share-outline" size={20} style={{ marginRight: 8 }} />
              <Text>{t('trip.detail.share')}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}