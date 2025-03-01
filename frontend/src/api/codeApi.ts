import {
  CodeRequest,
  CodeResponse,
  CodeSnippetCreate,
  CodeSnippetResponse
} from '../types';
import { apiClient } from './apiClient';

export const codeApi = {
  // AI operations
  generateCode: async (requestData: CodeRequest): Promise<CodeResponse> => {
    requestData.action = 'generate';
    return await apiClient.post<CodeResponse>('/code/generate', requestData);
  },

  optimizeCode: async (requestData: CodeRequest): Promise<CodeResponse> => {
    requestData.action = 'optimize';
    return await apiClient.post<CodeResponse>('/code/optimize', requestData);
  },

  translateCode: async (requestData: CodeRequest): Promise<CodeResponse> => {
    requestData.action = 'translate';
    return await apiClient.post<CodeResponse>('/code/translate', requestData);
  },

  explainCode: async (requestData: CodeRequest): Promise<CodeResponse> => {
    requestData.action = 'explain';
    return await apiClient.post<CodeResponse>('/code/explain', requestData);
  },

  processCode: async (requestData: CodeRequest): Promise<CodeResponse> => {
    return await apiClient.post<CodeResponse>('/code', requestData);
  },

  // Code snippet operations
  saveCodeSnippet: async (snippet: CodeSnippetCreate): Promise<CodeSnippetResponse> => {
    return await apiClient.post<CodeSnippetResponse>('/code-snippets', snippet);
  },

  getCodeSnippet: async (snippetId: string): Promise<CodeSnippetResponse> => {
    return await apiClient.get<CodeSnippetResponse>(`/code-snippets/${snippetId}`);
  },

  getUserCodeSnippets: async (userId: string, language?: string): Promise<CodeSnippetResponse[]> => {
    return await apiClient.get<CodeSnippetResponse[]>(
      `/users/${userId}/code-snippets`,
      { params: { language } }
    );
  },

  updateCodeSnippet: async (snippetId: string, snippet: CodeSnippetCreate): Promise<CodeSnippetResponse> => {
    return await apiClient.put<CodeSnippetResponse>(`/code-snippets/${snippetId}`, snippet);
  },

  deleteCodeSnippet: async (snippetId: string): Promise<{ success: boolean }> => {
    return await apiClient.delete<{ success: boolean }>(`/code-snippets/${snippetId}`);
  },

  searchSnippets: async (userId: string, query: string): Promise<CodeSnippetResponse[]> => {
    return await apiClient.get<CodeSnippetResponse[]>(
      `/users/${userId}/code-snippets/search`,
      { params: { query } }
    );
  },
};