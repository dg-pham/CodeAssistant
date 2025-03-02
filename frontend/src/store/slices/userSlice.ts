import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserCreate } from '@/types';
import { userService } from '@/api';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null
};

// Async thunks
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: UserCreate, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const getUser = createAsyncThunk(
  'user/getUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await userService.getUser(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const getOrCreateAnonymousUser = createAsyncThunk(
  'user/getOrCreateAnonymousUser',
  async (userName?: string, { rejectWithValue }) => {
    try {
      return await userService.getOrCreateAnonymousUser(userName);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get or create anonymous user');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    // Handle create user
    builder.addCase(createUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get user
    builder.addCase(getUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Handle get or create anonymous user
    builder.addCase(getOrCreateAnonymousUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getOrCreateAnonymousUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(getOrCreateAnonymousUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;