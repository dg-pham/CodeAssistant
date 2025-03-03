import api from './axios-config';

export interface GitMergeSession {
  id: string;
  user_id: string;
  repository_url: string;
  base_branch: string;
  target_branch: string;
  status: string;
  conflicts: any[];
  resolved_conflicts: any[];
  merge_result?: string;
  created_at: string;
  updated_at: string;
}

export interface GitMergeConflict {
  id: string;
  session_id: string;
  file_path: string;
  conflict_content: string;
  our_changes: string;
  their_changes: string;
  resolved_content?: string;
  resolution_strategy?: string;
  is_resolved: boolean;
  ai_suggestion?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMergeSessionRequest {
  user_id: string;
  repository_url: string;
  base_branch: string;
  target_branch: string;
}

export interface ResolveConflictRequest {
  conflict_id: string;
  resolved_content: string;
  resolution_strategy: string;
}

export interface CompleteMergeRequest {
  session_id: string;
}

const gitMergeService = {
  // Tạo phiên merge git mới
  createMergeSession: async (data: CreateMergeSessionRequest): Promise<GitMergeSession> => {
    const response = await api.post<GitMergeSession>('/git-merge/sessions', data);
    return response.data;
  },

  // Lấy thông tin phiên merge git
  getMergeSession: async (sessionId: string): Promise<GitMergeSession> => {
    const response = await api.get<GitMergeSession>(`/git-merge/sessions/${sessionId}`);
    return response.data;
  },

  // Lấy danh sách phiên merge git của người dùng
  getUserMergeSessions: async (userId: string): Promise<GitMergeSession[]> => {
    const response = await api.get<GitMergeSession[]>(`/users/${userId}/git-merge/sessions`);
    return response.data;
  },

  // Lấy danh sách xung đột của phiên merge git
  getSessionConflicts: async (sessionId: string): Promise<GitMergeConflict[]> => {
    const response = await api.get<GitMergeConflict[]>(`/git-merge/sessions/${sessionId}/conflicts`);
    return response.data;
  },

  // Giải quyết xung đột
  resolveConflict: async (data: ResolveConflictRequest): Promise<GitMergeConflict> => {
    const response = await api.post<GitMergeConflict>('/git-merge/conflicts/resolve', data);
    return response.data;
  },

  // Hoàn thành merge
  completeMerge: async (data: CompleteMergeRequest): Promise<{success: boolean; message: string}> => {
    const response = await api.post<{success: boolean; message: string}>('/git-merge/complete', data);
    return response.data;
  },

  // Xóa phiên merge git
  deleteMergeSession: async (sessionId: string): Promise<{success: boolean; message: string}> => {
    const response = await api.delete<{success: boolean; message: string}>(`/git-merge/sessions/${sessionId}`);
    return response.data;
  }
};

export default gitMergeService;