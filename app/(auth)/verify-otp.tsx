// app/(auth)/verify-otp.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numbers only'),
});

type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useUIStore();
  const params = useLocalSearchParams<{ email?: string }>();
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const email = params.email || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const onSubmit = async (data: VerifyOtpForm) => {
    setIsLoading(true);
    try {
      const { api } = await import('@/api/client');
      await api.post('auth/verify-otp', { json: { email, otp: data.otp } }).json();
      showToast({ type: 'success', message: t('auth.verifyOtpSuccess') });
      router.push(`/ (auth)/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.errors.invalidOtp');
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    try {
      const { api } = await import('@/api/client');
      await api.post('auth/forgot-password', { json: { email } }).json();
      showToast({ type: 'success', message: t('auth.otpResent') });
    } catch (error: any) {
      showToast({ type: 'error', message: 'Failed to resend code' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View className="w-20 h-20 rounded-full bg-primary/10 flex-items-center justify-center mb-6">
            <Ionicons name="shield-checkmark-outline" size={40} color="#C8922A" />
          </View>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_700Bold', 
            fontSize: 24, 
            color: '#1C1C19',
            marginBottom: 8,
          }}>
            {t('auth.verifyOtpTitle')}
          </Text>
          <Text style={{ fontSize: 16, color: '#504536', textAlign: 'center', paddingHorizontal: 20 }}>
            {t('auth.verifyOtpSubtitle', { email })}
          </Text>
        </View>

        <View style={{ width: '100%' }}>
          <Controller
            name="otp"
            control={control}
            rules={{ required: 'Required', minLength: 6, pattern: /^\d+$/ }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={t('auth.verifyOtpLabel')}
                placeholder="000000"
                error={error?.message}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                textAlign="center"
                style={{ fontSize: 24, letterSpacing: 24 }}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            fullWidth
            className="mt-8"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Text>{t('auth.verifyOtpBtn')}</Text>
            )}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#504536', fontSize: 14 }}>
              {resendTimer > 0 
                ? t('auth.resendActive', { seconds: resendTimer })
                : t('auth.resendBtn')
            }
            </Text>
            {resendTimer === 0 && (
              <TouchableOpacity onPress={handleResend} style={{ marginLeft: 8 }}>
                <Text style={{ color: '#C8922A', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                  {t('auth.resendBtn')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <TouchableOpacity onPress={() => router.push(`/ (auth)/forgot-password`)}>
              <Text style={{ color: '#C8922A', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                {t('auth.backToLoginLink')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}