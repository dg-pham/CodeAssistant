export interface MemoryBase {
  user_id: string;
  key: string;
  value: string;
  context?: string;
  priority: number; // 0-1
}

export interface MemoryCreate extends MemoryBase {
  id?: string;
}

export interface MemoryResponse extends MemoryBase {
  id: string;
  created_at: string;
  updated_at: string;
}