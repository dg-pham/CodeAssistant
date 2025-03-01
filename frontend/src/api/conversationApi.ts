import {
  ConversationCreate,
  ConversationResponse,
  ConversationUpdate,
  ConversationWithMessagesResponse,
  MessageResponse
} from '../types';
import { apiClient } from './apiClient';

export const conversationApi = {
  createConversation: async (data: ConversationCreate): Promise<ConversationResponse> => {
    return await apiClient.post<ConversationResponse>('/conversations', data);
  },

  getConversation: async (conversationId: string): Promise<ConversationResponse> => {
    return await apiClient.get<ConversationResponse>(`/conversations/${conversationId}`);
  },

  getUserConversations: async (userId: string): Promise<ConversationResponse[]> => {
    return await apiClient.get<ConversationResponse[]>(`/users/${userId}/conversations`);
  },

  getConversationHistory: async (conversationId: string, limit: number = 50): Promise<MessageResponse[]> => {
    return await apiClient.get<MessageResponse[]>(
      `/conversations/${conversationId}/history`,
      { params: { limit } }
    );
  },

  getConversationWithMessages: async (conversationId: string, limit: number = 50): Promise<ConversationWithMessagesResponse> => {
    return await apiClient.get<ConversationWithMessagesResponse>(
      `/conversations/${conversationId}/with-messages`,
      { params: { limit } }
    );
  },

  updateConversation: async (conversationId: string, data: ConversationUpdate): Promise<ConversationResponse> => {
    return await apiClient.put<ConversationResponse>(`/conversations/${conversationId}`, data);
  },
};