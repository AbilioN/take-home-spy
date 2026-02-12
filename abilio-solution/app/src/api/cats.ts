import axios from 'axios';
import { CAT_API_KEY } from '../config/env';

const CAT_API = 'https://api.thecatapi.com/v1';

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export async function fetchCats(limit = 10): Promise<CatImage[]> {
  const { data } = await axios.get<CatImage[]>(`${CAT_API}/images/search`, {
    params: { limit, size: 'small' },
    headers: CAT_API_KEY ? { 'x-api-key': CAT_API_KEY } : {},
  });
  return data;
}
