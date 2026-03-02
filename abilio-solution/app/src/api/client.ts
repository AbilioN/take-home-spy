import axios from 'axios';
import { API_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const ax = error as { response?: { data?: unknown }; message?: string; code?: string };
    if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
      return 'Cannot reach server. On a physical device, set EXPO_PUBLIC_API_URL to your computer’s IP (e.g. http://192.168.1.x:3000).';
    }
    const data = ax.response?.data;
    if (data && typeof data === 'object' && Array.isArray((data as { message?: unknown }).message)) {
      return ((data as { message: string[] }).message).join(', ') || 'Request failed';
    }
    const msg =
      (data && typeof data === 'object' && (data as { message?: string }).message) ||
      (typeof data === 'string' ? data : null) ||
      ax.message ||
      'Request failed';
    return typeof msg === 'string' ? msg : 'Request failed';
  }
  return error instanceof Error ? error.message : 'Request failed';
}

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__ && response.config.url) {
      console.log('[apiClient]', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (__DEV__ && error?.config) {
      console.warn('[apiClient] failed', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });
    }
    return Promise.reject(new Error(getErrorMessage(error)));
  }
);
