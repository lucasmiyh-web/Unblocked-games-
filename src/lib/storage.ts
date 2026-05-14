
// Robust localStorage wrapper for restricted environments (like school computers)
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getStorage: () => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const storage = window.localStorage;
        if (storage) {
          // Double check with a test write
          const testKey = '__storage_test__';
          storage.setItem(testKey, testKey);
          storage.removeItem(testKey);
          return storage;
        }
      }
    } catch (e) {
      // Storage is blocked or restricted
    }
    return null;
  },
  getItem: (key: string): string | null => {
    const storage = safeStorage.getStorage();
    if (!storage) return memoryStorage[key] || null;
    try {
      return storage.getItem(key);
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    const storage = safeStorage.getStorage();
    if (!storage) {
      memoryStorage[key] = value;
      return;
    }
    try {
      storage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    const storage = safeStorage.getStorage();
    if (!storage) {
      delete memoryStorage[key];
      return;
    }
    try {
      storage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  }
};
