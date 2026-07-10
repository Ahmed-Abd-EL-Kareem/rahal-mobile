import { renderHook, act } from '@testing-library/react';
import { useAIChat } from '@/hooks/useAIChat';
import { useAISessionStore } from '@/store/aiSessionStore';
import { api } from '@/api/client';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/store/aiSessionStore');
jest.mock('@/api/client');
jest.mock('@/store/uiStore');
jest.mock('@/store/authStore');

const mockApi = api as jest.Mocked<typeof api>;
const mockAIStore = useAISessionStore as jest.Mocked<typeof useAISessionStore>;
const mockUIStore = useUIStore as jest.Mocked<typeof useUIStore>;
const mockAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>;

describe('useAIChat', () => {
  const mockAddMessage = jest.fn();
  const mockCreateChatSession = jest.fn(() => 'chat_123');
  const mockGetChatSession = jest.fn();
  const mockSetCurrentChat = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAIStore.getState().createChatSession = mockCreateChatSession;
    mockAIStore.getState().addMessage = mockAddMessage;
    mockAIStore.getState().getChatSession = mockGetChatSession;
    mockAIStore.getState().setCurrentChat = mockSetCurrentChat;
    mockUIStore.getState().showToast = mockShowToast;
    mockAuthStore.getState().token = 'test-token';
  });

  describe('sendMessage', () => {
    it('creates new chat session if none exists', async () => {
      mockApi.post.mockResolvedValue({
        data: { reply: 'AI response', tokensUsed: 100 },
      });
      mockGetChatSession.mockReturnValue({ messages: [] });

      const { result } = renderHook(() => useAIChat());
      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockCreateChatSession).toHaveBeenCalled();
      expect(mockAddMessage).toHaveBeenCalledTimes(2); // user + AI
    });

    it('uses existing chat session', async () => {
      mockAIStore.getState().currentChatId = 'chat_123';
      mockGetChatSession.mockReturnValue({ messages: [] });
      mockApi.post.mockResolvedValue({
        data: { reply: 'AI response', tokensUsed: 50 },
      });

      const { result } = renderHook(() => useAIChat());
      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockCreateChatSession).not.toHaveBeenCalled();
      expect(mockAddMessage).toHaveBeenCalledTimes(2);
    });

    it('handles API errors', async () => {
      mockApi.post.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useAIChat());
      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'API Error',
      });
    });

    it('handles quota exceeded error', async () => {
      const error = new Error('Quota exceeded');
      (error as any).response = { data: { message: 'Monthly limit reached' } };
      mockApi.post.mockRejectedValue(error);

      const { result } = renderHook(() => useAIChat());
      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'quota_exceeded',
        message: 'Monthly limit reached',
        action: expect.any(Object),
      });
    });
  });

  describe('createSession', () => {
    it('creates and sets new chat session', () => {
      const { result } = renderHook(() => useAIChat());
      const sessionId = result.current.createSession();

      expect(sessionId).toMatch(/^chat_\d+_[a-z0-9]+$/);
      expect(mockSetCurrentChat).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('setCurrentSession', () => {
    it('sets current chat session', () => {
      const { result } = renderHook(() => useAIChat());
      act(() => {
        result.current.setCurrentSession('chat_456');
      });

      expect(mockSetCurrentChat).toHaveBeenCalledWith('chat_456');
    });
  });

  describe('getSession', () => {
    it('returns chat session', () => {
      const mockSession = { id: 'chat_123', messages: [] };
      mockGetChatSession.mockReturnValue(mockSession);

      const { result } = renderHook(() => useAIChat());
      const session = result.current.getSession('chat_123');

      expect(session).toEqual(mockSession);
    });

    it('returns undefined for non-existent session', () => {
      mockGetChatSession.mockReturnValue(undefined);

      const { result } = renderHook(() => useAIChat());
      const session = result.current.getSession('non_existent');

      expect(session).toBeUndefined();
    });
  });

  describe('deleteSession', () => {
    it('deletes chat session', () => {
      mockAIStore.getState().currentChatId = 'chat_123';
      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.deleteSession('chat_123');
      });

      expect(mockAIStore.getState().deleteChatSession).toHaveBeenCalledWith('chat_123');
      expect(result.current.currentChatId).toBeNull();
    });
  });
});