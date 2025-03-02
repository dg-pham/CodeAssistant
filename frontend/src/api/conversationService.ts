import api from './axios-config';
import {
  Conversation,
  ConversationCreate,
  ConversationResponse,
  ConversationUpdate,
  ConversationWithMessages,
  Message,
  MessageCreate,
  MessageResponse
} from '@/types';

const conversationService = {
  // Create a new conversation
  createConversation: async (conversationData: ConversationCreate): Promise<ConversationResponse> => {
    const response = await api.post<ConversationResponse>('/conversations', conversationData);
    return response.data;
  },

  // Get a conversation by ID
  getConversation: async (conversationId: string): Promise<ConversationResponse> => {
    const response = await api.get<ConversationResponse>(`/conversations/${conversationId}`);
    return response.data;
  },

  // Get all conversations for a user
  getUserConversations: async (userId: string): Promise<ConversationResponse[]> => {
    const response = await api.get<ConversationResponse[]>(`/users/${userId}/conversations`);
    return response.data;
  },

  // Update conversation (e.g., title)
  updateConversation: async (conversationId: string, data: ConversationUpdate): Promise<ConversationResponse> => {
    const response = await api.put<ConversationResponse>(`/conversations/${conversationId}`, data);
    return response.data;
  },

  // Get conversation with messages
  getConversationWithMessages: async (conversationId: string, limit: number = 50): Promise<ConversationWithMessages> => {
    const response = await api.get<ConversationWithMessages>(`/conversations/${conversationId}/with-messages?limit=${limit}`);
    return response.data;
  },

  // Get conversation message history
  getConversationHistory: async (conversationId: string, limit: number = 50): Promise<MessageResponse[]> => {
    const response = await api.get<MessageResponse[]>(`/conversations/${conversationId}/history?limit=${limit}`);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/conversations/${conversationId}`);
    return response.data;
  }
};

export const messageService = {
  // No direct endpoint to add a message in the API,
  // but the AI service will add messages to the conversation

  // This is a helper to add a local message (for optimistic UI updates)
  addLocalMessage: (message: MessageCreate): Message => {
    return {
      id: `local-${Date.now()}`,
      conversation_id: message.conversation_id,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString()
    };
  }
};

export default conversationService;