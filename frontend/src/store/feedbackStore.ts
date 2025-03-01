import { create } from 'zustand';
import { FeedbackCreate, FeedbackResponse } from '../types';
import { feedbackApi } from '../api';

interface FeedbackState {
  feedbacks: FeedbackResponse[];
  currentFeedback: FeedbackResponse | null;
  averageRating: number | null;
  isLoading: boolean;
  error: string | null;

  submitFeedback: (feedback: FeedbackCreate) => Promise<string>;
  getFeedback: (feedbackId: string) => Promise<FeedbackResponse>;
  getMessageFeedback: (messageId: string) => Promise<FeedbackResponse[]>;
  getConversationRating: (conversationId: string) => Promise<number>;

  setCurrentFeedback: (feedback: FeedbackResponse | null) => void;
  clearState: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: [],
  currentFeedback: null,
  averageRating: null,
  isLoading: false,
  error: null,

  submitFeedback: async (feedback: FeedbackCreate) => {
    set({ isLoading: true, error: null });
    try {
      const result = await feedbackApi.submitFeedback(feedback);

      // Get the created feedback details
      if (result.feedback_id) {
        const feedbackDetails = await feedbackApi.getFeedback(result.feedback_id);
        set((state) => ({
          feedbacks: [feedbackDetails, ...state.feedbacks],
          currentFeedback: feedbackDetails,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }

      return result.feedback_id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getFeedback: async (feedbackId: string) => {
    set({ isLoading: true, error: null });
    try {
      const feedback = await feedbackApi.getFeedback(feedbackId);
      set({ currentFeedback: feedback, isLoading: false });
      return feedback;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get feedback';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getMessageFeedback: async (messageId: string) => {
    set({ isLoading: true, error: null });
    try {
      const feedbacks = await feedbackApi.getMessageFeedback(messageId);
      set({ feedbacks, isLoading: false });
      return feedbacks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get message feedback';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getConversationRating: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await feedbackApi.getConversationRating(conversationId);
      set({ averageRating: result.average_rating, isLoading: false });
      return result.average_rating;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get conversation rating';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  setCurrentFeedback: (feedback) => {
    set({ currentFeedback: feedback });
  },

  clearState: () => {
    set({
      feedbacks: [],
      currentFeedback: null,
      averageRating: null,
      error: null,
    });
  },
}));