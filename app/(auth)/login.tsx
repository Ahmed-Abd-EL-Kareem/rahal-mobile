// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const loginSchema = z.object({
  email: z.string().email('auth.errors.invalidCredentials'),
  password: z.string().min(1, 'auth.errors.missingFields'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { showToast } = useUIStore();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.errors.invalidCredentials');
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
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_700Bold', 
            fontSize: 36, 
            color: '#1C1C19',
            marginBottom: 8,
          }}>
            {t('common.appName')}
          </Text>
          <Text style={{ fontSize: 16, color: '#504536' }}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        <View style={{ width: '100%' }}>
          <Text style={{ 
            fontFamily: 'PlayfairDisplay_600SemiBold', 
            fontSize: 24, 
            color: '#1C1C19',
            marginBottom: 8,
          }}>
            {t('auth.loginTitle')}
          </Text>

          <Controller
            name="email"
            control={control}
            rules={{ required: 'auth.errors.missingFields', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('auth.emailPlaceholder')}
                  style={{
                    height: 56,
                    borderWidth: 1,
                    borderColor: error ? '#BA1A1A' : '#D4C4B0',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    backgroundColor: '#F6F3EE',
                    color: '#1C1C19',
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                {error && (
                  <Text style={{ color: '#BA1A1A', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                    {t(error.message as string)}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: 'auth.errors.missingFields', minLength: 6 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={{ marginBottom: 24 }}>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry={!isPasswordVisible}
                  style={{
                    height: 56,
                    borderWidth: 1,
                    borderColor: error ? '#BA1A1A' : '#D4C4B0',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    backgroundColor: '#F6F3EE',
                    color: '#1C1C19',
                  }}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: 40 }}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Text style={{ color: '#8F1301', fontSize: 14 }}>
                    {isPasswordVisible ? t('common.hide') : t('common.show')}
                  </Text>
                </TouchableOpacity>
                {error && (
                  <Text style={{ color: '#BA1A1A', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                    {t(error.message as string)}
                  </Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ color: '#504536', fontSize: 14 }}>
              {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{
              height: 56,
              borderRadius: 9999,
              backgroundColor: '#C8922A',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16, 
                fontFamily: 'Inter_600SemiBold',
                letterSpacing: 0.5,
              }}>
                {t('auth.loginBtn')}
              </Text>
            )}
          </TouchableOpacity>

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
              {t('auth.noAccount')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ color: '#C8922A', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                {t('auth.createAccountLink')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}