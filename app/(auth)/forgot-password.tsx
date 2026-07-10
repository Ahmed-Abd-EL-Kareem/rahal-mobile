// app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const { api } = await import('@/api/client');
      await api.post('auth/forgot-password', { json: { email: data.email } }).json();
      showToast({ type: 'success', message: t('auth.forgotPasswordSuccess') });
      router.push(`/ (auth)/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset code';
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
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
            <Ionicons name="lock-closed-outline" size={40} color="#C8922A" />
          </View>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_700Bold', 
            fontSize: 24, 
            color: '#1C1C19',
            marginBottom: 8,
          }}>
            {t('auth.forgotPassword.title')}
          </Text>
          <Text style={{ fontSize: 16, color: '#504536', textAlign: 'center', paddingHorizontal: 20 }}>
            {t('auth.forgotPassword.subtitle')}
          </Text>
        </View>

        <View style={{ width: '100%' }}>
          <Controller
            name="email"
            control={control}
            rules={{ required: 'Required', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={t('auth.emailLabel')}
                placeholder={t('auth.emailPlaceholder')}
                error={error?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Text>{t('auth.forgotPasswordBtn')}</Text>
            )}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
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