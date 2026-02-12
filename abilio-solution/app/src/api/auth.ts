import { apiClient } from './client';

export interface RegisterBody {
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  success: true;
  userId: string;
}

export async function register(body: RegisterBody): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/users/register', body);
  return data;
}

export async function login(body: LoginBody): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/users/login', body);
  return data;
}
