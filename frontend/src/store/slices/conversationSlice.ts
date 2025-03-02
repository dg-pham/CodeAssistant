import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, ConversationCreate, ConversationUpdate, Message, MessageCreate } from '@/types';
import { conversationService, messageService } from '@/api';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null
};

// Async thunks
export const createConversation = createAsyncThunk(
  'conversation/createConversation',
  async (conversationData: ConversationCreate, { rejectWithValue }) => {
    try {
      return await conversationService.createConversation(conversationData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

export const getConversation = createAsyncThunk(
  'conversation/getConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await conversationService.getConversation(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get conversation');
    }
  }
);

export const getUserConversations = createAsyncThunk(
  'conversation/getUserConversations',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await conversationService.getUserConversations(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user conversations');
    }
  }
);

export const updateConversation = createAsyncThunk(
  'conversation/updateConversation',
  async ({ id, data }: { id: string; data: ConversationUpdate }, { rejectWithValue }) => {
    try {
      return await conversationService.updateConversation(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update conversation');
    }
  }
);

export const getConversationHistory = createAsyncThunk(
  'conversation/getConversationHistory',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await conversationService.getConversationHistory(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get conversation history');
    }
  }
);

export const getConversationWithMessages = createAsyncThunk(
  'conversation/getConversationWithMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await conversationService.getConversationWithMessages(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get conversation with messages');
    }
  }
);

// Conversation slice
const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addLocalMessage: (state, action: PayloadAction<MessageCreate>) => {
      const newMessage = messageService.addLocalMessage(action.payload);
      state.messages.unshift(newMessage); // Add to beginning since backend returns in descending order
    }
  },
  extraReducers: (builder) => {
    // Handle create conversation
    builder.addCase(createConversation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createConversation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversations.push(action.payload);
      state.currentConversation = action.payload;
      state.messages = []; // Clear messages for new conversation
    });
    builder.addCase(createConversation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get conversation
    builder.addCase(getConversation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getConversation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentConversation = action.payload;
      // Note: This doesn't load messages, use getConversationHistory for that
    });
    builder.addCase(getConversation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get user conversations
    builder.addCase(getUserConversations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getUserConversations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversations = action.payload;
    });
    builder.addCase(getUserConversations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle update conversation
    builder.addCase(updateConversation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateConversation.fulfilled, (state, action) => {
      state.isLoading = false;
      // Update in conversations array
      const index = state.conversations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
      // Update current conversation if it's the one being updated
      if (state.currentConversation?.id === action.payload.id) {
        state.currentConversation = action.payload;
      }
    });
    builder.addCase(updateConversation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get conversation history
    builder.addCase(getConversationHistory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getConversationHistory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.messages = action.payload;
    });
    builder.addCase(getConversationHistory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get conversation with messages
    builder.addCase(getConversationWithMessages.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getConversationWithMessages.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentConversation = {
        id: action.payload.id,
        user_id: action.payload.user_id,
        title: action.payload.title
      };
      state.messages = action.payload.messages;
      console.log("Updated state with messages:", action.payload.messages);
    });
    builder.addCase(getConversationWithMessages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setCurrentConversation, clearCurrentConversation, addLocalMessage } = conversationSlice.actions;
export default conversationSlice.reducer;