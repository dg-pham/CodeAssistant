import { create } from 'zustand';
import {
  CodeRequest,
  CodeResponse,
  CodeSnippetCreate,
  CodeSnippetResponse,
  ProgrammingLanguage
} from '../types';
import { codeApi } from '../api';
import { useUserStore } from './userStore';
import { useConversationStore } from './conversationStore';

interface CodeState {
  snippets: CodeSnippetResponse[];
  currentResponse: CodeResponse | null;
  currentSnippet: CodeSnippetResponse | null;
  sourceCode: string;
  sourceLanguage: ProgrammingLanguage | '';
  targetLanguage: ProgrammingLanguage | '';
  isLoading: boolean;
  error: string | null;

  // Code operations
  generateCode: (description: string, language: ProgrammingLanguage, withComments: boolean) => Promise<CodeResponse>;
  optimizeCode: (code: string, language: ProgrammingLanguage, level: 'low' | 'medium' | 'high') => Promise<CodeResponse>;
  translateCode: (code: string, fromLang: ProgrammingLanguage, toLang: ProgrammingLanguage) => Promise<CodeResponse>;
  explainCode: (code: string, language: ProgrammingLanguage) => Promise<CodeResponse>;

  // Code snippet operations
  saveSnippet: (snippet: CodeSnippetCreate) => Promise<CodeSnippetResponse>;
  getUserSnippets: (language?: ProgrammingLanguage) => Promise<CodeSnippetResponse[]>;
  getSnippet: (snippetId: string) => Promise<CodeSnippetResponse>;
  updateSnippet: (snippetId: string, snippet: Partial<CodeSnippetCreate>) => Promise<CodeSnippetResponse>;
  deleteSnippet: (snippetId: string) => Promise<boolean>;
  searchSnippets: (query: string) => Promise<CodeSnippetResponse[]>;

  // State management
  setSourceCode: (code: string) => void;
  setSourceLanguage: (language: ProgrammingLanguage | '') => void;
  setTargetLanguage: (language: ProgrammingLanguage | '') => void;
  setCurrentResponse: (response: CodeResponse | null) => void;
  setCurrentSnippet: (snippet: CodeSnippetResponse | null) => void;
  clearState: () => void;
}

export const useCodeStore = create<CodeState>((set, get) => ({
  snippets: [],
  currentResponse: null,
  currentSnippet: null,
  sourceCode: '',
  sourceLanguage: '',
  targetLanguage: '',
  isLoading: false,
  error: null,

  // Code operations
  generateCode: async (description: string, language: ProgrammingLanguage, withComments: boolean = true) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      const currentConversation = useConversationStore.getState().currentConversation;

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const request: CodeRequest = {
        action: 'generate',
        description,
        language_to: language,
        comments: withComments,
        user_id: currentUser.id,
        conversation_id: currentConversation?.id,
      };

      const response = await codeApi.generateCode(request);
      set({ currentResponse: response, isLoading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate code';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  optimizeCode: async (code: string, language: ProgrammingLanguage, level: 'low' | 'medium' | 'high' = 'medium') => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      const currentConversation = useConversationStore.getState().currentConversation;

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const request: CodeRequest = {
        action: 'optimize',
        code,
        language_from: language,
        optimization_level: level,
        user_id: currentUser.id,
        conversation_id: currentConversation?.id,
      };

      const response = await codeApi.optimizeCode(request);
      set({ currentResponse: response, isLoading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize code';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  translateCode: async (code: string, fromLang: ProgrammingLanguage, toLang: ProgrammingLanguage) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      const currentConversation = useConversationStore.getState().currentConversation;

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const request: CodeRequest = {
        action: 'translate',
        code,
        language_from: fromLang,
        language_to: toLang,
        user_id: currentUser.id,
        conversation_id: currentConversation?.id,
      };

      const response = await codeApi.translateCode(request);
      set({ currentResponse: response, isLoading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to translate code';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  explainCode: async (code: string, language: ProgrammingLanguage) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      const currentConversation = useConversationStore.getState().currentConversation;

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const request: CodeRequest = {
        action: 'explain',
        code,
        language_from: language,
        user_id: currentUser.id,
        conversation_id: currentConversation?.id,
      };

      const response = await codeApi.explainCode(request);
      set({ currentResponse: response, isLoading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to explain code';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  // Code snippet operations
  saveSnippet: async (snippet: CodeSnippetCreate) => {
    set({ isLoading: true, error: null });
    try {
      const savedSnippet = await codeApi.saveCodeSnippet(snippet);
      set((state) => ({
        snippets: [savedSnippet, ...state.snippets],
        currentSnippet: savedSnippet,
        isLoading: false,
      }));
      return savedSnippet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save snippet';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getUserSnippets: async (language?: ProgrammingLanguage) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const snippets = await codeApi.getUserCodeSnippets(currentUser.id, language);
      set({ snippets, isLoading: false });
      return snippets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user snippets';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getSnippet: async (snippetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const snippet = await codeApi.getCodeSnippet(snippetId);
      set({ currentSnippet: snippet, isLoading: false });
      return snippet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get snippet';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateSnippet: async (snippetId: string, snippetUpdate: Partial<CodeSnippetCreate>) => {
    set({ isLoading: true, error: null });
    try {
      const currentSnippet = await codeApi.getCodeSnippet(snippetId);

      // Merge current and updated data
      const updatedData: CodeSnippetCreate = {
        ...currentSnippet,
        ...snippetUpdate,
      };

      const updatedSnippet = await codeApi.updateCodeSnippet(snippetId, updatedData);

      set((state) => ({
        snippets: state.snippets.map((s) => (s.id === snippetId ? updatedSnippet : s)),
        currentSnippet: state.currentSnippet?.id === snippetId ? updatedSnippet : state.currentSnippet,
        isLoading: false,
      }));

      return updatedSnippet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update snippet';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteSnippet: async (snippetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await codeApi.deleteCodeSnippet(snippetId);

      if (result.success) {
        set((state) => ({
          snippets: state.snippets.filter((s) => s.id !== snippetId),
          currentSnippet: state.currentSnippet?.id === snippetId ? null : state.currentSnippet,
          isLoading: false,
        }));
      }

      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete snippet';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  searchSnippets: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const snippets = await codeApi.searchSnippets(currentUser.id, query);
      set({ snippets, isLoading: false });
      return snippets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search snippets';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  // State management
  setSourceCode: (code) => {
    set({ sourceCode: code });
  },

  setSourceLanguage: (language) => {
    set({ sourceLanguage: language });
  },

  setTargetLanguage: (language) => {
    set({ targetLanguage: language });
  },

  setCurrentResponse: (response) => {
    set({ currentResponse: response });
  },

  setCurrentSnippet: (snippet) => {
    set({ currentSnippet: snippet });
  },

  clearState: () => {
    set({
      snippets: [],
      currentResponse: null,
      currentSnippet: null,
      sourceCode: '',
      sourceLanguage: '',
      targetLanguage: '',
      error: null,
    });
  },
}));