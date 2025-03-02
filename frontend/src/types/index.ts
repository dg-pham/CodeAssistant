// User types
export interface User {
  id: string;
  name: string;
}

export interface UserCreate {
  id?: string;
  name: string;
}

export interface UserResponse extends User {}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
}

export interface ConversationCreate {
  id?: string;
  user_id: string;
  title?: string;
}

export interface ConversationResponse extends Conversation {}

export interface ConversationUpdate {
  title?: string;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MessageCreate {
  role: 'user' | 'assistant';
  content: string;
  conversation_id: string;
}

export interface MessageResponse extends Message {}

// Code Snippet types
export interface CodeSnippet {
  id: string;
  user_id: string;
  language: string;
  code: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CodeSnippetCreate {
  id?: string;
  user_id: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
}

export interface CodeSnippetResponse extends CodeSnippet {}

// Code Request types
export interface CodeRequest {
  action: 'generate' | 'optimize' | 'translate' | 'explain';
  code?: string;
  language_from?: string;
  language_to?: string;
  description?: string;
  comments?: boolean;
  optimization_level?: 'low' | 'medium' | 'high';
  conversation_id?: string;
  user_id?: string;
  save_snippet?: boolean;
  tags?: string[];
  context?: string;
}

// Code Response types
export interface CodeResponse {
  status: string;
  result: string;
  conversation_id?: string;
  message_id?: string;
  additional_info?: {
    token_usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    [key: string]: any;
  };
  suggestions?: string[];
}

// Feedback types
export interface Feedback {
  id: string;
  message_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface FeedbackCreate {
  message_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface FeedbackResponse extends Feedback {}

// Memory types
export interface Memory {
  id: string;
  user_id: string;
  key: string;
  value: string;
  context?: string;
  priority: number; // 0-1
  created_at: string;
  updated_at: string;
}

export interface MemoryCreate {
  id?: string;
  user_id: string;
  key: string;
  value: string;
  context?: string;
  priority?: number; // 0-1
}

export interface MemoryResponse extends Memory {}

// Common types
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
  data?: any;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error_code?: string;
  details?: any;
}

// Conversation with messages
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}