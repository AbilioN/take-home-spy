import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@user_id';

type AuthContextType = {
  userId: string | null;
  isLoading: boolean;
  setUserId: (id: string) => Promise<void>;
  clearUserId: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem(USER_ID_KEY);
      setUserIdState(id ?? null);
      setIsLoading(false);
    })();
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
