// src/store/aiSessionStore.ts
import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingSession {
  sessionId: string;
  step: 'destination' | 'dates' | 'budget' | 'preferences' | 'hotel_selection' | 'guest_info' | 'payment' | 'complete';
  aiResponse: string;
  isComplete: boolean;
  bookingId?: string;
  context?: any;
}

interface AISessionState {
  chatSessions: Map<string, ChatSession>;
  currentChatId: string | null;
  bookingSession: BookingSession | null;
  
  createChatSession: () => string;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setCurrentChat: (chatId: string) => void;
  deleteChatSession: (chatId: string) => void;
  getChatSession: (chatId: string) => ChatSession | undefined;
  
  startBookingFlow: (context?: any) => Promise<void>;
  sendBookingMessage: (message: string) => Promise<void>;
  resetBookingFlow: () => void;
}

export const useAISessionStore = create<AISessionState>((set, get) => ({
  chatSessions: new Map(),
  currentChatId: null,
  bookingSession: null,
  
  createChatSession: () => {
    const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const session: ChatSession = {
      id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const newSessions = new Map(state.chatSessions);
      newSessions.set(id, session);
      return { chatSessions: newSessions, currentChatId: id };
    });
    return id;
  },
  
  addMessage: (chatId: string, message: ChatMessage) => {
    set((state) => {
      const session = state.chatSessions.get(chatId);
      if (!session) return state;
      
      const newSessions = new Map(state.chatSessions);
      newSessions.set(chatId, {
        ...session,
        messages: [...session.messages, message],
        updatedAt: new Date(),
      });
      return { chatSessions: newSessions };
    });
  },
  
  setCurrentChat: (chatId: string) => set({ currentChatId: chatId }),
  
  deleteChatSession: (chatId: string) => {
    set((state) => {
      const newSessions = new Map(state.chatSessions);
      newSessions.delete(chatId);
      return {
        chatSessions: newSessions,
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
      };
    });
  },
  
  getChatSession: (chatId: string) => get().chatSessions.get(chatId),
  
  startBookingFlow: async (context?: any) => {
    // Implemented in useAIBooking hook
  },
  
  sendBookingMessage: async (message: string) => {
    // Implemented in useAIBooking hook
  },
  
  resetBookingFlow: () => set({ bookingSession: null }),
}));