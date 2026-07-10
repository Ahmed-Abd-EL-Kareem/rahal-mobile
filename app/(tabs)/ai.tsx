// app/(tabs)/ai.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAIChat } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';

const SUGGESTIONS = [
  { key: 'suggestion1', icon: 'book-outline' },
  { key: 'suggestion2', icon: 'restaurant-outline' },
  { key: 'suggestion3', icon: 'water-outline' },
];

export default function AIScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { sendMessage, isLoading, messages } = useAIChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestion = (key: string) => {
    setInput(t(`home.chatbot.${key}`));
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-display-lg-mobile font-headline text-on-surface">
                {t('home.chatbot.welcomeTitle')}
              </Text>
              <Text className="text-body-md text-on-surface-variant mt-1">
                {t('home.chatbot.welcomeSubtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/trip/generate')} className="p-2">
              <Ionicons name="add-circle-outline" size={28} color="#C8922A" />
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => handleSuggestion(s.key)}
                className="bg-surface-container border border-outline-variant rounded-xl p-4 min-w-[280px] flex-row items-center gap-3"
              >
                <View className="p-2 rounded-lg bg-primary/10">
                  <Ionicons name={s.icon} size={20} color="#C8922A" />
                </View>
                <Text className="text-label-md text-on-surface flex-1">
                  {t(`home.chatbot.${s.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Messages */}
        <View className="px-4 pb-4" style={{ minHeight: 400 }}>
          {messages.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="p-4 rounded-full bg-primary/10 mb-4">
                <Ionicons name="sparkles" size={40} color="#C8922A" />
              </View>
              <Text className="text-headline-md font-headline text-on-surface text-center mb-2 px-8">
                {t('home.chatbot.welcomeTitle')}
              </Text>
              <Text className="text-body-md text-on-surface-variant text-center px-8">
                {t('home.chatbot.welcomeSubtitle')}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {messages.map((msg, i) => (
                <View key={i} className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <View
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-3
                      ${msg.role === 'user' 
                        ? 'bg-primary text-on-primary rounded-tr-md' 
                        : 'bg-surface-container rounded-tl-md shadow-resting'
                      }
                    `}
                  >
                    <Text className={`text-body-md ${msg.role === 'user' ? 'text-on-primary' : 'text-on-surface'}`}>
                      {msg.content}
                    </Text>
                    {msg.tokensUsed && (
                      <Text className="text-label-sm text-on-surface-variant/60 mt-1 text-right">
                        {t('home.chatbot.tokensUsed', { count: msg.tokensUsed })}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              {isLoading && (
                <View className="flex-row justify-start">
                  <View className="bg-surface-container rounded-2xl rounded-tl-md shadow-resting px-4 py-3">
                    <View className="flex-row gap-1">
                      <View className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <View className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <View className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View className="px-4 pb-4 pt-2 bg-background" style={{ borderTopWidth: 1, borderTopColor: isDark ? '#2C2A23' : '#D4C4B0' }}>
          <View className="flex-row items-end gap-3">
            <TouchableOpacity
              onPress={() => router.push('/subscription/plans')}
              className="p-2 rounded-lg bg-surface-container"
            >
              <Ionicons name="sparkles" size={24} color="#C8922A" />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                placeholder={t('home.chatbot.mockPlaceholder')}
                className="flex-1 text-body-md text-on-surface"
                multiline
                maxLength={1000}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity onPress={handleSend} disabled={!input.trim() || isLoading} className="p-2">
                <Ionicons
                  name="send"
                  size={24}
                  color={input.trim() && !isLoading ? '#C8922A' : '#827564'}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-center gap-4 mt-2">
            <Badge variant="sparkle" size="sm">
              {t('home.chatbot.creditsTitle')}
            </Badge>
            <Text className="text-label-sm text-on-surface-variant self-center">
              {t('home.chatbot.creditsReset')}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}