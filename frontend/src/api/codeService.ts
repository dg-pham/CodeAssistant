import api from './axios-config';
import {
  CodeRequest,
  CodeResponse,
  CodeSnippet,
  CodeSnippetCreate,
  CodeSnippetResponse
} from '@/types';

const codeService = {
  // Process code (generic endpoint supporting all operations)
  processCode: async (codeRequest: CodeRequest): Promise<CodeResponse> => {
    const response = await api.post<CodeResponse>('/code', codeRequest);
    return response.data;
  },

  // Generate code from description
  generateCode: async (codeRequest: CodeRequest): Promise<CodeResponse> => {
    const response = await api.post<CodeResponse>('/code/generate', codeRequest);
    return response.data;
  },

  // Optimize existing code
  optimizeCode: async (codeRequest: CodeRequest): Promise<CodeResponse> => {
    const response = await api.post<CodeResponse>('/code/optimize', codeRequest);
    return response.data;
  },

  // Translate code from one language to another
  translateCode: async (codeRequest: CodeRequest): Promise<CodeResponse> => {
    const response = await api.post<CodeResponse>('/code/translate', codeRequest);
    return response.data;
  },

  // Explain code in detail
  explainCode: async (codeRequest: CodeRequest): Promise<CodeResponse> => {
    const response = await api.post<CodeResponse>('/code/explain', codeRequest);
    return response.data;
  },

  // Save a code snippet
  saveCodeSnippet: async (snippet: CodeSnippetCreate): Promise<CodeSnippetResponse> => {
    const response = await api.post<CodeSnippetResponse>('/code-snippets', snippet);
    return response.data;
  },

  // Get a code snippet by ID
  getCodeSnippet: async (snippetId: string): Promise<CodeSnippetResponse> => {
    const response = await api.get<CodeSnippetResponse>(`/code-snippets/${snippetId}`);
    return response.data;
  },

  // Get all code snippets for a user
  getUserCodeSnippets: async (userId: string, language?: string): Promise<CodeSnippetResponse[]> => {
    const url = language
      ? `/users/${userId}/code-snippets?language=${language}`
      : `/users/${userId}/code-snippets`;
    const response = await api.get<CodeSnippetResponse[]>(url);
    return response.data;
  },

  // Update a code snippet
  updateCodeSnippet: async (snippetId: string, snippet: Partial<CodeSnippetCreate>): Promise<CodeSnippetResponse> => {
    const response = await api.put<CodeSnippetResponse>(`/code-snippets/${snippetId}`, snippet);
    return response.data;
  },

  // Delete a code snippet
  deleteCodeSnippet: async (snippetId: string): Promise<{success: boolean}> => {
    const response = await api.delete<{success: boolean}>(`/code-snippets/${snippetId}`);
    return response.data;
  },

  // Search for code snippets
  searchCodeSnippets: async (userId: string, query: string): Promise<CodeSnippetResponse[]> => {
    const response = await api.get<CodeSnippetResponse[]>(`/users/${userId}/code-snippets/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};

export default codeService;