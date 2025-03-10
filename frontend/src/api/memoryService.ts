import api from './axios-config';
import { MemoryCreate, MemoryResponse } from '@/types';

const memoryService = {
  // Store a memory
  storeMemory: async (memoryData: MemoryCreate): Promise<MemoryResponse> => {
    const response = await api.post<MemoryResponse>('/memories', memoryData);
    return response.data;
  },

  // Get memories for a user
  getUserMemories: async (userId: string, context?: string, limit: number = 10): Promise<MemoryResponse[]> => {
    const url = context
      ? `/users/${userId}/memories?context=${encodeURIComponent(context)}&limit=${limit}`
      : `/users/${userId}/memories?limit=${limit}`;
    const response = await api.get<MemoryResponse[]>(url);
    return response.data;
  },

  // Get a specific memory by ID
  getMemory: async (memoryId: string): Promise<MemoryResponse> => {
    const response = await api.get<MemoryResponse>(`/memories/${memoryId}`);
    return response.data;
  },

  // Delete (forget) a memory
  forgetMemory: async (userId: string, key: string): Promise<{success: boolean, message: string}> => {
    const response = await api.delete<{success: boolean, message: string}>(`/users/${userId}/memories/${key}`);
    return response.data;
  },

  // Update memory priority
  updateMemoryPriority: async (userId: string, key: string, priority: number): Promise<{success: boolean, message: string, priority: number}> => {
      try {
        // Thay vì sử dụng key trong URL, gửi nó trong body request
        const response = await api.patch<{success: boolean, message: string, priority: number}>(
          `/users/${userId}/memories/priority`,  // Endpoint mới, không sử dụng key trong URL
          {
            key: key,  // Đưa key vào body request
            priority: priority
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error updating memory priority:', error);
        throw error;
      }
    },
};

export default memoryService;