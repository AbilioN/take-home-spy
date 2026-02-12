import axios from 'axios';
import { API_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: clear session, redirect to login
    }
    const data = error.response?.data;
    const message =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' ? data : null) ||
      error.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  }
);
