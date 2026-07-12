// app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useUIStore();
  const { colors, isDark } = useTheme();
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
      router.push(`/(auth)/verify-otp?email=${encodeURIComponent(data.email)}`);
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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Image 
            source={require('../../assets/logo-2.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Rahal</Text>
          <Text style={styles.brandSubtitle}>Personalized Heritage Expeditions</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Forgot Password Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={32} color="#C8922A" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{t('auth.forgotPassword.title')}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>{t('auth.forgotPassword.subtitle')}</Text>

          {/* Email Input */}
          <Controller
            name="email"
            control={control}
            rules={{ required: 'Required', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>{t('auth.emailLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceContainerLow }, error && styles.inputErrorBorder]}>
                  <Ionicons name="mail-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={colors.onSurfaceVariant + '80'}
                    style={[styles.textInput, { color: colors.onSurface }]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
                {error && (
                  <Text style={styles.errorText}>
                    {t(error.message as string)}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>{t('auth.forgotPasswordBtn')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.backLinkContainer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.backLinkText}>{t('auth.backToLoginLink')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF9F4', // Warm sand background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  brandTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#C8922A', // Pharaoh Gold
    letterSpacing: -0.5,
    marginTop: 6,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#817565',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  dividerLine: {
    width: 64,
    height: 1,
    backgroundColor: 'rgba(200, 146, 42, 0.2)',
    marginTop: 12,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#1A120B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EDE9',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(200, 146, 42, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#1C1C19',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4F4537',
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F4537',
    marginBottom: 6,
    marginLeft: 2,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    width: '100%',
  },
  inputErrorBorder: {
    borderColor: '#BA1A1A',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1C1C19',
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    alignSelf: 'flex-start',
  },
  submitButton: {
    height: 52,
    borderRadius: 99,
    backgroundColor: '#C8922A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  backLinkContainer: {
    marginTop: 24,
  },
  backLinkText: {
    color: '#C8922A',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});