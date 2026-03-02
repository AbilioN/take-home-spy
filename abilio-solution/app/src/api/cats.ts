import axios, { type AxiosError } from 'axios';
import { CAT_API_KEY } from '../config/env';

const CAT_API = 'https://api.thecatapi.com/v1';
const DEBUG = true;

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface CatProfile {
  id: string;
  imageUrl: string;
  name: string;
  age: number;
  description: string;
}

const NAMES = ['Whiskers', 'Luna', 'Milo', 'Shadow', 'Simba', 'Oliver', 'Nala', 'Chloe'];
const TRAITS = [
  'Loves cuddles and naps.',
  'Very playful and energetic.',
  'Shy but extremely sweet.',
  'Loves chasing laser pointers.',
  'Curious and adventurous.',
  'Calm and loves sunbeams.',
  'Chatty and affectionate.',
  'Independent but loyal.',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toProfile(cat: CatImage): CatProfile {
  return {
    id: cat.id,
    imageUrl: cat.url,
    name: randomItem(NAMES),
    age: Math.floor(Math.random() * 12) + 1,
    description: randomItem(TRAITS),
  };
}

export async function fetchCats(limit = 10): Promise<CatImage[]> {
  const { data } = await axios.get<CatImage[]>(`${CAT_API}/images/search`, {
    params: { limit, size: 'small' },
    headers: buildCatHeaders(),
  });
  return data;
}

const REQUEST_TIMEOUT_MS = 20_000;

function buildCatHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  const key = (CAT_API_KEY ?? '').trim();
  if (key) headers['x-api-key'] = key;
  return headers;
}

/** Fallback when The Cat API is unreachable (timeout/network). */
function fallbackCatProfile(): CatProfile {
  const fallbackImages = [
    'https://cdn.thecatapi.com/images/0XYvRd7oD.jpg',
    'https://cdn.thecatapi.com/images/1oq3sxKqo.jpg',
    'https://cdn.thecatapi.com/images/2l8RjYqjU.jpg',
  ];
  const url = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  return {
    id: 'fallback-' + Math.random().toString(36).slice(2, 9),
    imageUrl: url,
    name: randomItem(NAMES),
    age: Math.floor(Math.random() * 12) + 1,
    description: randomItem(TRAITS),
  };
}

export async function fetchRandomCatProfile(): Promise<CatProfile> {
  const url = `${CAT_API}/images/search`;
  const headers = buildCatHeaders();
  if (DEBUG) {
    console.log('[cats API] request', {
      url,
      hasApiKey: !!headers['x-api-key'],
      headerKeys: Object.keys(headers),
    });
  }
  try {
    const { data } = await axios.get<CatImage[]>(url, {
      params: { limit: 1, size: 'med', mime_types: 'jpg' },
      headers,
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    if (!data?.[0]) throw new Error('No cat image');
    const profile = toProfile(data[0]);
    if (DEBUG) console.log('[cats API] fetchRandomCatProfile success', profile.name);
    return profile;
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    if (DEBUG) {
      const msg = (err as Error)?.message ?? '';
      const status = err.response?.status;
      const body = err.response?.data;
      console.log('[cats API] fetchRandomCatProfile error', {
        message: msg,
        status,
        body: body ? JSON.stringify(body).slice(0, 200) : undefined,
      });
    }
    if (err.code === 'ECONNABORTED' || /timeout/i.test(String((err as Error)?.message))) {
      if (DEBUG) console.log('[cats API] using fallback cat after timeout');
      return fallbackCatProfile();
    }
    throw e;
  }
}
