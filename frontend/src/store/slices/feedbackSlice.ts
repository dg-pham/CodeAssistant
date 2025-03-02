import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Feedback, FeedbackCreate } from '@/types';
import { feedbackService } from '@/api';

interface FeedbackState {
  feedbacks: { [messageId: string]: Feedback[] };
  conversationRatings: { [conversationId: string]: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  feedbacks: {},
  conversationRatings: {},
  isLoading: false,
  error: null
};

// Async thunks
export const submitFeedback = createAsyncThunk(
  'feedback/submitFeedback',
  async (feedbackData: FeedbackCreate, { rejectWithValue }) => {
    try {
      return await feedbackService.submitFeedback(feedbackData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const getMessageFeedback = createAsyncThunk(
  'feedback/getMessageFeedback',
  async (messageId: string, { rejectWithValue }) => {
    try {
      const feedbacks = await feedbackService.getMessageFeedback(messageId);
      return { messageId, feedbacks };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get message feedback');
    }
  }
);

export const getConversationRating = createAsyncThunk(
  'feedback/getConversationRating',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await feedbackService.getConversationRating(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get conversation rating');
    }
  }
);

// Feedback slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearFeedbacks: (state) => {
      state.feedbacks = {};
      state.conversationRatings = {};
    }
  },
  extraReducers: (builder) => {
    // Handle submit feedback
    builder.addCase(submitFeedback.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(submitFeedback.fulfilled, (state) => {
      state.isLoading = false;
      // Note: We don't update the state here as we don't get back the feedback object
      // Instead, we'll reload the feedbacks after submission if needed
    });
    builder.addCase(submitFeedback.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get message feedback
    builder.addCase(getMessageFeedback.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMessageFeedback.fulfilled, (state, action) => {
      state.isLoading = false;
      const { messageId, feedbacks } = action.payload;
      state.feedbacks[messageId] = feedbacks;
    });
    builder.addCase(getMessageFeedback.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get conversation rating
    builder.addCase(getConversationRating.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getConversationRating.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversationRatings[action.payload.conversation_id] = action.payload.average_rating;
    });
    builder.addCase(getConversationRating.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearFeedbacks } = feedbackSlice.actions;
export default feedbackSlice.reducer;