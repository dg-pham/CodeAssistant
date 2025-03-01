import { create } from 'zustand';
import { MemoryCreate, MemoryResponse } from '../types';
import { memoryApi } from '../api';
import { useUserStore } from './userStore';

interface MemoryState {
  memories: MemoryResponse[];
  currentMemory: MemoryResponse | null;
  isLoading: boolean;
  error: string | null;

  storeMemory: (memory: Omit<MemoryCreate, 'user_id'>) => Promise<MemoryResponse>;
  getUserMemories: (context?: string, limit?: number) => Promise<MemoryResponse[]>;
  getMemory: (memoryId: string) => Promise<MemoryResponse>;
  forgetMemory: (key: string) => Promise<boolean>;
  updateMemoryPriority: (key: string, priority: number) => Promise<boolean>;

  setCurrentMemory: (memory: MemoryResponse | null) => void;
  clearState: () => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  currentMemory: null,
  isLoading: false,
  error: null,

  storeMemory: async (memoryData: Omit<MemoryCreate, 'user_id'>) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const memory: MemoryCreate = {
        ...memoryData,
        user_id: currentUser.id,
      };

      const savedMemory = await memoryApi.storeMemory(memory);
      set((state) => ({
        memories: [savedMemory, ...state.memories.filter(m => m.key !== savedMemory.key)],
        currentMemory: savedMemory,
        isLoading: false,
      }));
      return savedMemory;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to store memory';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getUserMemories: async (context?: string, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const memories = await memoryApi.getUserMemories(currentUser.id, context, limit);
      set({ memories, isLoading: false });
      return memories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user memories';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  getMemory: async (memoryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const memory = await memoryApi.getMemory(memoryId);
      set({ currentMemory: memory, isLoading: false });
      return memory;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get memory';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  forgetMemory: async (key: string) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const result = await memoryApi.forgetMemory(currentUser.id, key);

      if (result.success) {
        set((state) => ({
          memories: state.memories.filter((m) => m.key !== key),
          currentMemory: state.currentMemory?.key === key ? null : state.currentMemory,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }

      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to forget memory';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateMemoryPriority: async (key: string, priority: number) => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      if (priority < 0 || priority > 1) {
        throw new Error('Priority must be between 0 and 1');
      }

      const result = await memoryApi.updateMemoryPriority(currentUser.id, key, priority);

      if (result.success) {
        // Update the memory in the local state
        set((state) => {
          const updatedMemories = state.memories.map((m) => {
            if (m.key === key) {
              return { ...m, priority };
            }
            return m;
          });

          return {
            memories: updatedMemories,
            currentMemory: state.currentMemory?.key === key
              ? { ...state.currentMemory, priority }
              : state.currentMemory,
            isLoading: false,
          };
        });
      } else {
        set({ isLoading: false });
      }

      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update memory priority';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  setCurrentMemory: (memory) => {
    set({ currentMemory: memory });
  },

  clearState: () => {
    set({
      memories: [],
      currentMemory: null,
      error: null,
    });
  },
}));