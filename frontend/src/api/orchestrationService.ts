import api from './axios-config';

export interface AgentOrchestrationTask {
  id: string;
  user_id: string;
  task_type: string;
  status: string;
  input_data: any;
  output_data: any;
  agent_chain: any[];
  current_agent_index: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentTaskResult {
  id: string;
  task_id: string;
  agent_type: string;
  result_data: any;
  metadata: any;
  created_at: string;
}

export interface StartOrchestrationRequest {
  user_id: string;
  task_type: string;
  input_data: any;
  agent_chain?: any[];
}

export interface NextAgentRequest {
  task_id: string;
  current_result?: any;
}

export interface AbortTaskRequest {
  task_id: string;
  reason?: string;
}

const orchestrationService = {
  // Bắt đầu orchestration task mới
  startOrchestration: async (data: StartOrchestrationRequest): Promise<{status: string; message: string; task_id: string}> => {
    const response = await api.post<{status: string; message: string; task_id: string}>('/orchestration/start', data);
    return response.data;
  },

  // Lấy trạng thái của task
  getTaskStatus: async (taskId: string): Promise<any> => {
    const response = await api.get<any>(`/orchestration/task/${taskId}`);
    return response.data;
  },

  // Chuyển sang agent tiếp theo
  nextAgent: async (data: NextAgentRequest): Promise<any> => {
    const response = await api.post<any>('/orchestration/next', data);
    return response.data;
  },

  // Hủy bỏ task
  abortTask: async (data: AbortTaskRequest): Promise<{status: string; message: string; task_id: string}> => {
    const response = await api.post<{status: string; message: string; task_id: string}>('/orchestration/abort', data);
    return response.data;
  },

  // Lấy danh sách task của người dùng
  getUserTasks: async (userId: string): Promise<AgentOrchestrationTask[]> => {
    const response = await api.get<AgentOrchestrationTask[]>(`/users/${userId}/orchestration/tasks`);
    return response.data;
  },

  // Xóa task
  deleteTask: async (taskId: string): Promise<{status: string; message: string; task_id: string}> => {
    const response = await api.delete<{status: string; message: string; task_id: string}>(`/orchestration/task/${taskId}`);
    return response.data;
  }
};

export default orchestrationService;