// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

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
  const { colors, isDark } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { promptAsync, request, isAuthenticating } = useGoogleAuth();

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

        {/* Signup Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{t('auth.signupTitle')}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>{t('auth.signupSubtitle')}</Text>

          {/* Name Input */}
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Required', minLength: 2 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>{t('auth.nameLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceContainerLow }, error && styles.inputErrorBorder]}>
                  <Ionicons name="person-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.namePlaceholder')}
                    placeholderTextColor={colors.onSurfaceVariant + '80'}
                    style={[styles.textInput, { color: colors.onSurface }]}
                    autoCapitalize="words"
                    autoComplete="name"
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

          {/* Password Input */}
          <Controller
            name="password"
            control={control}
            rules={{ required: 'Required', minLength: 8 }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>{t('auth.passwordLabel')}</Text>
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
                    autoComplete="new-password"
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

                {password ? (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarsWrapper}>
                      {[...Array(5)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: i < getPasswordStrength(password) ? '#C8922A' : (isDark ? '#3A3833' : '#E5E2DD'),
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.strengthText}>
                      {t(`auth.strength${strengthLabels[getPasswordStrength(password)]}`)}
                    </Text>
                  </View>
                ) : null}

                {error && (
                  <Text style={styles.errorText}>
                    {t(error.message as string)}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Confirm Password Input */}
          <Controller
            name="confirmPassword"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>{t('auth.confirmPasswordLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceContainerLow }, error && styles.inputErrorBorder]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.confirmPasswordLabel')}
                    placeholderTextColor={colors.onSurfaceVariant + '80'}
                    secureTextEntry={!isConfirmPasswordVisible}
                    style={[styles.textInput, { color: colors.onSurface }]}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    <Ionicons 
                       name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} 
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

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkboxTouch}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: colors.outline },
                  termsAccepted && styles.checkboxChecked
                ]}
              >
                {termsAccepted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
            <Text style={[styles.termsText, { color: colors.onSurfaceVariant }]}>
              {t('auth.termsCheckbox')}
            </Text>
          </View>

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
                <Text style={styles.submitButtonText}>{t('auth.signupBtn')}</Text>
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
            disabled={!request || isAuthenticating}
            style={[styles.googleButton, (!request || isAuthenticating) && { opacity: 0.6 }]}
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

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={[styles.haveAccountText, { color: colors.onSurfaceVariant }]}>{t('auth.haveAccount')}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLinkText}>{t('auth.loginLink')}</Text>
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
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#1C1C19',
    marginBottom: 6,
    textAlign: 'left',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4F4537',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F4537',
    marginBottom: 6,
    marginLeft: 2,
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
  visibilityButton: {
    padding: 6,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  strengthBarsWrapper: {
    flexDirection: 'row',
    flex: 1,
    maxWidth: 150,
    height: 4,
    borderRadius: 2,
    marginRight: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    color: '#504536',
    fontWeight: '500',
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  checkboxTouch: {
    marginTop: 2,
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#E5E2DD',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    borderColor: '#C8922A',
    backgroundColor: '#C8922A',
  },
  termsText: {
    color: '#4F4537',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  submitButton: {
    height: 52,
    borderRadius: 99,
    backgroundColor: '#C8922A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
    marginVertical: 18,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E2DD',
  },
  orText: {
    color: '#817565',
    fontSize: 11,
    marginHorizontal: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  googleButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#C8922A',
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  haveAccountText: {
    color: '#4F4537',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#C8922A',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 6,
  },
});