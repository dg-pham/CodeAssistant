export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error_code?: string;
  details?: Record<string, any>;
}