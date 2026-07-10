// app/(auth)/signup.tsx
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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const { showToast } = useUIStore();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strengthLabels = ['None', 'Weak', 'Fair', 'Good', 'Strong'];

  const onSubmit = async (data: SignupForm) => {
    if (!termsAccepted) {
      Alert.alert(t('auth.errors.termsRequired'));
      return;
    }
    try {
      await signup(data.name, data.email, data.password);
      showToast({ type: 'success', message: 'Account created successfully!' });
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      showToast({ type: 'error', message });
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
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_700Bold', 
            fontSize: 36, 
            color: '#1C1C19',
            marginBottom: 8,
          }}>
            {t('common.appName')}
          </Text>
          <Text style={{ fontSize: 16, color: '#504536' }}>
            {t('auth.signupSubtitle')}
          </Text>
        </View>

        <View style={{ width: '100%' }}>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_600SemiBold', 
            fontSize: 24, 
            color: '#1C1C19',
            marginBottom: 8,
          }}>
            {t('auth.signupTitle')}
          </Text>

          <Controller
            name="name"
            control={control}
            rules={{ required: 'Required', minLength: 2 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={t('auth.nameLabel')}
                placeholder={t('auth.namePlaceholder')}
                error={error?.message}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
          />

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

          <Controller
            name="password"
            control={control}
            rules={{ required: 'Required', minLength: 8 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={{ marginBottom: 16 }}>
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label={t('auth.passwordLabel')}
                  placeholder={t('auth.passwordPlaceholder')}
                  error={error?.message}
                  secureTextEntry={!isPasswordVisible}
                  rightIcon={
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                      <Text style={{ color: '#8F1301', fontSize: 14 }}>
                        {isPasswordVisible ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  }
                  autoComplete="new-password"
/>
                {password && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <View style={{ flex: 1, height: 4, borderRadius: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <View
                          key={i}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            marginRight: 4,
                            backgroundColor: i < getPasswordStrength(password) ? '#C8922A' : '#D4C4B0',
                          }}
                        />
                      ))}
                    </View>
                    <Text style={{ fontSize: 12, color: '#504536' }}>
                      {t(`auth.strength${strengthLabels[getPasswordStrength(password)]}`)}
                    </Text>
                  </View>
                )}
                {error && (
                  <Text style={{ color: '#BA1A1A', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                    {t(error.message as string)}
                  </Text>
                )}
              </View>
            )}
          />

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
                rightIcon={
                  <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    <Text style={{ color: '#8F1301', fontSize: 14 }}>
                      {isConfirmPasswordVisible ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                }
                autoComplete="new-password"
              />
            )}
          />

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={{ marginTop: 2, marginRight: 12 }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderWidth: 2,
                  borderColor: termsAccepted ? '#C8922A' : '#D4C4B0',
                  borderRadius: 6,
                  backgroundColor: termsAccepted ? '#C8922A' : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
            <Text style={{ color: '#504536', fontSize: 14, lineHeight: 20 }}>
              {t('auth.termsCheckbox')}
            </Text>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Text>{t('auth.signupBtn')}</Text>
            )}
          </Button>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#D4C4B0' }} />
            <Text style={{ color: '#827564', fontSize: 14, marginHorizontal: 16 }}>
              {t('auth.continueWith')}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#D4C4B0' }} />
          </View>

          <TouchableOpacity
            onPress={() => {/* Google OAuth */}}
            style={{
              height: 56,
              borderWidth: 2,
              borderColor: '#366286',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>G</Text>
            <Text style={{ color: '#366286', fontSize: 16, fontFamily: 'Inter_500Medium' }}>
              {t('auth.googleBtn')}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <Text style={{ color: '#504536', fontSize: 14 }}>
              {t('auth.haveAccount')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ color: '#C8922A', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                {t('auth.loginLink')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}