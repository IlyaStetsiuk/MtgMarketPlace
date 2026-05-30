import client from './client';
import { Conversation, Message } from '../types/api';

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await client.get<{ data: Conversation[] }>('/conversations');
    return data.data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const { data } = await client.get<{ data: Conversation }>(`/conversations/${id}`);
    return data.data;
  },

  startConversation: async (body: {
    otherUserId: string;
    auctionId?: string;
    listingId?: string;
    message?: string;
  }): Promise<Conversation> => {
    const { data } = await client.post<{ data: Conversation }>('/conversations', body);
    return data.data;
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const { data } = await client.post<{ data: Message }>(`/conversations/${conversationId}/messages`, { content });
    return data.data;
  },
};
