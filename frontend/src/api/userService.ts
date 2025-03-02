import api from './axios-config';
import { User, UserCreate, UserResponse } from '@/types';

const userService = {
  // Create a new user
  createUser: async (userData: UserCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/users', userData);
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  // Get or create anonymous user
  getOrCreateAnonymousUser: async (userName: string = 'Anonymous User'): Promise<UserResponse> => {
    try {
      // Try to get user from localStorage
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        try {
          // Try to fetch the user with the stored ID
          return await userService.getUser(storedUserId);
        } catch (error) {
          // If the user doesn't exist, create a new one
          console.warn('Stored user not found, creating new user');
        }
      }

      // Create a new anonymous user
      const newUser: UserCreate = {
        name: userName
      };
      const user = await userService.createUser(newUser);

      // Store the user ID in localStorage
      localStorage.setItem('user_id', user.id);
      return user;
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      throw error;
    }
  }
};

export default userService;