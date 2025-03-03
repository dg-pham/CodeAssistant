import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GitMergeSession, GitMergeConflict, CreateMergeSessionRequest, ResolveConflictRequest, CompleteMergeRequest } from '@/api/gitMergeService';
import { gitMergeService } from '@/api';

interface GitMergeState {
  sessions: GitMergeSession[];
  currentSession: GitMergeSession | null;
  conflicts: GitMergeConflict[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GitMergeState = {
  sessions: [],
  currentSession: null,
  conflicts: [],
  isLoading: false,
  error: null
};

// Async thunks
export const createMergeSession = createAsyncThunk(
  'gitMerge/createMergeSession',
  async (data: CreateMergeSessionRequest, { rejectWithValue }) => {
    try {
      return await gitMergeService.createMergeSession(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create merge session');
    }
  }
);

export const getMergeSession = createAsyncThunk(
  'gitMerge/getMergeSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await gitMergeService.getMergeSession(sessionId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get merge session');
    }
  }
);

export const getUserMergeSessions = createAsyncThunk(
  'gitMerge/getUserMergeSessions',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await gitMergeService.getUserMergeSessions(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user merge sessions');
    }
  }
);

export const getSessionConflicts = createAsyncThunk(
  'gitMerge/getSessionConflicts',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await gitMergeService.getSessionConflicts(sessionId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get session conflicts');
    }
  }
);

export const resolveConflict = createAsyncThunk(
  'gitMerge/resolveConflict',
  async (data: ResolveConflictRequest, { rejectWithValue }) => {
    try {
      return await gitMergeService.resolveConflict(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve conflict');
    }
  }
);

export const completeMerge = createAsyncThunk(
  'gitMerge/completeMerge',
  async (data: CompleteMergeRequest, { rejectWithValue }) => {
    try {
      return await gitMergeService.completeMerge(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete merge');
    }
  }
);

export const deleteMergeSession = createAsyncThunk(
  'gitMerge/deleteMergeSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await gitMergeService.deleteMergeSession(sessionId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete merge session');
    }
  }
);

// Slice
const gitMergeSlice = createSlice({
  name: 'gitMerge',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<GitMergeSession>) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.conflicts = [];
    }
  },
  extraReducers: (builder) => {
    // Helpers
    const setPending = (state: GitMergeState) => {
      state.isLoading = true;
      state.error = null;
    };

    const setRejected = (state: GitMergeState, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    // Create merge session
    builder.addCase(createMergeSession.pending, setPending);
    builder.addCase(createMergeSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sessions.push(action.payload);
      state.currentSession = action.payload;
    });
    builder.addCase(createMergeSession.rejected, setRejected);

    // Get merge session
    builder.addCase(getMergeSession.pending, setPending);
    builder.addCase(getMergeSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentSession = action.payload;
    });
    builder.addCase(getMergeSession.rejected, setRejected);

    // Get user merge sessions
    builder.addCase(getUserMergeSessions.pending, setPending);
    builder.addCase(getUserMergeSessions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sessions = action.payload;
    });
    builder.addCase(getUserMergeSessions.rejected, setRejected);

    // Get session conflicts
    builder.addCase(getSessionConflicts.pending, setPending);
    builder.addCase(getSessionConflicts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conflicts = action.payload;
    });
    builder.addCase(getSessionConflicts.rejected, setRejected);

    // Resolve conflict
    builder.addCase(resolveConflict.pending, setPending);
    builder.addCase(resolveConflict.fulfilled, (state, action) => {
      state.isLoading = false;
      // Update the conflict in the list
      const index = state.conflicts.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.conflicts[index] = action.payload;
      }
    });
    builder.addCase(resolveConflict.rejected, setRejected);

    // Complete merge
    builder.addCase(completeMerge.pending, setPending);
    builder.addCase(completeMerge.fulfilled, (state) => {
      state.isLoading = false;

      // Cập nhật trạng thái trong danh sách sessions
      const sessionId = action.meta.arg.session_id;
      const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        state.sessions[sessionIndex].status = 'completed';
      }

      // Cập nhật currentSession nếu được chọn
      if (state.currentSession?.id === sessionId) {
        state.currentSession.status = 'completed';
      }
      // The session status will be updated when the session is refreshed
    });
    builder.addCase(completeMerge.rejected, setRejected);

    // Delete merge session
    builder.addCase(deleteMergeSession.pending, setPending);
    builder.addCase(deleteMergeSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sessions = state.sessions.filter(s => s.id !== action.meta.arg);
      if (state.currentSession?.id === action.meta.arg) {
        state.currentSession = null;
        state.conflicts = [];
      }
    });
    builder.addCase(deleteMergeSession.rejected, setRejected);
  }
});

export const { setCurrentSession, clearCurrentSession } = gitMergeSlice.actions;
export default gitMergeSlice.reducer;