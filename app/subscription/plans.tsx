// app/subscription/plans.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { usePlans, useUpgradeSubscription, useSubscription } from '@/api/hooks/useSubscriptions';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency } from '@/utils/currency';

const PLAN_FEATURES = {
  free: [
    '3 AI-Generated Itineraries',
    'Standard Hotel Recommendations',
    'Unlimited Multi-city Planning',
    'Offline Map Sync',
  ],
  pro: [
    'Unlimited AI Planning',
    'Exclusive Hidden Gem Alerts',
    'Real-time Translation & AI Tips',
    'Priority Customer Support 24/7',
    'Multi-device Offline Sync',
  ],
  enterprise: [
    'Everything in Pro',
    'Custom AI Model Training',
    'Dedicated Account Manager',
    'API Access',
    'White-label Solutions',
    'SLA Guarantee',
  ],
};

export default function SubscriptionPlansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { subscription } = useAuthStore();
  const { showToast } = useUIStore();
  const { data: plansResponse, isLoading } = usePlans();
  const { mutateAsync: upgradeSubscription, isPending: isUpgrading } = useUpgradeSubscription();
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const plans = plansResponse?.data || [];

  const getPlanDisplayName = (planName: string) => {
    if (planName === 'free') return t('home.pricing.wanderer.title');
    if (planName === 'pro') return t('home.pricing.pro.title');
    return planName;
  };

  const getPlanPrice = (plan: any) => {
    const price = selectedCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
    return price;
  };

  const getPlanCycle = (plan: any) => {
    return selectedCycle === 'monthly' ? t('home.pricing.monthly') : t('home.pricing.annual');
  };

  const getSavings = (plan: any) => {
    if (selectedCycle === 'yearly') {
      const monthlyTotal = plan.price.monthly * 12;
      const yearlyPrice = plan.price.yearly;
      const savings = monthlyTotal - yearlyPrice;
      if (savings > 0) return t('home.pricing.save20');
    }
    return '';
  };

  const handleUpgrade = async (planName: string) => {
    if (!subscription?.user) {
      Alert.alert('Login Required', 'Please log in to upgrade your plan', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setUpgradingPlan(planName);
    try {
      await upgradeSubscription(planName);
      showToast({ type: 'success', message: 'Redirecting to payment...' });
      // In real app, you'd get a checkout URL and open in browser
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Upgrade failed' });
    } finally {
      setUpgradingPlan(null);
    }
  };

  const currentPlanName = subscription?.planName || 'free';

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#C8922A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-20">
          {/* Header */}
          <View className="mb-8">
            <View className="w-14 h-14 rounded-2xl bg-primary/10 flex-items-center justify-center mb-4">
              <MaterialIcons name="diamond" size={36} color="#C8922A" />
            </View>
            <Text className="text-display-lg-mobile font-headline text-on-surface mb-2">
              {t('home.pricing.title')}
            </Text>
            <Text className="text-body-lg text-on-surface-variant">
              {t('home.pricing.subtitle')}
            </Text>
          </View>

          {/* Current Plan Badge */}
          {subscription && (
            <View className="mb-6">
              <Card className="p-4 bg-primary/5 border-primary/30">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                      <MaterialIcons name={currentPlanName === 'pro' ? 'workspace-premium' : 'star'} size={24} color="#C8922A" />
                    </View>
                    <View>
                      <Text className="text-headline-md font-headline text-on-surface">
                        {getPlanDisplayName(currentPlanName)}
                      </Text>
                      <Text className="text-body-md text-on-surface-variant">
                        {subscription.status === 'active' ? t('account.activePlanBadge') : t('account.canceledPlanBadge')}
                      </Text>
                    </View>
                  </View>
                  {currentPlanName === 'free' && (
                    <Button variant="secondary" size="sm" onPress={() => { /* scroll to pro */ }}>
                      {t('account.upgradeBtn')}
                    </Button>
                  )}
                </View>
              </Card>
            </View>
          )}

          {/* Billing Cycle Toggle */}
          <View className="mb-8">
            <View className="flex-row items-center justify-center gap-2 bg-surface-container rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setSelectedCycle('monthly')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedCycle === 'monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                <Text className="text-label-md font-medium">{t('home.pricing.monthly')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedCycle('yearly')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedCycle === 'yearly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                <View className="flex-row items-center gap-1">
                  <Text className="text-label-md font-medium">{t('home.pricing.annual')}</Text>
                  <Badge variant="gold" className="text-label-sm">{t('home.pricing.save20')}</Badge>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plans */}
          <View className="gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name === currentPlanName;
              const isPro = plan.name === 'pro';
              const isFree = plan.name === 'free';

              return (
                <Card
                  key={plan.name}
                  className={`p-6 ${isPro ? 'border-2 border-primary relative' : ''} ${isCurrent ? 'bg-primary/5 border-primary' : ''}`}
                  style={{ borderRadius: 24 }}
                >
                  {isPro && (
                    <Badge variant="gold" className="absolute -top-2 left-1/2 -translate-x-1/2">
                      {t('home.pricing.pro.badge')}
                    </Badge>
                  )}
                  
                  <View className="mb-4">
                    <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                      {isPro ? t('home.pricing.pro.badge') : isFree ? t('home.pricing.wanderer.cycle') : plan.displayName}
                    </Text>
                    <Text className="text-headline-md font-headline text-on-surface">{getPlanDisplayName(plan.name)}</Text>
                  </View>

                  <View className="flex-row items-baseline gap-1 mb-1">
                    <Text className="text-4xl font-bold text-on-surface">{formatCurrency(getPlanPrice(plan), 'USD')}</Text>
                    <Text className="text-body-md text-on-surface-variant self-center mb-2">{t('home.pricing.perMonth')}</Text>
                  </View>
                  <Text className="text-label-md text-primary mb-1">{getPlanCycle({})}</Text>
                  {getSavings({}) && <Text className="text-label-md text-green mb-4">{getSavings({})}</Text>}

                  <Text className="text-body-md text-on-surface-variant mb-6">{plan.description}</Text>

                  <View className="space-y-3 mb-6">
                    {(PLAN_FEATURES[plan.name as keyof typeof PLAN_FEATURES] || []).map((feature, i) => (
                      <View key={i} className="flex-row items-center gap-3">
                        <Ionicons name="checkmark-circle" size={20} color="#2D7A4F" />
                        <Text className="text-body-md text-on-surface">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <Button
                    variant={isCurrent ? 'ghost' : isPro ? 'primary' : 'outline'}
                    fullWidth
                    disabled={isCurrent || upgradingPlan === plan.name}
                    onPress={() => !isCurrent && handleUpgrade(plan.name)}
                    className="mb-2"
                  >
                    {upgradingPlan === plan.name ? (
                      <ActivityIndicator color="#FFFFFF" size="large" />
                    ) : isCurrent ? (
                      <Text>{currentPlanName === 'pro' ? 'Current Plan' : 'Current Plan'}</Text>
                    ) : (
                      <Text>{t('home.pricing.pro.cta')}</Text>
                    )}
                  </Button>

                  {isPro && (
                    <View className="flex-row items-center justify-center gap-1 mt-2">
                      <Ionicons name="lock-closed" size={14} color="#8F1301" />
                      <Text className="text-label-sm text-primary">{t('home.pricing.pro.features.1')}</Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Comparison Table */}
          <View className="mt-12">
            <Text className="text-headline-md font-headline text-on-surface mb-6">{t('home.pricing.compare.title')}</Text>
            <Card className="p-4 overflow-hidden">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="min-w-full">
                <View className="min-w-full">
                  {/* Header */}
                  <View className="flex-row border-b border-outline-variant">
                    <View className="w-40 py-3 px-4 border-r border-outline-variant">
                      <Text className="text-label-md font-medium text-on-surface-variant">{t('home.pricing.compare.featureCol')}</Text>
                    </View>
                    {plans.map((plan) => (
                      <View key={plan.name} className="flex-1 min-w-[120px] py-3 px-4 border-r border-outline-variant items-center">
                        <Text className="text-label-md font-headline text-on-surface text-center">{getPlanDisplayName(plan.name)}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Features */}
                  {[
                    { key: 'itinerary', label: t('home.pricing.compare.features.itinerary.title'), desc: t('home.pricing.compare.features.itinerary.desc') },
                    { key: 'experiences', label: t('home.pricing.compare.features.experiences.title'), desc: t('home.pricing.compare.features.experiences.desc') },
                    { key: 'logistics', label: t('home.pricing.compare.features.logistics.title'), desc: t('home.pricing.compare.features.logistics.desc') },
                    { key: 'collaborative', label: t('home.pricing.compare.features.collaborative.title'), desc: t('home.pricing.compare.features.collaborative.desc') },
                    { key: 'offline', label: t('home.pricing.compare.features.offline.title'), desc: t('home.pricing.compare.features.offline.desc') },
                  ].map((feature) => (
                    <View key={feature.key} className="flex-row border-b border-outline-variant">
                      <View className="w-40 py-3 px-4 border-r border-outline-variant">
                        <Text className="text-label-md font-medium text-on-surface">{feature.label}</Text>
                        <Text className="text-label-sm text-on-surface-variant mt-1">{feature.desc}</Text>
                      </View>
                      {plans.map((plan) => {
                        const planFeatures = PLAN_FEATURES[plan.name as keyof typeof PLAN_FEATURES] || [];
                        const hasFeature = feature.key === 'itinerary' ? plan.limits?.tripsPerMonth !== 0 :
                          feature.key === 'experiences' ? plan.name !== 'free' :
                          feature.key === 'logistics' ? plan.name !== 'free' :
                          feature.key === 'collaborative' ? true :
                          feature.key === 'offline' ? plan.name !== 'free' : true;
                        
                        return (
                          <View key={plan.name} className="flex-1 min-w-[120px] py-3 px-4 border-r border-outline-variant items-center">
                            <View className="flex-row items-center justify-center gap-2">
                              <Ionicons name={hasFeature ? 'checkmark-circle' : 'close-circle'} size={20} color={hasFeature ? '#2D7A4F' : '#8F1301'} />
                              <Text className="text-label-md text-center" style={{ color: hasFeature ? '#2D7A4F' : '#8F1301' }}>
                                {hasFeature ? (feature.key === 'itinerary' ? 'Unlimited' : 'Included') : 'Not Included'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Card>
          </View>

          {/* FAQ */}
          <View className="mt-12">
            <Text className="text-headline-md font-headline text-on-surface mb-6">{t('home.pricing.faq.title')}</Text>
            <View className="space-y-4">
              {[
                { q: t('home.pricing.faq.q1'), a: t('home.pricing.faq.a1') },
                { q: t('home.pricing.faq.q2'), a: t('home.pricing.faq.a2') },
                { q: t('home.pricing.faq.q3'), a: t('home.pricing.faq.a3') },
              ].map((faq, i) => (
                <Card key={i} className="p-4">
                  <Text className="text-label-md font-medium text-on-surface mb-2">{faq.q}</Text>
                  <Text className="text-body-md text-on-surface-variant">{faq.a}</Text>
                </Card>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View className="mt-12">
            <Card className="p-8 bg-primary" style={{ borderRadius: 24 }}>
              <Text className="text-display-lg-mobile font-headline text-on-primary text-center mb-3">{t('home.pricing.cta.title')}</Text>
              <Text className="text-body-lg text-on-primary/80 text-center mb-6">{t('home.pricing.cta.subtitle')}</Text>
              <View className="flex-row gap-3">
                <Button variant="secondary" size="lg" flex={1} onPress={() => { /* scroll to pro */ }}>
                  {t('home.pricing.cta.buttonTrial')}
                </Button>
                <Button variant="outline" size="lg" flex={1} style={{ borderColor: 'white', color: 'white' }}>
                  {t('home.pricing.cta.buttonAgent')}
                </Button>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}