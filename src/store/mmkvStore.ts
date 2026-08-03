// src/store/mmkvStore.ts
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'rahal-storage' });

interface MMKVStore {
  getString: (key: string) => string | undefined;
  setString: (key: string, value: string) => void;
  delete: (key: string) => void;
  getAllKeys: () => string[];
  clearAll: () => void;
}

export const useMMKVStore = {
  getState: (): MMKVStore => ({
    getString: (key: string): string | undefined => storage.getString(key),
    setString: (key: string, value: string): void => storage.set(key, value),
    delete: (key: string): void => { storage.remove(key); },
    getAllKeys: (): string[] => storage.getAllKeys(),
    clearAll: (): void => storage.clearAll(),
  }),
};