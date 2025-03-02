import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CodeRequest, CodeResponse, CodeSnippet, CodeSnippetCreate } from '@/types';
import { codeService } from '@/api';

interface CodeState {
  currentCode: string;
  language: string;
  snippets: CodeSnippet[];
  lastResponse: CodeResponse | null;
  isProcessing: boolean;
  error: string | null;
}

const initialState: CodeState = {
  currentCode: '',
  language: 'javascript',
  snippets: [],
  lastResponse: null,
  isProcessing: false,
  error: null
};

// Async thunks
export const processCode = createAsyncThunk(
  'code/processCode',
  async (codeRequest: CodeRequest, { rejectWithValue }) => {
    try {
      return await codeService.processCode(codeRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process code');
    }
  }
);

export const generateCode = createAsyncThunk(
  'code/generateCode',
  async (codeRequest: CodeRequest, { rejectWithValue }) => {
    try {
      return await codeService.generateCode(codeRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate code');
    }
  }
);

export const optimizeCode = createAsyncThunk(
  'code/optimizeCode',
  async (codeRequest: CodeRequest, { rejectWithValue }) => {
    try {
      return await codeService.optimizeCode(codeRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to optimize code');
    }
  }
);

export const translateCode = createAsyncThunk(
  'code/translateCode',
  async (codeRequest: CodeRequest, { rejectWithValue }) => {
    try {
      return await codeService.translateCode(codeRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to translate code');
    }
  }
);

export const explainCode = createAsyncThunk(
  'code/explainCode',
  async (codeRequest: CodeRequest, { rejectWithValue }) => {
    try {
      return await codeService.explainCode(codeRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to explain code');
    }
  }
);

export const saveCodeSnippet = createAsyncThunk(
  'code/saveCodeSnippet',
  async (snippet: CodeSnippetCreate, { rejectWithValue }) => {
    try {
      return await codeService.saveCodeSnippet(snippet);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save code snippet');
    }
  }
);

export const getUserCodeSnippets = createAsyncThunk(
  'code/getUserCodeSnippets',
  async ({ userId, language }: { userId: string; language?: string }, { rejectWithValue }) => {
    try {
      return await codeService.getUserCodeSnippets(userId, language);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user code snippets');
    }
  }
);

export const deleteCodeSnippet = createAsyncThunk(
  'code/deleteCodeSnippet',
  async (snippetId: string, { rejectWithValue }) => {
    try {
      const result = await codeService.deleteCodeSnippet(snippetId);
      return { success: result.success, snippetId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete code snippet');
    }
  }
);

export const searchCodeSnippets = createAsyncThunk(
  'code/searchCodeSnippets',
  async ({ userId, query }: { userId: string; query: string }, { rejectWithValue }) => {
    try {
      return await codeService.searchCodeSnippets(userId, query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search code snippets');
    }
  }
);

// Code slice
const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    setCurrentCode: (state, action: PayloadAction<string>) => {
      state.currentCode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    clearLastResponse: (state) => {
      state.lastResponse = null;
    }
  },
  extraReducers: (builder) => {
    // Helper function to handle pending state
    const handlePending = (state: CodeState) => {
      state.isProcessing = true;
      state.error = null;
    };

    // Helper function to handle rejected state
    const handleRejected = (state: CodeState, action: PayloadAction<any>) => {
      state.isProcessing = false;
      state.error = action.payload as string;
    };

    // Helper function to handle fulfilled state for code operations
    const handleCodeOperationFulfilled = (state: CodeState, action: PayloadAction<CodeResponse>) => {
      state.isProcessing = false;
      state.lastResponse = action.payload;
    };

    // Process code
    builder.addCase(processCode.pending, handlePending);
    builder.addCase(processCode.fulfilled, handleCodeOperationFulfilled);
    builder.addCase(processCode.rejected, handleRejected);

    // Generate code
    builder.addCase(generateCode.pending, handlePending);
    builder.addCase(generateCode.fulfilled, handleCodeOperationFulfilled);
    builder.addCase(generateCode.rejected, handleRejected);

    // Optimize code
    builder.addCase(optimizeCode.pending, handlePending);
    builder.addCase(optimizeCode.fulfilled, handleCodeOperationFulfilled);
    builder.addCase(optimizeCode.rejected, handleRejected);

    // Translate code
    builder.addCase(translateCode.pending, handlePending);
    builder.addCase(translateCode.fulfilled, handleCodeOperationFulfilled);
    builder.addCase(translateCode.rejected, handleRejected);

    // Explain code
    builder.addCase(explainCode.pending, handlePending);
    builder.addCase(explainCode.fulfilled, handleCodeOperationFulfilled);
    builder.addCase(explainCode.rejected, handleRejected);

    // Save code snippet
    builder.addCase(saveCodeSnippet.pending, handlePending);
    builder.addCase(saveCodeSnippet.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.snippets.push(action.payload);
    });
    builder.addCase(saveCodeSnippet.rejected, handleRejected);

    // Get user code snippets
    builder.addCase(getUserCodeSnippets.pending, handlePending);
    builder.addCase(getUserCodeSnippets.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.snippets = action.payload;
    });
    builder.addCase(getUserCodeSnippets.rejected, handleRejected);

    // Delete code snippet
    builder.addCase(deleteCodeSnippet.pending, handlePending);
    builder.addCase(deleteCodeSnippet.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.snippets = state.snippets.filter(snippet => snippet.id !== action.payload.snippetId);
    });
    builder.addCase(deleteCodeSnippet.rejected, handleRejected);

    // Search code snippets
    builder.addCase(searchCodeSnippets.pending, handlePending);
    builder.addCase(searchCodeSnippets.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.snippets = action.payload;
    });
    builder.addCase(searchCodeSnippets.rejected, handleRejected);
  }
});

export const { setCurrentCode, setLanguage, clearLastResponse } = codeSlice.actions;
export default codeSlice.reducer;