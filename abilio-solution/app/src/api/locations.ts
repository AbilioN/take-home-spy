import { apiClient } from './client';

export interface PostLocationBody {
  userId: string;
  latitude: number;
  longitude: number;
}

export async function postLocation(body: PostLocationBody) {
  const { data } = await apiClient.post('/locations', body);
  return data;
}

export async function getLastLocation(userId: string) {
  const { data } = await apiClient.get(`/users/${userId}/last-location`);
  return data;
}
