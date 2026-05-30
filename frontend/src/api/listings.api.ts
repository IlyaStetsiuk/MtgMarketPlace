import client from './client';
import { Listing, PaginatedResponse } from '../types/api';

export interface ListingFilters {
  q?: string;
  condition?: string;
  setCode?: string;
  isFoil?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export interface CreateListingData {
  scryfallId: string;
  cardName: string;
  setCode: string;
  setName: string;
  imageUri: string;
  lang?: string;
  condition: string;
  isFoil?: boolean;
  price: number;
  quantity?: number;
  description?: string;
}

export const listingsApi = {
  getAll: (filters?: ListingFilters) =>
    client.get<PaginatedResponse<Listing>>('/listings', { params: filters }).then(r => r.data),

  getOne: (id: string) =>
    client.get<{ data: Listing }>(`/listings/${id}`).then(r => r.data.data),

  getMine: () =>
    client.get<{ data: Listing[] }>('/listings/mine').then(r => r.data.data),

  create: (data: CreateListingData) =>
    client.post<{ data: Listing }>('/listings', data).then(r => r.data.data),

  remove: (id: string) =>
    client.delete(`/listings/${id}`),
};
