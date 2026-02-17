import axios from 'axios';
import { CAT_API_KEY } from '../config/env';

const CAT_API = 'https://api.thecatapi.com/v1';

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
    headers: CAT_API_KEY ? { 'x-api-key': CAT_API_KEY } : {},
  });
  return data;
}

const DEBUG = true;
const REQUEST_TIMEOUT_MS = 15_000;

export async function fetchRandomCatProfile(): Promise<CatProfile> {
  if (DEBUG) console.log('[cats API] fetchRandomCatProfile start');
  try {
    const { data } = await axios.get<CatImage[]>(`${CAT_API}/images/search`, {
      params: { limit: 1 },
      headers: CAT_API_KEY ? { 'x-api-key': CAT_API_KEY } : {},
      timeout: REQUEST_TIMEOUT_MS,
    });
    if (!data?.[0]) throw new Error('No cat image');
    const profile = toProfile(data[0]);
    if (DEBUG) console.log('[cats API] fetchRandomCatProfile success', profile.name);
    return profile;
  } catch (e) {
    if (DEBUG) console.log('[cats API] fetchRandomCatProfile error', (e as Error)?.message ?? e);
    throw e;
  }
}
