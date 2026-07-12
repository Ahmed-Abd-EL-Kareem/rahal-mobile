// src/components/chat/AIMessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export interface AIMessageBubbleProps {
  message: string;
  isUser?: boolean;
  isLoading?: boolean;
  tokensUsed?: number;
  timestamp?: Date;
  onCopy?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

export const AIMessageBubble = ({
  message,
  isUser = false,
  isLoading = false,
  tokensUsed,
  timestamp,
  onCopy,
  onRegenerate,
  className = '',
}: AIMessageBubbleProps) => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, styles.loadingBubble, { backgroundColor: colors.surfaceContainerLow }]} className={className}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]} className={className}>
      <Pressable
        style={[
          styles.bubble,
          isUser ? styles.userBubble : [styles.aiBubble, { backgroundColor: colors.surfaceContainerLow }],
          isRTL && (isUser ? styles.rtlUserBubble : styles.rtlAIBubble),
        ]}
        onLongPress={onCopy}
        android_ripple={{ color: isUser ? '#FFFFFF40' : '#C8922A20', borderless: true }}
      >
        <View style={styles.bubbleContent}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : [styles.aiMessageText, { color: colors.onSurface }],
              isRTL && styles.rtlText,
            ]}
            selectable={true}
          >
            {message}
          </Text>

          {(tokensUsed || timestamp) && (
            <View style={[styles.metaRow, isRTL && styles.rtlMetaRow]}>
              {timestamp && (
                <Text style={[styles.metaText, isUser ? styles.userMetaText : [styles.aiMetaText, { color: colors.onSurfaceVariant }]]}>
                  {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
              {tokensUsed && (
                <Text style={[styles.metaText, isUser ? styles.userMetaText : [styles.aiMetaText, { color: colors.onSurfaceVariant }]]}>
                  {t('home.chatbot.tokensUsed', { count: tokensUsed })}
                </Text>
              )}
            </View>
          )}
        </View>
      </Pressable>

      {onCopy && (
        <TouchableOpacity
          style={[styles.copyButton, isRTL && styles.rtlCopyButton]}
          onPress={onCopy}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="copy-outline" size={16} color={isUser ? '#FFFFFF80' : '#C8922A80'} />
        </TouchableOpacity>
      )}

      {onRegenerate && !isUser && (
        <TouchableOpacity
          style={[styles.regenerateButton, isRTL && styles.rtlRegenerateButton]}
          onPress={onRegenerate}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh-outline" size={16} color="#C8922A80" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Streaming message bubble for real-time AI responses
export const AIStreamingBubble = ({
  message,
  isComplete = false,
  onRegenerate,
  className = '',
}: { message: string; isComplete?: boolean; onRegenerate?: () => void; className?: string }) => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <View style={[styles.container, styles.aiContainer]} className={className}>
      <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.surfaceContainerLow }, isRTL && styles.rtlAIBubble]}>
        <Text
          style={[
            styles.messageText,
            styles.aiMessageText,
            { color: colors.onSurface },
            isRTL && styles.rtlText,
          ]}
          selectable={true}
        >
          {message}
          {!isComplete && <Text style={styles.cursor}>▋</Text>}
        </Text>
      </View>

      {isComplete && onRegenerate && (
        <TouchableOpacity
          style={[styles.regenerateButton, isRTL && styles.rtlRegenerateButton]}
          onPress={onRegenerate}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh-outline" size={16} color="#C8922A80" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Suggestion chip for quick replies
export const SuggestionChip = ({
  label,
  icon,
  onPress,
  className = '',
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  className?: string;
}) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.suggestionChip,
        { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' },
      ]}
      className={className}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
    >
      {icon && (
        <View style={[styles.suggestionIcon, { backgroundColor: colors.surfaceContainer }]}>
          <Ionicons name={icon as any} size={20} color="#C8922A" />
        </View>
      )}
      <Text style={[styles.suggestionText, { color: colors.onSurface }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rtlUser: {
    flexDirection: 'row',
  },
  rtlAI: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#7E5700',
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: '#F0EDE9',
    borderBottomLeftRadius: 8,
    shadowColor: '#504536',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rtlUserBubble: {
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 8,
  },
  rtlAIBubble: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 8,
  },
  bubbleContent: {
    flexDirection: 'column',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1C1C19',
  },
  rtlText: {
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  rtlMetaRow: {
    flexDirection: 'row-reverse',
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
  userMetaText: {
    color: '#FFFFFF99',
  },
  aiMetaText: {
    color: '#504537',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  rtlCopyButton: {
    marginLeft: 0,
    marginRight: 8,
  },
  regenerateButton: {
    marginLeft: 4,
    padding: 4,
  },
  rtlRegenerateButton: {
    marginLeft: 0,
    marginRight: 4,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
  },
  loadingUser: {
    alignSelf: 'flex-end',
  },
  loadingBubble: {
    backgroundColor: '#F0EDE9',
    borderRadius: 24,
    borderBottomLeftRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#504536',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C8922A',
  },
  cursor: {
    color: '#C8922A',
    fontWeight: 'bold',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_500Medium',
    color: '#1C1C19',
  },
});

export default AIMessageBubble;