import { FeedbackCreate, FeedbackResponse } from '../types';
import { apiClient } from './apiClient';

export const feedbackApi = {
  submitFeedback: async (feedback: FeedbackCreate): Promise<{ feedback_id: string }> => {
    return await apiClient.post<{ feedback_id: string }>('/feedback', feedback);
  },

  getFeedback: async (feedbackId: string): Promise<FeedbackResponse> => {
    return await apiClient.get<FeedbackResponse>(`/feedback/${feedbackId}`);
  },

  getMessageFeedback: async (messageId: string): Promise<FeedbackResponse[]> => {
    return await apiClient.get<FeedbackResponse[]>(`/messages/${messageId}/feedback`);
  },

  getConversationRating: async (conversationId: string): Promise<{ conversation_id: string; average_rating: number }> => {
    return await apiClient.get<{ conversation_id: string; average_rating: number }>(
      `/conversations/${conversationId}/rating`
    );
  },
};