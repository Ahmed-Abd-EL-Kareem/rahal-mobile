// src/store/mmkvStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Synchronous in-memory cache backed by AsyncStorage for full Expo Go & Standalone compatibility
const cache = new Map<string, string>();

// Pre-hydrate cache from AsyncStorage
AsyncStorage.getAllKeys()
  .then((keys) => AsyncStorage.multiGet(keys))
  .then((pairs) => {
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        cache.set(key, value);
      }
    });
  })
  .catch(() => {
    // Non-fatal fallback to in-memory store
  });

export const storage = {
  getString: (key: string): string | undefined => {
    return cache.get(key);
  },
  set: (key: string, value: string | boolean | number): void => {
    const str = String(value);
    cache.set(key, str);
    AsyncStorage.setItem(key, str).catch(() => {});
  },
  remove: (key: string): void => {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch(() => {});
  },
  getAllKeys: (): string[] => {
    return Array.from(cache.keys());
  },
  clearAll: (): void => {
    cache.clear();
    AsyncStorage.clear().catch(() => {});
  },
};

export interface MMKVStore {
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