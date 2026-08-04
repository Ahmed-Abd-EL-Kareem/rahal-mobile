// app/(tabs)/ai.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAIChat } from '@/hooks/useAIChat';
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

  const formatTime = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
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

  // Render bento-style itinerary table
  const renderTable = (tableData: { headers: string[]; rows: string[][] }, key: string) => {
    return (
      <View key={key} style={{ backgroundColor: colors.surfaceBright, borderColor: colors.outlineVariant + '33' }} className="my-3 border rounded-xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <View className="bg-pharaoh-gold/5 px-4 py-2.5 border-b border-pharaoh-gold/20 flex-row justify-between items-center">
          <Text className="font-bold text-xs text-pharaoh-gold uppercase tracking-widest">
            {tableData.headers[0] || 'Day'} Plan
          </Text>
          <Ionicons name="sparkles" size={14} color="#C8922A" />
        </View>
        
        {/* Table Body */}
        <View style={{ backgroundColor: colors.surfaceContainerLowest }} className="p-2">
          {/* Header Column Labels */}
          <View className="flex-row border-b border-outline-variant/20 pb-1.5 mb-1 px-1">
            {tableData.headers.map((h, idx) => (
              <Text 
                key={idx} 
                className={`text-[10px] font-bold text-outline dark:text-dark-outline uppercase tracking-wider ${
                  idx === 0 ? 'w-10' : idx === 1 ? 'w-24' : 'flex-1'
                }`}
              >
                {h}
              </Text>
            ))}
          </View>
          
          {/* Table Rows */}
          {tableData.rows.map((row, rowIdx) => (
            <View 
              key={rowIdx} 
              className={`flex-row py-2.5 px-1 items-center ${
                rowIdx !== tableData.rows.length - 1 ? 'border-b border-outline-variant/10' : ''
              }`}
            >
              {row.map((col, colIdx) => {
                if (colIdx === 0) {
                  return (
                    <Text key={colIdx} style={{ color: colors.secondary }} className="w-10 font-bold text-sm">
                      {col}
                    </Text>
                  );
                } else if (colIdx === 1) {
                  return (
                    <Text key={colIdx} className="w-24 text-on-surface dark:text-dark-on-surface text-sm font-semibold">
                      {col}
                    </Text>
                  );
                } else {
                  return (
                    <Text key={colIdx} className="flex-1 text-on-surface dark:text-dark-on-surface text-sm italic font-normal text-on-surface/90">
                      {col}
                    </Text>
                  );
                }
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render entire structured response content
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    const renderedElements: React.ReactNode[] = [];
    let currentTable: { headers: string[]; rows: string[][] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for markdown table row
      if (line.startsWith('|')) {
        const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Separator row (e.g. |---|---|)
        if (cols.every(col => col.startsWith('-') || col === '')) {
          continue;
        }
        
        if (!currentTable) {
          currentTable = { headers: cols, rows: [] };
        } else {
          currentTable.rows.push(cols);
        }
        continue;
      } else {
        // Render accumulated table if table block has ended
        if (currentTable) {
          renderedElements.push(renderTable(currentTable, `table-${i}`));
          currentTable = null;
        }
      }
      
      // Bullet list item
      if (line.startsWith('-') || line.startsWith('*')) {
        const bulletText = line.replace(/^[-*]\s*/, '');
        renderedElements.push(
          <View key={`bullet-${i}`} className="flex-row items-start pl-2 py-0.5">
            <Text className="text-pharaoh-gold mr-2 font-bold text-sm">•</Text>
            <Text className="flex-1 text-on-surface dark:text-dark-on-surface font-body-md text-sm leading-relaxed">
              {parseMarkdownText(bulletText)}
            </Text>
          </View>
        );
        continue;
      }
      
      // Standard paragraph
      if (line.length > 0) {
        renderedElements.push(
          <Text key={`p-${i}`} className="text-on-surface dark:text-dark-on-surface font-body-md text-sm leading-relaxed mb-2">
            {parseMarkdownText(line)}
          </Text>
        );
      } else {
        // Spacing block
        renderedElements.push(<View key={`space-${i}`} className="h-1.5" />);
      }
    }
    
    // Catch remaining table if at the end of text
    if (currentTable) {
      renderedElements.push(renderTable(currentTable, `table-last`));
    }
    
    return <View className="flex-col gap-1">{renderedElements}</View>;
  };

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Ambient Atmospheric Glows */}
      <View 
        pointerEvents="none" 
        className="absolute top-[15%] right-[-10%] w-[260px] h-[260px] bg-pharaoh-gold/5 rounded-full z-0" 
        style={{ transform: [{ scale: 1.2 }] }}
      />
      <View 
        pointerEvents="none" 
        className="absolute bottom-[20%] left-[-15%] w-[220px] h-[220px] bg-nile-blue/5 rounded-full z-0"
        style={{ transform: [{ scale: 1.2 }] }}
      />

      {/* Sticky Glassmorphic Header */}
      <View 
        style={{ 
          paddingTop: insets.top + 6,
          backgroundColor: isDark ? 'rgba(20, 16, 8, 0.92)' : 'rgba(252, 249, 244, 0.92)'
        }} 
        className="flex-row items-center px-4 pb-3 border-b border-outline-variant/15 shadow-sm z-50"
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center rounded-full active:scale-90"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#E8E4DD' : '#1C1C19'} />
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
            <Text className="font-headline text-on-surface text-base leading-tight">
              {t('common.nav.planner')}
            </Text>
            <Text className="text-[9px] uppercase tracking-widest text-pharaoh-gold font-bold">
              Heritage Concierge
            </Text>
          </View>
        </View>

        {/* Header Options */}
        <View className="flex-row gap-1">
          <TouchableOpacity className="w-9 h-9 items-center justify-center rounded-full active:scale-90">
            <Ionicons name="time-outline" size={20} color="#817565" />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 items-center justify-center rounded-full active:scale-90">
            <Ionicons name="ellipsis-vertical" size={20} color="#817565" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat & Keyboard Canvas */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
        className="flex-1"
      >
        {/* Chat Conversation Canvas */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ 
            paddingTop: 16,
            paddingBottom: 24, 
            paddingHorizontal: 16 
          }}
          showsVerticalScrollIndicator={false}
          className="flex-1 z-10"
        >
          {/* Welcome message when chat session is empty */}
          {messages.length === 0 ? (
            <View className="flex-col items-start max-w-[85%] mb-4">
              <View className="bg-surface-container-low dark:bg-sand-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/35 dark:border-outline-variant/10">
                <Text className="font-body-md text-on-surface dark:text-dark-on-surface text-sm leading-relaxed">
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
                        <Text className="font-body-md text-white text-[14.5px] leading-relaxed">
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
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: colors.background + 'F2',
            borderTopColor: colors.outlineVariant + '1A',
          }} 
          className="px-4 pt-3 border-t z-40"
        >
          {/* Suggestion Chips */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 2, gap: 10 }}
            className="pb-3"
          >
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => handleSuggestion(s.key)}
                style={{ backgroundColor: colors['surface-container-low'], borderColor: colors.primary + '40' }}
                className="border rounded-full px-4 py-2 flex-row items-center active:scale-95 shadow-sm"
              >
                <View className="mr-1.5">
                  <Ionicons name={s.icon as any} size={15} color="#C8922A" />
                </View>
                <Text className="text-pharaoh-gold font-bold text-xs tracking-wide">
                  {t(`home.chatbot.${s.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chat Input Bar */}
          <View 
            style={{ backgroundColor: colors['surface-container-high'], borderColor: colors.outlineVariant + '33' }}
            className="rounded-full p-1.5 flex-row items-center shadow-lg border"
          >
            <TouchableOpacity className="w-9 h-9 items-center justify-center rounded-full active:scale-95">
              <Ionicons name="add-circle" size={24} color="#817565" />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder={t('home.chatbot.mockPlaceholder')}
              placeholderTextColor={isDark ? '#9C8F7C' : '#A99F92'}
              className="flex-1 px-3 text-on-surface dark:text-dark-on-surface font-body-md text-sm py-1 h-9"
              style={{ color: colors.onSurface }}
              onSubmitEditing={handleSend}
            />

            <View className="flex-row items-center gap-1">
              <TouchableOpacity className="w-9 h-9 items-center justify-center rounded-full active:scale-95">
                <Ionicons name="mic" size={20} color="#1B4B6E" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSend} 
                disabled={!input.trim() || isLoading} 
                className="w-9 h-9 items-center justify-center rounded-full bg-pharaoh-gold shadow-md active:scale-90"
              >
                <Ionicons name="send" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Oracle Credits Tracker */}
          <View className="flex-row justify-center items-center gap-2 mt-2.5">
            <Badge variant="sparkle" size="sm">
              {t('home.chatbot.creditsTitle')}
            </Badge>
            <Text className="text-[10px] text-outline">
              {t('home.chatbot.creditsReset')}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}