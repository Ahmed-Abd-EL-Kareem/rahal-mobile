// src/hooks/useAIChat.ts
import { useState, useCallback } from 'react';
import { api } from '@/api/client';
import { useAISessionStore, ChatMessage, ChatSession } from '@/store/aiSessionStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { SuccessResponse, AIChatResponse } from '@/types/api';

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
      const res = await api.post('ai/chat', {
        json: { message: content, sessionId: chatId },
      }).json<{ status: string; message: string; data: { reply: string; tokensUsed?: number; sessionId: string } }>();

      const replyText = res?.data?.reply || 'I am sorry, I could not process your request at this moment.';
      const tokens = res?.data?.tokensUsed;

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
        tokensUsed: tokens,
      };
      addMessage(chatId, aiMessage);
    } catch (error: any) {
      let errorMessage = 'Failed to send message';
      if (error?.response) {
        try {
          const errData = await error.response.json();
          errorMessage = errData.message || errData.error || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showToast({ type: 'error', message: errorMessage });
      addMessage(chatId, {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `⚠️ ${errorMessage}. Tap below to resend.`,
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