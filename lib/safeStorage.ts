import { Platform } from 'react-native';

/**
 * In-memory fallback storage when native AsyncStorage or localStorage is unavailable/null.
 */
const memoryStorage = new Map<string, string>();

/**
 * Safely get the AsyncStorage instance without throwing top-level Native Module null errors.
 */
const getAsyncStorage = () => {
  try {
    // Dynamic require prevents top-level bundle crashes on load
    const AsyncStorageModule = require('@react-native-async-storage/async-storage');
    const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
    return AsyncStorage || null;
  } catch (e) {
    return null;
  }
};

/**
 * Cross-platform, crash-proof storage wrapper.
 * Guarantees zero uncaught errors on Web, Mobile Native, or Expo Go.
 */
export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    // 1. Web / Browser localStorage check
    if (Platform.OS === 'web' || (typeof window !== 'undefined' && window.localStorage)) {
      try {
        if (window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {}
    }

    // 2. React Native AsyncStorage check
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.getItem === 'function') {
        const val = await storage.getItem(key);
        if (val !== undefined && val !== null) {
          return val;
        }
      }
    } catch (e) {
      // Native module is null or legacy storage error safely caught
    }

    // 3. Fallback memory storage
    return memoryStorage.get(key) ?? null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    // 1. Web / Browser localStorage check
    if (Platform.OS === 'web' || (typeof window !== 'undefined' && window.localStorage)) {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch {}
    }

    // 2. React Native AsyncStorage check
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.setItem === 'function') {
        await storage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Native module is null or legacy storage error safely caught
    }

    // 3. Fallback memory storage
    memoryStorage.set(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    // 1. Web / Browser localStorage check
    if (Platform.OS === 'web' || (typeof window !== 'undefined' && window.localStorage)) {
      try {
        if (window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch {}
    }

    // 2. React Native AsyncStorage check
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.removeItem === 'function') {
        await storage.removeItem(key);
        return;
      }
    } catch (e) {
      // Native module is null or legacy storage error safely caught
    }

    // 3. Fallback memory storage
    memoryStorage.delete(key);
  },
};
