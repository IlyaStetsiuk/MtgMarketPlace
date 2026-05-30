import client from './client';
import { Review } from '../types/api';

export const reviewsApi = {
  getForUser: (userId: string) =>
    client.get<{ data: Review[] }>(`/reviews/user/${userId}`).then(r => r.data.data),

  create: (data: { targetId: string; rating: number; comment?: string }) =>
    client.post<{ data: Review }>('/reviews', data).then(r => r.data.data),
};
