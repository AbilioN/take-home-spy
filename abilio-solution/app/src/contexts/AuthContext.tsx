import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@user_id';
const DEBUG = true;

type AuthContextType = {
  userId: string | null;
  isLoading: boolean;
  setUserId: (id: string) => Promise<void>;
  clearUserId: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (DEBUG) console.log('[AuthProvider] mount, reading AsyncStorage…');
    (async () => {
      try {
        const id = await AsyncStorage.getItem(USER_ID_KEY);
        if (DEBUG) console.log('[AuthProvider] AsyncStorage got', id ? 'userId' : 'null');
        if (!cancelled) setUserIdState(id ?? null);
      } catch (e) {
        if (DEBUG) console.warn('[AuthProvider] AsyncStorage error', e);
        // ignore; userId stays null
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setUserId = useCallback(async (id: string) => {
    await AsyncStorage.setItem(USER_ID_KEY, id);
    setUserIdState(id);
  }, []);

  const clearUserId = useCallback(async () => {
    await AsyncStorage.removeItem(USER_ID_KEY);
    setUserIdState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ userId, isLoading, setUserId, clearUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
