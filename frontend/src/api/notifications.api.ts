import client from './client';
import { Notification } from '../types/api';

export const notificationsApi = {
  getAll: async (): Promise<{ data: Notification[]; unreadCount: number }> => {
    const { data } = await client.get<{ data: Notification[]; unreadCount: number }>('/notifications');
    return data;
  },

  markRead: async (id: string): Promise<void> => {
    await client.put(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await client.put('/notifications/read-all');
  },
};
