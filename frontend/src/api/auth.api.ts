import client from './client';
import { User } from '../types/api';

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    client.post<{ data: User }>('/auth/register', data).then(r => r.data.data),

  login: (data: { email: string; password: string }) =>
    client.post<{ data: User }>('/auth/login', data).then(r => r.data.data),

  logout: () => client.post('/auth/logout'),

  me: () => client.get<{ data: User }>('/auth/me').then(r => r.data.data),
};
