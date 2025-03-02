import api from './axios-config';
import { FeedbackCreate, Feedback, FeedbackResponse } from '@/types';

const feedbackService = {
  // Submit feedback for a message
  submitFeedback: async (feedbackData: FeedbackCreate): Promise<{feedback_id: string, status: string}> => {
  try {
    const response = await api.post<{feedback_id: string, status: string}>('/feedback', feedbackData);
    console.log('Feedback API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Feedback API error:', error);
    throw error;
  }
},

  // Get feedback by ID
  getFeedback: async (feedbackId: string): Promise<FeedbackResponse> => {
    const response = await api.get<FeedbackResponse>(`/feedback/${feedbackId}`);
    return response.data;
  },

  // Get all feedback for a message
  getMessageFeedback: async (messageId: string): Promise<FeedbackResponse[]> => {
    const response = await api.get<FeedbackResponse[]>(`/messages/${messageId}/feedback`);
    return response.data;
  },

  // Get average rating for a conversation
  getConversationRating: async (conversationId: string): Promise<{conversation_id: string, average_rating: number}> => {
    const response = await api.get<{conversation_id: string, average_rating: number}>(`/conversations/${conversationId}/rating`);
    return response.data;
  }
};

export default feedbackService;