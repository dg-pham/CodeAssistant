import { UserCreate, UserResponse } from '../types';
import { apiClient } from './apiClient';

export const userApi = {
  createUser: async (userData: UserCreate): Promise<UserResponse> => {
    return await apiClient.post<UserResponse>('/users', userData);
  },

  getUser: async (userId: string): Promise<UserResponse> => {
    return await apiClient.get<UserResponse>(`/users/${userId}`);
  },
};