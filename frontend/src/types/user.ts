export interface User {
  id: string;
  name: string;
}

export interface UserCreate {
  id?: string;
  name: string;
}

export interface UserResponse extends User {}