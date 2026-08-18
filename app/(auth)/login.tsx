// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

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
  const { colors, isDark } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { promptAsync, request, isAuthenticating } = useGoogleAuth();
  
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

        {/* Login Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{t('auth.loginTitle')}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>{t('auth.loginSubtitle')}</Text>

          {/* Email Input */}
          <Controller
            name="email"
            control={control}
            rules={{ required: 'auth.errors.missingFields', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Email Address</Text>
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

          {/* Password Input */}
          <Controller
            name="password"
            control={control}
            rules={{ required: 'auth.errors.missingFields', minLength: 6 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={styles.inputContainer}>
                <View style={styles.passwordHeader}>
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Password</Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceContainerLow }, error && styles.inputErrorBorder]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={colors.onSurfaceVariant + '80'}
                    secureTextEntry={!isPasswordVisible}
                    style={[styles.textInput, { color: colors.onSurface }]}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Ionicons 
                      name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
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
                <Text style={styles.submitButtonText}>{t('auth.loginBtn')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orContainer}>
            <View style={[styles.horizontalLine, { backgroundColor: colors.outlineVariant + '40' }]} />
            <Text style={[styles.orText, { color: colors.outline }]}>{t('auth.continueWith')}</Text>
            <View style={[styles.horizontalLine, { backgroundColor: colors.outlineVariant + '40' }]} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            onPress={() => promptAsync()}
            disabled={isAuthenticating}
            style={[styles.googleButton, isAuthenticating && { opacity: 0.6 }]}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#C8922A" size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#C8922A" />
                <Text style={styles.googleButtonText}>{t('auth.googleBtn')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={[styles.noAccountText, { color: colors.onSurfaceVariant }]}>{t('auth.noAccount')}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupText}>{t('auth.createAccountLink')}</Text>
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
    color: '#817565', // neutral outline
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
    backgroundColor: '#FFFFFF', // surface lowest
    borderRadius: 16,
    padding: 24,
    shadowColor: '#1A120B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EDE9', // surface container
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#1C1C19', // on surface
    marginBottom: 6,
    textAlign: 'left',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4F4537', // on surface variant
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 18,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F4537', // on surface variant
    marginBottom: 6,
    marginLeft: 2,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C8922A', // Pharaoh Gold
    marginBottom: 6,
  },
  inputWrapper: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EE', // surface container low
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
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
    color: '#1C1C19', // on surface
    fontFamily: 'Inter_400Regular',
  },
  visibilityButton: {
    padding: 6,
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    height: 54,
    borderRadius: 99,
    backgroundColor: '#C8922A', // Pharaoh Gold
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E2DD', // outline variant
  },
  orText: {
    color: '#817565', // neutral outline
    fontSize: 11,
    marginHorizontal: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  googleButton: {
    height: 52,
    borderWidth: 1,
    borderColor: '#C8922A', // gold outline
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  googleButtonText: {
    color: '#C8922A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  noAccountText: {
    color: '#4F4537',
    fontSize: 14,
  },
  signupText: {
    color: '#C8922A',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 6,
  },
});