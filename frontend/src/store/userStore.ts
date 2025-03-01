import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, UserCreate } from '../types';
import { userApi } from '../api';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  createUser: (name: string) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  setUser: (user: User) => void;
  createAnonymousUser: () => Promise<User>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoading: false,
      error: null,

      createUser: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const userData: UserCreate = { name };
          const user = await userApi.createUser(userData);
          set({ currentUser: user, isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      getUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await userApi.getUser(userId);
          set({ currentUser: user, isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      setUser: (user: User) => {
        set({ currentUser: user });
      },

      createAnonymousUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const name = `Anonymous_${uuidv4().slice(0, 8)}`;
          const userData: UserCreate = { name };
          const user = await userApi.createUser(userData);
          set({ currentUser: user, isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create anonymous user';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      clearUser: () => {
        set({ currentUser: null });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);