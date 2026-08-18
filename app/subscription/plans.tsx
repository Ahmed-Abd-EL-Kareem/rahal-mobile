// app/subscription/plans.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlans } from '@/api/hooks/useSubscriptions';
import { useSubscriptionUpgrade } from '@/hooks/useBookingPayment';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function SubscriptionPlansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscription } = useAuthStore();
  const { showToast } = useUIStore();
  
  const { data: plansResponse, isLoading } = usePlans();
  const { upgrade: upgradeSubscription, isPending: isUpgrading } = useSubscriptionUpgrade();
  
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const plans = plansResponse?.data || [];
  const currentPlanName = subscription?.planName || 'free';
  const isMonthly = selectedCycle === 'monthly';
  const isAnnual = selectedCycle === 'yearly';

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
      const result = await upgradeSubscription(planName);
      if (result?.success) {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      // Toast already shown in hook
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#C8922A" />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface dark:bg-obsidian">
      {/* Top App Bar */}
      <View className="h-16 flex-row justify-between items-center px-4 border-b border-outline-variant/10 bg-surface dark:bg-obsidian">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-95">
            <Ionicons name="arrow-back-outline" size={24} color="#C8922A" />
          </TouchableOpacity>
          <Text className="text-headline-md-mobile font-headline text-pharaoh-gold">Rahal</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} className="p-2 active:scale-95">
          <Ionicons name="sparkles-outline" size={22} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Hero Title Section */}
        <View className="items-center mt-6 mb-10 text-center">
          <View className="bg-primary-fixed/20 px-4 py-1.5 rounded-full mb-3">
            <Text className="text-pharaoh-gold font-semibold uppercase tracking-widest text-[11px]">
              Select Your Path
            </Text>
          </View>
          <Text className="text-3xl font-headline text-on-surface dark:text-surface-bright text-center mb-3">
            Embark with Premium
          </Text>
          <Text className="text-body-md text-on-surface-variant dark:text-outline text-center px-6 leading-5">
            Unlock the full majesty of the Nile with AI-powered concierge services and heritage insights tailored to your curiosity.
          </Text>
        </View>

        {/* Toggle Switch */}
        <View className="mb-8">
          <View className="bg-surface-container-low dark:bg-sand-dark p-1 rounded-full flex-row w-64 self-center relative border border-outline-variant/40">
            {/* Sliding Highlight */}
            <View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                bottom: 4,
                width: '50%',
                backgroundColor: '#C8922A',
                borderRadius: 9999,
                transform: [{ translateX: isMonthly ? 0 : 120 }],
              }}
              className="transition-transform duration-300"
            />
            <TouchableOpacity
              onPress={() => setSelectedCycle('monthly')}
              className="flex-1 py-2 justify-center items-center z-10"
            >
              <Text className={`font-semibold text-label-md ${isMonthly ? 'text-white' : 'text-on-surface-variant dark:text-outline'}`}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCycle('yearly')}
              className="flex-1 py-2 justify-center items-center z-10"
            >
              <Text className={`font-semibold text-label-md ${isAnnual ? 'text-white' : 'text-on-surface-variant dark:text-outline'}`}>
                Annual
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center gap-1 mt-4">
            <Ionicons name="gift-outline" size={16} color="#C8922A" />
            <Text className="text-pharaoh-gold font-semibold text-label-md">
              Save 20% with annual billing
            </Text>
          </View>
        </View>

        {/* Pricing Cards */}
        <View className="gap-6 mb-12">
          {/* Wanderer (Free) */}
          <View className="bg-surface-container-lowest dark:bg-sand-dark p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col">
            <View className="mb-6">
              <Text className="text-headline-md font-headline text-on-surface dark:text-surface-bright mb-1">
                Wanderer
              </Text>
              <Text className="text-on-surface-variant dark:text-outline font-body-md text-body-md">
                Essential tools for the curious explorer.
              </Text>
            </View>
            <View className="mb-6 flex-row items-baseline gap-1">
              <Text className="text-4xl font-headline font-bold text-on-surface dark:text-surface-bright">$0</Text>
              <Text className="text-on-surface-variant dark:text-outline font-label-md">/month</Text>
            </View>
            <View className="space-y-4 mb-8 flex-grow">
              <View className="flex-row items-center gap-3">
                <Ionicons name="checkmark-circle" size={18} color="#C8922A" />
                <Text className="text-on-surface dark:text-inverse-on-surface font-body-md">Standard Route Discovery</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Ionicons name="checkmark-circle" size={18} color="#C8922A" />
                <Text className="text-on-surface dark:text-inverse-on-surface font-body-md">Basic AI Suggestions</Text>
              </View>
              <View className="flex-row items-center gap-3 opacity-40">
                <Ionicons name="close-circle" size={18} color="#817565" />
                <Text className="text-on-surface-variant dark:text-outline font-body-md">Offline Maps</Text>
              </View>
              <View className="flex-row items-center gap-3 opacity-40">
                <Ionicons name="close-circle" size={18} color="#817565" />
                <Text className="text-on-surface-variant dark:text-outline font-body-md">Priority AI Concierge</Text>
              </View>
            </View>
            <TouchableOpacity
              disabled={currentPlanName === 'free'}
              className="w-full py-3.5 rounded-full border border-outline-variant/60 justify-center items-center"
            >
              <Text className="text-on-surface-variant dark:text-outline font-semibold text-label-md">
                {currentPlanName === 'free' ? 'Current Plan' : 'Wanderer Free'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Traveler Pro (Paid) */}
          <View style={{ borderColor: '#C8922A', borderWidth: 1, padding: 2, borderRadius: 16 }}>
            <View style={{ borderColor: '#C8922A', borderWidth: 1, borderRadius: 14 }} className="bg-surface-container-lowest dark:bg-sand-dark p-6 flex flex-col relative overflow-hidden">
              <View className="absolute top-4 right-4 bg-pharaoh-gold px-3 py-1 rounded-full">
                <Text className="text-white font-bold text-[9px] uppercase tracking-wider">MOST POPULAR</Text>
              </View>

              <View className="mb-6 pr-16">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-headline-md font-headline text-on-surface dark:text-surface-bright">
                    Traveler Pro
                  </Text>
                  <Ionicons name="sparkles" size={18} color="#C8922A" />
                </View>
                <Text className="text-on-surface-variant dark:text-outline font-body-md text-body-md">
                  Advanced AI orchestration for luxury journeys.
                </Text>
              </View>

              <View className="mb-6 flex-row items-baseline gap-1">
                <Text className="text-4xl font-headline font-bold text-on-surface dark:text-surface-bright">
                  {isMonthly ? '$29' : '$279'}
                </Text>
                <Text className="text-on-surface-variant dark:text-outline font-label-md">
                  {isMonthly ? '/month' : '/year'}
                </Text>
              </View>

              <View className="space-y-4 mb-8 flex-grow">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={18} color="#C8922A" />
                  <Text className="text-on-surface dark:text-inverse-on-surface font-body-md font-bold">Priority AI Concierge (24/7)</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={18} color="#C8922A" />
                  <Text className="text-on-surface dark:text-inverse-on-surface font-body-md">Exclusive Heritage Audio Guides</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={18} color="#C8922A" />
                  <Text className="text-on-surface dark:text-inverse-on-surface font-body-md">Global Offline Map Access</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={18} color="#C8922A" />
                  <Text className="text-on-surface dark:text-inverse-on-surface font-body-md">VIP Lounge & Fast Track Access</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleUpgrade('pro')}
                disabled={upgradingPlan === 'pro' || currentPlanName === 'pro'}
                className="w-full py-4 bg-pharaoh-gold rounded-full justify-center items-center shadow-md active:scale-95"
              >
                {upgradingPlan === 'pro' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-label-md">
                    {currentPlanName === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Heritage Divider */}
        <View className="flex-row items-center justify-center gap-4 mb-12 opacity-50">
          <View className="h-[1px] w-full max-w-[80px] bg-pharaoh-gold" />
          <Ionicons name="home-outline" size={18} color="#C8922A" />
          <View className="h-[1px] w-full max-w-[80px] bg-pharaoh-gold" />
        </View>

        {/* Comparison Section */}
        <View className="mb-12">
          <Text className="text-2xl font-headline text-center mb-8 text-on-surface dark:text-surface-bright">
            Detailed Comparison
          </Text>

          {/* Simple Table styled list */}
          <View className="border border-outline-variant/40 rounded-xl overflow-hidden bg-surface-container-lowest dark:bg-sand-dark">
            {[
              { f: 'Daily AI Requests', w: '5 Requests', p: 'Unlimited' },
              { f: 'Multi-city Itineraries', w: 'Simple Only', p: 'Advanced AI Sync' },
              { f: 'Bilingual Translation', w: 'Included', p: 'Included' },
              { f: 'Museum VIP Fast Pass', w: '—', p: 'Included' },
              { f: 'Personal Travel Agent', w: '—', p: 'Included' },
            ].map((row, index) => (
              <View
                key={index}
                className="flex-row p-4 border-b border-outline-variant/20 hover:bg-surface-container-low"
              >
                <Text className="flex-2 flex-[2] font-semibold text-body-md text-on-surface dark:text-inverse-on-surface pr-2">
                  {row.f}
                </Text>
                <Text className="flex-1 text-center text-body-md text-on-surface-variant dark:text-outline pr-1">
                  {row.w}
                </Text>
                <Text className="flex-1 text-center font-bold text-pharaoh-gold text-body-md">
                  {row.p}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Visual Credibility Section */}
        <View className="gap-6 mb-12">
          {/* Card 1 */}
          <View className="h-64 rounded-xl overflow-hidden relative">
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT4LWiM413hmfx6xPT7d_r48bttQdxiqHqDLpv9ZTebA_Cu8Ztoc_eVY9IH0sexb4Iu6A12LAefPO3HW3DHwpvql-lN8ropDvWbywko1wysq7RkRxAo0Y_dNKhYvNWOt8bmNb6iw09djWb0iLlb9QDg7RSKWYW-ACY29bTuG_CsCaNug7G9fTGSK2Z5jR4pBBWepYRmufOG50FEEfZQQv4_p-_GMVPCqb8Hi0OHjxilhpnEYjXdpXZ3Z6bC5yiUAkk9KiOEHG_gBw' }}
              className="w-full h-full object-cover absolute inset-0"
            />
            <View className="absolute inset-0 bg-black/45" />
            <View className="absolute bottom-6 left-6 right-6">
              <Text className="text-white font-semibold text-label-md">Curated Dahabiya Routes</Text>
            </View>
          </View>

          {/* Card 2 */}
          <View className="h-64 rounded-xl overflow-hidden relative">
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlduNS0z8Tlew2QFBaD1o6_vdhY0NQ1w54gxiGnzFK9YwLTy0f-hJYFhVVh6-EjhEcVhdsnoV1b37Qs4j3Ov-iovydrRUNYW_CueNBq401YOd14bWneosoWutT3lGPV3ILMgcIb0-cVFhez46_I9RqR23yAxUs05H-5udv9pzCAz-79XonxfVQerWTIPElAJKho-yok8xiO0VchZOCMkn446qP4-wclq2sygGFvCUHd04uU6CUOffBHmYpSRdZVJrAiTObs6lBqPM' }}
              className="w-full h-full object-cover absolute inset-0"
            />
            <View className="absolute inset-0 bg-black/45" />
            <View className="absolute bottom-6 left-6 right-6">
              <Text className="text-white font-semibold text-label-md">Heritage Deep-Dives</Text>
            </View>
          </View>

          {/* Card 3 */}
          <View className="h-64 rounded-xl overflow-hidden relative">
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnwOpZ9UEcuikeEI44kspUFzd2tw7ea-gne4v3SUUFS0IAJcXdJhDvA-2yHwfgl97UQal2SZIyHZk6saTAyvkQKomU9uqBemNIVH_nGTSYKg3dhWetpXYtZPZlQ3yDN4VITc16d6KbBiu54OZp_ivbJVqKdcyEcthjZsl-7NxUaprXBxB3nXN6Wrvg5orfUCoeB09PRvbJaIBtVkJlSu61fMyyAY1ACNR4iD7TThsqtyxy87kU9np1x2yoaPLAsFJpSRdwFsi8r_8' }}
              className="w-full h-full object-cover absolute inset-0"
            />
            <View className="absolute inset-0 bg-black/45" />
            <View className="absolute bottom-6 left-6 right-6">
              <Text className="text-white font-semibold text-label-md">Exclusive Stays</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute bottom-0 left-0 right-0 z-40 bg-surface/90 dark:bg-obsidian/90 border-t border-outline-variant/20 px-6 py-4 flex-col justify-between items-center"
      >
        <View className="w-full mb-3">
          <Text className="font-headline-md-mobile text-headline-md-mobile text-on-surface dark:text-surface-bright text-center md:text-left">
            Experience the Nile like never before.
          </Text>
          <Text className="text-on-surface-variant dark:text-outline font-label-sm text-center md:text-left mt-0.5">
            No credit card required to start your 7-day trial of Pro.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleUpgrade('pro')}
          className="w-full px-8 py-3.5 bg-pharaoh-gold rounded-full shadow-lg hover:shadow-pharaoh-gold/40 justify-center items-center flex-row gap-2 active:scale-95"
        >
          <Text className="text-white font-semibold text-label-md">
            Get Started with Pro
          </Text>
          <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}