// app/(auth)/reset-password.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useUIStore();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const email = params.email || '';

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strengthLabels = ['None', 'Weak', 'Fair', 'Good', 'Strong'];

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      const { api } = await import('@/api/client');
      await api.post('auth/reset-password', { json: { email, newPassword: data.newPassword } }).json();
      showToast({ type: 'success', message: t('auth.resetPasswordSuccess') });
      router.replace('/(auth)/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
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
            <Ionicons name="key-outline" size={40} color="#C8922A" />
          </View>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_700Bold', 
            fontSize: 24, 
            color: colors.onSurface,
            marginBottom: 8,
          }}>
            {t('auth.resetPasswordTitle')}
          </Text>
          <Text style={{ fontSize: 16, color: colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 20 }}>
            {t('auth.resetPasswordSubtitle')}
          </Text>
        </View>

        <View style={{ width: '100%' }}>
          <Controller
            name="newPassword"
            control={control}
            rules={{ required: 'Required', minLength: 8 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={t('auth.newPasswordLabel')}
                placeholder={t('auth.newPasswordLabel')}
                error={error?.message}
                secureTextEntry={!isPasswordVisible}
                rightIcon="eye-outline"
                onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
                autoCompleteType="new-password"
              />
            )}
          />

          {newPassword && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1, height: 4, borderRadius: 2 }}>
                {[...Array(4)].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      marginRight: 4,
                      backgroundColor: i < getPasswordStrength(newPassword) ? '#C8922A' : (isDark ? '#3A3833' : '#D4C4B0'),
                    }}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>
                {t(`auth.strength${strengthLabels[getPasswordStrength(newPassword)]}`)}
              </Text>
            </View>
          )}

          <Controller
            name="confirmPassword"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={t('auth.confirmPasswordLabel')}
                placeholder={t('auth.confirmPasswordLabel')}
                error={error?.message}
                secureTextEntry={!isConfirmPasswordVisible}
                rightIcon="eye-outline"
                onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                autoCompleteType="new-password"
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
              <Text>{t('auth.resetPasswordBtn')}</Text>
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

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
}