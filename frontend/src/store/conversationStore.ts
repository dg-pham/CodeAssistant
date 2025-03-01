import { create } from 'zustand';
import {
  ConversationCreate,
  ConversationResponse,
  MessageResponse,
  ConversationUpdate
} from '../types';
import { conversationApi } from '../api';
import { useUserStore } from './userStore';

interface ConversationState {
  conversations: ConversationResponse[];
  currentConversation: ConversationResponse | null;
  currentMessages: MessageResponse[];
  isLoading: boolean;
  error: string | null;

  // Conversation operations
  createConversation: (title?: string) => Promise<ConversationResponse>;
  getConversation: (conversationId: string) => Promise<ConversationResponse>;
  getUserConversations: () => Promise<ConversationResponse[]>;
  updateConversation: (conversationId: string, data: ConversationUpdate) => Promise<ConversationResponse>;
  setCurrentConversation: (conversation: ConversationResponse | null) => void;

  // Message operations
  getConversationHistory: (conversationId: string, limit?: number) => Promise<MessageResponse[]>;
  getConversationWithMessages: (conversationId: string, limit?: number) => Promise<void>;
  setCurrentMessages: (messages: MessageResponse[]) => void;

  // Clear state
  clearState: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  isLoading: false,
  error: null,

  // Conversation operations
  createConversation: async (title = 'New Conversation') => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const data: ConversationCreate = {
        user_id: currentUser.id,
        title,
      };

      const conversation = await conversationApi.createConversation(data);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        isLoading: false,
      }));
      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationApi.getConversation(conversationId);
      set({ currentConversation: conversation, isLoading: false });
      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get conversation';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getUserConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const conversations = await conversationApi.getUserConversations(currentUser.id);
      set({ conversations, isLoading: false });
      return conversations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user conversations';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateConversation: async (conversationId: string, data: ConversationUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationApi.updateConversation(conversationId, data);

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? conversation : c
        ),
        currentConversation: state.currentConversation?.id === conversationId
          ? conversation
          : state.currentConversation,
        isLoading: false,
      }));

      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update conversation';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  // Message operations
  getConversationHistory: async (conversationId: string, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await conversationApi.getConversationHistory(conversationId, limit);
      set({ currentMessages: messages, isLoading: false });
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get conversation history';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getConversationWithMessages: async (conversationId: string, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const result = await conversationApi.getConversationWithMessages(conversationId, limit);
      set({
        currentConversation: {
          id: result.id,
          user_id: result.user_id,
          title: result.title,
        },
        currentMessages: result.messages,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get conversation with messages';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  setCurrentMessages: (messages) => {
    set({ currentMessages: messages });
  },

  // Clear state
  clearState: () => {
    set({
      conversations: [],
      currentConversation: null,
      currentMessages: [],
      error: null,
    });
  },
}));