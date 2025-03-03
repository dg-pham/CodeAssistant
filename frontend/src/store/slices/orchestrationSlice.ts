import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AgentOrchestrationTask, StartOrchestrationRequest, NextAgentRequest, AbortTaskRequest } from '@/api/orchestrationService';
import { orchestrationService } from '@/api';

interface OrchestrationState {
  tasks: AgentOrchestrationTask[];
  currentTask: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrchestrationState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null
};

// Async thunks
export const startOrchestration = createAsyncThunk(
  'orchestration/startOrchestration',
  async (data: StartOrchestrationRequest, { rejectWithValue }) => {
    try {
      return await orchestrationService.startOrchestration(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start orchestration');
    }
  }
);

export const getTaskStatus = createAsyncThunk(
  'orchestration/getTaskStatus',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await orchestrationService.getTaskStatus(taskId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get task status');
    }
  }
);

export const nextAgent = createAsyncThunk(
  'orchestration/nextAgent',
  async (data: NextAgentRequest, { rejectWithValue }) => {
    try {
      return await orchestrationService.nextAgent(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to proceed to next agent');
    }
  }
);

export const abortTask = createAsyncThunk(
  'orchestration/abortTask',
  async (data: AbortTaskRequest, { rejectWithValue }) => {
    try {
      return await orchestrationService.abortTask(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to abort task');
    }
  }
);

export const getUserTasks = createAsyncThunk(
  'orchestration/getUserTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await orchestrationService.getUserTasks(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user tasks');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'orchestration/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await orchestrationService.deleteTask(taskId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

// Slice
const orchestrationSlice = createSlice({
  name: 'orchestration',
  initialState,
  reducers: {
    setCurrentTask: (state, action: PayloadAction<any>) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    }
  },
  extraReducers: (builder) => {
    // Helpers
    const setPending = (state: OrchestrationState) => {
      state.isLoading = true;
      state.error = null;
    };

    const setRejected = (state: OrchestrationState, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    // Start orchestration
    builder.addCase(startOrchestration.pending, setPending);
    builder.addCase(startOrchestration.fulfilled, (state, action) => {
      state.isLoading = false;
      // The task ID is returned, but we need to get the task details separately
    });
    builder.addCase(startOrchestration.rejected, setRejected);

    // Get task status
    builder.addCase(getTaskStatus.pending, setPending);
    builder.addCase(getTaskStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentTask = action.payload;
    });
    builder.addCase(getTaskStatus.rejected, setRejected);

    // Next agent
    builder.addCase(nextAgent.pending, setPending);
    builder.addCase(nextAgent.fulfilled, (state, action) => {
      state.isLoading = false;
      // Update current task with the next agent information
      if (action.payload.task) {
        state.currentTask = action.payload.task;
      }
    });
    builder.addCase(nextAgent.rejected, setRejected);

    // Abort task
    builder.addCase(abortTask.pending, setPending);
    builder.addCase(abortTask.fulfilled, (state) => {
      state.isLoading = false;
      // The task status will be updated when the task is refreshed
    });
    builder.addCase(abortTask.rejected, setRejected);

    // Get user tasks
    builder.addCase(getUserTasks.pending, setPending);
    builder.addCase(getUserTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload;
    });
    builder.addCase(getUserTasks.rejected, setRejected);

    // Delete task
    builder.addCase(deleteTask.pending, setPending);
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = state.tasks.filter(t => t.id !== action.meta.arg);
      if (state.currentTask?.id === action.meta.arg) {
        state.currentTask = null;
      }
    });
    builder.addCase(deleteTask.rejected, setRejected);
  }
});

export const { setCurrentTask, clearCurrentTask } = orchestrationSlice.actions;
export default orchestrationSlice.reducer;