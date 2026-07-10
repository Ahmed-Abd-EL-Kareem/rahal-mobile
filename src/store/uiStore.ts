// src/store/uiStore.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'quota_exceeded';
  message: string;
  action?: { label: string; onPress: () => void };
}

interface UIState {
  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Side menu
  isSideMenuOpen: boolean;
  toggleSideMenu: () => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  
  // RTL
  isRTL: boolean;
  setLanguage: (lang: 'en' | 'ar') => void;
  
  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  
  isSideMenuOpen: false,
  toggleSideMenu: () => set((state) => ({ isSideMenuOpen: !state.isSideMenuOpen })),
  
  toasts: [],
  showToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
  })),
  hideToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
  
  isRTL: false,
  setLanguage: (lang) => set({ isRTL: lang === 'ar' }),
  
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));