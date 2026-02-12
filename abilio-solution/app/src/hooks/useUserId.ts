import { useAuth } from '../contexts/AuthContext';

export function useUserId() {
  const { userId } = useAuth();
  return userId;
}
