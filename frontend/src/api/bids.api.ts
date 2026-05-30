import client from './client';
import { Bid } from '../types/api';

export const bidsApi = {
  place: (auctionId: string, amount: number) =>
    client.post<{ data: { bid: Bid; auction: { currentBid: number; endsAt: string } } }>('/bids', { auctionId, amount }).then(r => r.data.data),

  getForAuction: (auctionId: string) =>
    client.get<{ data: Bid[] }>(`/bids/auction/${auctionId}`).then(r => r.data.data),

  getMine: () =>
    client.get<{ data: Bid[] }>('/bids/mine').then(r => r.data.data),
};
