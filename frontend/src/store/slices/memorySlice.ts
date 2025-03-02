import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Memory, MemoryCreate, MemoryResponse } from '@/types';
import { memoryService } from '@/api';

interface MemoryState {
  memories: Memory[];
  contextMemories: { [context: string]: Memory[] };
  isLoading: boolean;
  error: string | null;
}

const initialState: MemoryState = {
  memories: [],
  contextMemories: {},
  isLoading: false,
  error: null
};

// Async thunks
export const storeMemory = createAsyncThunk(
  'memory/storeMemory',
  async (memoryData: MemoryCreate, { rejectWithValue }) => {
    try {
      return await memoryService.storeMemory(memoryData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to store memory');
    }
  }
);

export const getUserMemories = createAsyncThunk(
  'memory/getUserMemories',
  async ({ userId, context, limit }: { userId: string; context?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const memories = await memoryService.getUserMemories(userId, context, limit);
      return { memories, context };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user memories');
    }
  }
);

export const forgetMemory = createAsyncThunk(
  'memory/forgetMemory',
  async ({ userId, key }: { userId: string; key: string }, { rejectWithValue }) => {
    try {
      const result = await memoryService.forgetMemory(userId, key);
      return { success: result.success, key };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to forget memory');
    }
  }
);

export const updateMemoryPriority = createAsyncThunk(
  'memory/updateMemoryPriority',
  async ({ userId, key, priority }: { userId: string; key: string; priority: number }, { rejectWithValue }) => {
    try {
      return await memoryService.updateMemoryPriority(userId, key, priority);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update memory priority');
    }
  }
);

// Memory slice
const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    clearMemories: (state) => {
      state.memories = [];
      state.contextMemories = {};
    }
  },
  extraReducers: (builder) => {
    // Handle store memory
    builder.addCase(storeMemory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(storeMemory.fulfilled, (state, action) => {
      state.isLoading = false;

      // Check if this memory already exists
      const existingIndex = state.memories.findIndex(m =>
        m.user_id === action.payload.user_id && m.key === action.payload.key
      );

      if (existingIndex !== -1) {
        // Update existing memory
        state.memories[existingIndex] = action.payload;
      } else {
        // Add new memory
        state.memories.push(action.payload);
      }

      // Update context memories if this context exists
      if (action.payload.context && state.contextMemories[action.payload.context]) {
        const contextIndex = state.contextMemories[action.payload.context].findIndex(m =>
          m.user_id === action.payload.user_id && m.key === action.payload.key
        );

        if (contextIndex !== -1) {
          state.contextMemories[action.payload.context][contextIndex] = action.payload;
        } else {
          state.contextMemories[action.payload.context].push(action.payload);
        }
      }
    });
    builder.addCase(storeMemory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get user memories
    builder.addCase(getUserMemories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getUserMemories.fulfilled, (state, action) => {
      state.isLoading = false;
      const { memories, context } = action.payload;

      // Update all memories
      if (!context) {
        state.memories = memories;
      }

      // Update context-specific memories
      if (context) {
        state.contextMemories[context] = memories;
      }
    });
    builder.addCase(getUserMemories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle forget memory
    builder.addCase(forgetMemory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(forgetMemory.fulfilled, (state, action) => {
      state.isLoading = false;

      // Remove from memories
      state.memories = state.memories.filter(m => m.key !== action.payload.key);

      // Remove from all context memories
      Object.keys(state.contextMemories).forEach(context => {
        state.contextMemories[context] = state.contextMemories[context].filter(m =>
          m.key !== action.payload.key
        );
      });
    });
    builder.addCase(forgetMemory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle update memory priority
    builder.addCase(updateMemoryPriority.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateMemoryPriority.fulfilled, (state, action) => {
      state.isLoading = false;

      // Update priority in memories
      const key = action.payload.key;
      const priority = action.payload.priority;

      // Update in main memories
      const memoryIndex = state.memories.findIndex(m => m.key === key);
      if (memoryIndex !== -1) {
        state.memories[memoryIndex].priority = priority;
      }

      // Update in all context memories
      Object.keys(state.contextMemories).forEach(context => {
        const contextIndex = state.contextMemories[context].findIndex(m => m.key === key);
        if (contextIndex !== -1) {
          state.contextMemories[context][contextIndex].priority = priority;
        }
      });
    });
    builder.addCase(updateMemoryPriority.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearMemories } = memorySlice.actions;
export default memorySlice.reducer;