import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@user_id';

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let id = await AsyncStorage.getItem(USER_ID_KEY);
      if (!id) {
        id = uuid();
        await AsyncStorage.setItem(USER_ID_KEY, id);
      }
      setUserId(id);
    })();
  }, []);

  return userId;
}
