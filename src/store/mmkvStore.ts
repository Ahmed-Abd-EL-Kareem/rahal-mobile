// src/store/mmkvStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache to support synchronous reads/writes like MMKV
const cache = new Map<string, string>();
let isInitialized = false;

const initCache = async () => {
  if (isInitialized) return;
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [key, value] of pairs) {
      if (value !== null) {
        cache.set(key, value);
      }
    }
  } catch (error) {
    console.error('Failed to initialize AsyncStorage cache:', error);
  }
  isInitialized = true;
};

// Start pre-populating the cache immediately
initCache();

interface MMKVStore {
  getString: (key: string) => string | undefined;
  setString: (key: string, value: string) => void;
  delete: (key: string) => void;
  getAllKeys: () => string[];
  clearAll: () => void;
}

export const useMMKVStore = {
  getState: (): MMKVStore => ({
    getString: (key: string): string | undefined => {
      return cache.get(key);
    },
    setString: (key: string, value: string): void => {
      cache.set(key, value);
      AsyncStorage.setItem(key, value).catch(err =>
        console.error('AsyncStorage setItem error:', err)
      );
    },
    delete: (key: string): void => {
      cache.delete(key);
      AsyncStorage.removeItem(key).catch(err =>
        console.error('AsyncStorage removeItem error:', err)
      );
    },
    getAllKeys: (): string[] => {
      return Array.from(cache.keys());
    },
    clearAll: (): void => {
      cache.clear();
      AsyncStorage.clear().catch(err =>
        console.error('AsyncStorage clear error:', err)
      );
    },
  }),
};