import { MemoryCreate, MemoryResponse } from '../types';
import { apiClient } from './apiClient';

export const memoryApi = {
  storeMemory: async (memory: MemoryCreate): Promise<MemoryResponse> => {
    return await apiClient.post<MemoryResponse>('/memories', memory);
  },

  getUserMemories: async (
    userId: string,
    context?: string,
    limit: number = 10
  ): Promise<MemoryResponse[]> => {
    return await apiClient.get<MemoryResponse[]>(
      `/users/${userId}/memories`,
      { params: { context, limit } }
    );
  },

  getMemory: async (memoryId: string): Promise<MemoryResponse> => {
    return await apiClient.get<MemoryResponse>(`/memories/${memoryId}`);
  },

  forgetMemory: async (userId: string, key: string): Promise<{ success: boolean }> => {
    return await apiClient.delete<{ success: boolean }>(`/users/${userId}/memories/${key}`);
  },

  updateMemoryPriority: async (
    userId: string,
    key: string,
    priority: number
  ): Promise<{ success: boolean }> => {
    return await apiClient.patch<{ success: boolean }>(
      `/users/${userId}/memories/${key}/priority`,
      { priority }
    );
  },
};