// app/(tabs)/ai.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Image, 
  Modal,
  Keyboard,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAIChat, BackendConversationItem } from '@/hooks/useAIChat';
import { useAISessionStore, ChatSession } from '@/store/aiSessionStore';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';

const SUGGESTIONS = [
  { key: 'suggestion1', icon: 'map-outline' },
  { key: 'suggestion2', icon: 'restaurant-outline' },
  { key: 'suggestion3', icon: 'water-outline' },
];

export default function AIScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { 
    sendMessage, 
    isLoading, 
    messages, 
    currentChatId, 
    createSession, 
    setCurrentSession, 
    deleteSession,
    fetchBackendHistory,
    loadBackendSession
  } = useAIChat();
  
  const chatSessionsMap = useAISessionStore((state) => state.chatSessions);
  const [input, setInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [backendHistory, setBackendHistory] = useState<BackendConversationItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const isRTL = i18n.language === 'ar';
  const localSessions: ChatSession[] = Array.from(chatSessionsMap.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleOpenHistory = async () => {
    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    try {
      const history = await fetchBackendHistory();
      if (history && history.length > 0) {
        setBackendHistory(history);
      }
    } catch (err) {
      console.log('Error fetching history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestion = (key: string) => {
    setInput(t(`home.chatbot.${key}`));
    inputRef.current?.focus();
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleStartNewChat = () => {
    createSession();
    setIsHistoryOpen(false);
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsHistoryOpen(false);
    await loadBackendSession(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    setBackendHistory(prev => prev.filter(item => item.sessionId !== sessionId));
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };

  const formatDateLabel = (dateStr: any) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('common.today', 'Today');
    if (diffDays === 1) return t('common.yesterday', 'Yesterday');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Basic Markdown Bold & Italic Parser
  const parseMarkdownText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        return (
          <Text key={index} className="font-bold text-on-surface dark:text-dark-on-surface">
            {cleanText}
          </Text>
        );
      }
      
      const italicParts = part.split(/(\*[^*]+\*)/g);
      if (italicParts.length > 1) {
        return italicParts.map((ip, iidx) => {
          if (ip.startsWith('*') && ip.endsWith('*')) {
            return (
              <Text key={`${index}-${iidx}`} className="italic text-on-surface dark:text-dark-on-surface">
                {ip.slice(1, -1)}
              </Text>
            );
          }
          return <Text key={`${index}-${iidx}`} className="text-on-surface dark:text-dark-on-surface">{ip}</Text>;
        });
      }
      return <Text key={index} className="text-on-surface dark:text-dark-on-surface">{part}</Text>;
    });
  };

  // Render formatted message content
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    return (
      <View className="flex-col gap-1.5">
        <Text className="font-body-md text-on-surface dark:text-dark-on-surface text-[14px] leading-relaxed text-left">
          {parseMarkdownText(content)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Sticky Header */}
      <View 
        style={{ 
          paddingTop: insets.top + 6,
          backgroundColor: isDark ? 'rgba(20, 16, 8, 0.95)' : 'rgba(252, 249, 244, 0.95)'
        }} 
        className="flex-row items-center px-4 pb-3 border-b border-outline-variant/15 shadow-sm z-50"
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center rounded-full active:scale-90"
        >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={isDark ? '#E8E4DD' : '#1C1C19'} />
        </TouchableOpacity>
        
        {/* Concierge Profile Identity */}
        <View className="flex-row items-center flex-1 ml-2.5 gap-3">
          <View className="relative">
            <View className="w-10 h-10 rounded-full border-2 border-pharaoh-gold overflow-hidden bg-surface-container">
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8FBORIdg3MgPtgbCKkgY2gCxgtZiPHmTSZ1X_DfboCHZMhImbOlz6XO0jGuhqfevTpixGlOoPLfgDg--r4myXokoJSqXmKlfKFjW47VcR5Cl4YtV_POtGQhmNmgYeAtEdXeLd-TUgRSgPp2xveihQ1bxqbpMZ-JwtQFr4vMlnBema2xhbGd1JHbyFH95BC76bliIN9mq7UhU6KyAWScYrZw6zgMAPuVpHJhDzVh0CpvKG5NUULsCulCFsqaID4WsUuQyICiIss7g' }}
                className="w-full h-full"
              />
            </View>
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
          </View>
          <View>
            <Text className="font-headline text-on-surface text-base leading-tight text-left">
              {t('common.nav.planner')}
            </Text>
            <Text className="text-[9px] uppercase tracking-widest text-pharaoh-gold font-bold text-left">
              Heritage Concierge
            </Text>
          </View>
        </View>

        {/* Header Options */}
        <View className="flex-row gap-1.5">
          {/* View History Button (Uses Backend Route) */}
          <TouchableOpacity 
            onPress={handleOpenHistory}
            className="w-9 h-9 items-center justify-center rounded-full active:scale-90 bg-pharaoh-gold/10"
          >
            <Ionicons name="time-outline" size={20} color="#C8922A" />
          </TouchableOpacity>
          {/* New Chat Button */}
          <TouchableOpacity 
            onPress={handleStartNewChat}
            className="w-9 h-9 items-center justify-center rounded-full active:scale-90 bg-pharaoh-gold/10"
          >
            <Ionicons name="create-outline" size={20} color="#C8922A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat & Keyboard Canvas */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        {/* Chat Conversation Canvas */}
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ 
            paddingTop: 16,
            paddingBottom: 24, 
            paddingHorizontal: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          className="flex-1 z-10"
        >
          {/* Welcome message when chat session is empty */}
          {messages.length === 0 ? (
            <View className="flex-col items-start max-w-[85%] mb-4">
              <View className="bg-surface-container-low dark:bg-sand-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/35 dark:border-outline-variant/10">
                <Text className="font-body-md text-on-surface dark:text-dark-on-surface text-sm leading-relaxed text-left">
                  {i18n.language === 'ar' 
                    ? 'مرحباً! أنا كونسيرج رحال الذكي. كيف يمكنني مساعدتك في نسج رحلتك عبر عجائب مصر الخالدة اليوم؟' 
                    : 'Marhaban! I am your Rahal AI Concierge. How may I help you weave your journey through the timeless wonders of Egypt today?'}
                </Text>
              </View>
              <Text className="text-[10px] text-outline dark:text-dark-outline mt-1 ml-1 uppercase tracking-tighter">
                Just now
              </Text>
            </View>
          ) : (
            <View className="flex-col gap-4">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <View
                    key={msg.id || i}
                    className={`flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
                  >
                    <View
                      className={`p-4 rounded-2xl shadow-sm ${
                        isUser 
                          ? 'bg-pharaoh-gold rounded-tr-none shadow-md' 
                          : 'bg-surface-container-low dark:bg-sand-dark rounded-tl-none border border-outline-variant/25 dark:border-outline-variant/10'
                      }`}
                    >
                      {isUser ? (
                        <Text className="font-body-md text-white text-[14.5px] leading-relaxed text-left">
                          {msg.content}
                        </Text>
                      ) : (
                        <View className="w-full">
                          {renderFormattedContent(msg.content)}
                        </View>
                      )}
                      
                      {!isUser && msg.tokensUsed && (
                        <Text className="text-[10px] text-outline dark:text-dark-outline mt-2 text-right">
                          {t('home.chatbot.tokensUsed', { count: msg.tokensUsed })}
                        </Text>
                      )}
                    </View>
                    <Text className="text-[10px] text-outline dark:text-dark-outline mt-1 px-1 uppercase tracking-tighter">
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                );
              })}
              
              {/* Assistant Loading Indicator */}
              {isLoading && (
                <View className="flex-col items-start max-w-[85%]">
                  <View 
                    style={{ backgroundColor: colors['surface-container-low'], borderColor: colors.outlineVariant + '40' }}
                    className="p-4 rounded-2xl rounded-tl-none border"
                  >
                    <ActivityIndicator size="small" color="#C8922A" />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom Interaction Area */}
        <View 
          style={{ 
            paddingBottom: isKeyboardOpen ? (Platform.OS === 'android' ? 6 : 8) : Math.max(insets.bottom, 12),
            backgroundColor: colors.background + 'F2',
            borderTopColor: colors.outlineVariant + '1A',
          }} 
          className="px-4 pt-2.5 border-t z-40"
        >
          {/* Suggestion Chips (only when keyboard is closed) */}
          {!isKeyboardOpen && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingHorizontal: 2, gap: 10 }}
              className="pb-2.5"
            >
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => handleSuggestion(s.key)}
                  style={{ backgroundColor: colors['surface-container-low'], borderColor: colors.primary + '40' }}
                  className="border rounded-full px-4 py-1.5 flex-row items-center active:scale-95 shadow-sm"
                >
                  <View className="mr-1.5">
                    <Ionicons name={s.icon as any} size={14} color="#C8922A" />
                  </View>
                  <Text className="text-pharaoh-gold font-bold text-xs tracking-wide">
                    {t(`home.chatbot.${s.key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Chat Input Bar */}
          <View 
            style={{ backgroundColor: colors['surface-container-high'], borderColor: colors.outlineVariant + '33' }}
            className="rounded-full p-1.5 flex-row items-center shadow-lg border"
          >
            <TouchableOpacity 
              onPress={handleStartNewChat}
              className="w-9 h-9 items-center justify-center rounded-full active:scale-95"
            >
              <Ionicons name="add-circle" size={24} color="#C8922A" />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              placeholder={t('home.chatbot.mockPlaceholder')}
              placeholderTextColor={isDark ? '#9C8F7C' : '#A99F92'}
              className="flex-1 px-3 text-on-surface dark:text-dark-on-surface font-body-md text-sm py-1 min-h-[36px] max-h-[90px] text-left"
              style={{ color: colors.onSurface }}
              multiline
              onSubmitEditing={handleSend}
            />

            <View className="flex-row items-center gap-1">
              <TouchableOpacity 
                onPress={handleSend} 
                disabled={!input.trim() || isLoading} 
                className="w-9 h-9 items-center justify-center rounded-full bg-pharaoh-gold shadow-md active:scale-90"
              >
                <Ionicons name="send" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Credits Info (hidden when typing) */}
          {!isKeyboardOpen && (
            <View className="flex-row justify-center items-center gap-2 mt-2">
              <Badge variant="sparkle" size="sm">
                {t('home.chatbot.creditsTitle')}
              </Badge>
              <Text className="text-[10px] text-outline">
                {t('home.chatbot.creditsReset')}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Slide-Up Modal (Powered by Backend GET /api/v1/ai/chat) */}
      <Modal
        visible={isHistoryOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHistoryOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsHistoryOpen(false)} 
            className="flex-1"
          />
          
          <View 
            style={{ 
              backgroundColor: isDark ? '#1C1A14' : '#FFFFFF',
              borderTopColor: colors.outlineVariant + '33',
              maxHeight: '80%',
              paddingBottom: Math.max(insets.bottom, 20)
            }}
            className="rounded-t-3xl border-t p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-outline-variant/20 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={22} color="#C8922A" />
                <Text className="font-headline text-xl text-on-surface dark:text-dark-on-surface">
                  {t('home.chatbot.historyTitle', 'Chat History')}
                </Text>
              </View>
              
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleStartNewChat}
                  className="bg-pharaoh-gold/15 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:scale-95"
                >
                  <Ionicons name="add" size={16} color="#C8922A" />
                  <Text className="text-pharaoh-gold font-bold text-xs">
                    {t('home.chatbot.newChat', 'New Chat')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setIsHistoryOpen(false)}
                  className="w-8 h-8 items-center justify-center rounded-full bg-surface-container"
                >
                  <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sessions List */}
            {isHistoryLoading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="small" color="#C8922A" />
                <Text className="text-xs text-outline mt-3">{t('common.loading', 'Loading conversations...')}</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
                {backendHistory.length === 0 && localSessions.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <Ionicons name="chatbubbles-outline" size={40} color="#817565" style={{ opacity: 0.5 }} />
                    <Text className="text-on-surface-variant dark:text-outline text-sm mt-3 text-center">
                      {t('home.chatbot.noHistory', 'No past conversations yet. Start a new AI journey!')}
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2.5">
                    {/* Render backend history or merged local history */}
                    {(backendHistory.length > 0 ? backendHistory : localSessions.map(s => ({
                      sessionId: s.id,
                      title: s.messages.find(m => m.role === 'user')?.content || 'Heritage Consultation',
                      updatedAt: s.updatedAt as any,
                      messageCount: s.messages.length
                    }))).map((session) => {
                      const isSelected = session.sessionId === currentChatId;
                      const titleText = session.title || 'Heritage Consultation';

                      return (
                        <TouchableOpacity
                          key={session.sessionId}
                          onPress={() => handleSelectSession(session.sessionId)}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: isSelected 
                              ? 'rgba(200, 146, 42, 0.12)' 
                              : (isDark ? '#26241E' : '#F6F3EE'),
                            borderColor: isSelected ? '#C8922A' : 'transparent',
                          }}
                          className="p-3.5 rounded-2xl border flex-row items-center justify-between"
                        >
                          <View className="flex-1 pr-3">
                            <Text 
                              numberOfLines={1} 
                              className={`text-sm text-left ${isSelected ? 'font-bold text-pharaoh-gold' : 'font-medium text-on-surface dark:text-dark-on-surface'}`}
                            >
                              {titleText}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                              <Text className="text-[11px] text-outline text-left">
                                {formatDateLabel(session.updatedAt || (session as any).createdAt)}
                              </Text>
                              {session.messageCount !== undefined && (
                                <>
                                  <Text className="text-[11px] text-outline">•</Text>
                                  <Text className="text-[11px] text-outline text-left">
                                    {session.messageCount} {t('home.chatbot.messagesCount', 'messages')}
                                  </Text>
                                </>
                              )}
                            </View>
                          </View>

                          <View className="flex-row items-center gap-1">
                            {isSelected && (
                              <View className="bg-pharaoh-gold px-2 py-0.5 rounded-full mr-1">
                                <Text className="text-[9px] text-white font-bold uppercase">Active</Text>
                              </View>
                            )}
                            <TouchableOpacity
                              onPress={() => handleDeleteSession(session.sessionId)}
                              className="p-1.5 active:scale-90"
                            >
                              <Ionicons name="trash-outline" size={16} color="#BA1A1A" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}