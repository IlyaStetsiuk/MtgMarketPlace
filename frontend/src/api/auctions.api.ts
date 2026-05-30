import client from './client';
import { Auction, PaginatedResponse } from '../types/api';

export interface AuctionFilters {
  q?: string;
  condition?: string;
  setCode?: string;
  isFoil?: boolean;
  minPrice?: number;
  maxPrice?: number;
  status?: 'ACTIVE' | 'ENDED';
  page?: number;
  limit?: number;
  sort?: 'ending_soon' | 'newest' | 'price_asc' | 'price_desc';
}

export interface CreateAuctionData {
  scryfallId: string;
  cardName: string;
  setCode: string;
  setName: string;
  imageUri: string;
  lang?: string;
  condition: string;
  isFoil?: boolean;
  description?: string;
  startingPrice: number;
  reservePrice?: number;
  buyItNowPrice?: number;
  endsAt: string;
  extendMinutes?: number;
}

export const auctionsApi = {
  getAll: (filters?: AuctionFilters) =>
    client.get<PaginatedResponse<Auction>>('/auctions', { params: filters }).then(r => r.data),

  getOne: (id: string) =>
    client.get<{ data: Auction }>(`/auctions/${id}`).then(r => r.data.data),

  getMine: () =>
    client.get<{ data: Auction[] }>('/auctions/mine').then(r => r.data.data),

  create: (data: CreateAuctionData) =>
    client.post<{ data: Auction }>('/auctions', data).then(r => r.data.data),

  cancel: (id: string) =>
    client.delete(`/auctions/${id}`),
};
