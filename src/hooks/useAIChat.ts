// src/hooks/useAIChat.ts
import { useState, useCallback, useEffect } from 'react';
import { api } from '@/api/client';
import { useAISessionStore, ChatMessage, ChatSession } from '@/store/aiSessionStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export interface BackendConversationItem {
  sessionId: string;
  title?: string;
  lastMessage?: string;
  updatedAt?: string;
  createdAt?: string;
  messageCount?: number;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  createSession: () => string;
  currentChatId: string | null;
  setCurrentSession: (id: string) => void;
  getSession: (id: string) => ChatSession | undefined;
  deleteSession: (id: string) => Promise<void>;
  fetchBackendHistory: () => Promise<BackendConversationItem[]>;
  loadBackendSession: (sessionId: string) => Promise<void>;
}

export function useAIChat(): UseAIChatReturn {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, createChatSession, getChatSession, deleteChatSession, chatSessions } = useAISessionStore();
  const { showToast } = useUIStore();
  const { token, user } = useAuthStore();

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

  const deleteSession = useCallback(async (id: string) => {
    deleteChatSession(id);
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
    if (token) {
      try {
        await api.delete(`ai/chat/${id}`).json();
      } catch (err) {
        console.log('Failed to delete backend session:', err);
      }
    }
  }, [currentChatId, deleteChatSession, token]);

  const fetchBackendHistory = useCallback(async (): Promise<BackendConversationItem[]> => {
    if (!token) return [];
    try {
      const res = await api.get('ai/chat').json<{
        status: string;
        data: BackendConversationItem[];
      }>();
      return res?.data || [];
    } catch (err) {
      console.log('Failed to fetch backend chat history:', err);
      return [];
    }
  }, [token]);

  const loadBackendSession = useCallback(async (sessionId: string) => {
    setCurrentChatId(sessionId);
    if (!token) return;
    try {
      const res = await api.get(`ai/chat/${sessionId}`).json<{
        status: string;
        data: {
          sessionId: string;
          title?: string;
          messages: Array<{
            role: 'user' | 'assistant' | 'system';
            content: string;
            createdAt?: string;
            tokensUsed?: number;
          }>;
        };
      }>();

      if (res?.data?.messages && res.data.messages.length > 0) {
        const existingSession = getChatSession(sessionId);
        if (!existingSession || existingSession.messages.length === 0) {
          // Recreate session with backend messages
          const mappedMessages: ChatMessage[] = res.data.messages.map((m, idx) => ({
            id: `bk_${sessionId}_${idx}`,
            role: m.role as any,
            content: m.content,
            timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
            tokensUsed: m.tokensUsed,
          }));

          useAISessionStore.setState((state) => {
            const next = new Map(state.chatSessions);
            next.set(sessionId, {
              id: sessionId,
              title: res.data.title || 'Heritage Chat',
              createdAt: new Date(),
              updatedAt: new Date(),
              messages: mappedMessages,
            });
            return { chatSessions: next };
          });
        }
      }
    } catch (err) {
      console.log('Failed to load backend session details:', err);
    }
  }, [token, getChatSession]);

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
    fetchBackendHistory,
    loadBackendSession,
  };
}