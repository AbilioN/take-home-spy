import { apiClient } from './client';

export interface PostLocationBody {
  userId: string;
  latitude: number;
  longitude: number;
}

const DEBUG = __DEV__;

export async function postLocation(body: PostLocationBody) {
  if (DEBUG) {
    console.log('[postLocation] POST /locations', { userId: body.userId.slice(0, 8) + '…', latitude: body.latitude, longitude: body.longitude });
  }
  const { data } = await apiClient.post('/locations', body);
  if (DEBUG) console.log('[postLocation] OK', data);
  return data;
}

export async function getLastLocation(userId: string) {
  const { data } = await apiClient.get(`/users/${userId}/last-location`);
  return data;
}
