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

export interface CodeSnippetBase {
  user_id: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
}

export interface CodeSnippetCreate extends CodeSnippetBase {
  id?: string;
}

export interface CodeSnippetResponse extends CodeSnippetBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export type ProgrammingLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'rust'
  | 'scala'
  | 'html'
  | 'css'
  | 'sql';

export const PROGRAMMING_LANGUAGES: { value: ProgrammingLanguage; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'rust', label: 'Rust' },
  { value: 'scala', label: 'Scala' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' }
];