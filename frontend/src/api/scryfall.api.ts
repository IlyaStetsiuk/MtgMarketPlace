import client from './client';
import { ScryfallCard } from '../types/api';

export const scryfallApi = {
  search: (q: string, page = 1) =>
    client.get<{ data: ScryfallCard[]; total: number; hasMore: boolean }>('/scryfall/search', { params: { q, page } }).then(r => r.data),

  autocomplete: (q: string) =>
    client.get<{ data: string[] }>('/scryfall/autocomplete', { params: { q } }).then(r => r.data.data),

  getById: (id: string) =>
    client.get<{ data: ScryfallCard }>(`/scryfall/cards/${id}`).then(r => r.data.data),

  getByName: (name: string) =>
    client.get<{ data: ScryfallCard }>('/scryfall/cards/named', { params: { name } }).then(r => r.data.data),
};
