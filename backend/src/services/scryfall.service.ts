import axios from 'axios';
import { LRUCache } from 'lru-cache';

const BASE = 'https://api.scryfall.com';

const cache = new LRUCache<string, object>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

async function get<T extends object>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached) return cached as T;

  const { data } = await axios.get<T>(`${BASE}${path}`, {
    headers: { 'User-Agent': 'MTGMarketplace/1.0' },
  });
  cache.set(path, data);
  return data;
}

export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
  };
  card_faces?: Array<{
    name: string;
    image_uris?: { small: string; normal: string; large: string };
  }>;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  rarity: string;
  prices?: { usd?: string; usd_foil?: string };
  released_at: string;
}

interface ScryfallSearchResult {
  data: ScryfallCard[];
  total_cards: number;
  has_more: boolean;
  next_page?: string;
}

interface ScryfallAutocomplete {
  data: string[];
}

export async function searchCards(query: string, page = 1): Promise<ScryfallSearchResult> {
  return get<ScryfallSearchResult>(
    `/cards/search?q=${encodeURIComponent(query)}&order=name&unique=cards&page=${page}`,
  );
}

export async function autocomplete(query: string): Promise<string[]> {
  const result = await get<ScryfallAutocomplete>(
    `/cards/autocomplete?q=${encodeURIComponent(query)}`,
  );
  return result.data;
}

export async function getCardById(id: string): Promise<ScryfallCard> {
  return get<ScryfallCard>(`/cards/${id}`);
}

export async function getCardByName(name: string): Promise<ScryfallCard> {
  return get<ScryfallCard>(`/cards/named?exact=${encodeURIComponent(name)}`);
}

export function getCardImageUri(card: ScryfallCard): string {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  return '';
}
