// src/hooks/useAIChat.ts
import { useState, useCallback } from 'react';
import { api } from '@/api/client';
import { useAISessionStore, ChatMessage, ChatSession } from '@/store/aiSessionStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  createSession: () => string;
  currentChatId: string | null;
  setCurrentSession: (id: string) => void;
  getSession: (id: string) => ChatSession | undefined;
  deleteSession: (id: string) => void;
}

export function useAIChat(): UseAIChatReturn {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, createChatSession, getChatSession, deleteChatSession, chatSessions } = useAISessionStore();
  const { showToast } = useUIStore();
  const { token } = useAuthStore();

  const createSession = useCallback(() => {
    const id = createChatSession();
    setCurrentChatId(id);
    return id;
  }, [createChatSession]);

  const sendMessage = useCallback(async (content: string) => {
    const chatId = currentChatId || createSession();
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(chatId, userMessage);

    try {
      const session = getChatSession(chatId);
      const messages = session?.messages.map(m => ({ role: m.role, content: m.content })) || [];

      const response = await api.post('ai/chat', {
        json: { messages: [...messages, { role: 'user', content }] },
      }).json<{ reply: string; tokensUsed: number }>();

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        tokensUsed: response.tokensUsed,
      };
      addMessage(chatId, aiMessage);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message';
      showToast({ type: 'error', message });
      addMessage(chatId, {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: message,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, createSession, addMessage, getChatSession, showToast]);

  const setCurrentSession = useCallback((id: string) => {
    setCurrentChatId(id);
  }, []);

  const getSession = useCallback((id: string) => {
    return getChatSession(id);
  }, [getChatSession]);

  const deleteSession = useCallback((id: string) => {
    deleteChatSession(id);
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  }, [currentChatId, deleteChatSession]);

  const messages = currentChatId ? getChatSession(currentChatId)?.messages || [] : [];

  return {
    messages,
    isLoading,
    sendMessage,
    createSession,
    currentChatId,
    setCurrentSession,
    getSession,
    deleteSession,
  };
}