import api from './axios-config';

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  workflow_id: string;
  node_type: string;
  name: string;
  description?: string;
  position_x: number;
  position_y: number;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowEdge {
  id: string;
  workflow_id: string;
  source_id: string;
  target_id: string;
  edge_type: string;
  conditions: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: string;
  input_data: any;
  output_data: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  steps: WorkflowExecutionStep[];
}

export interface WorkflowExecutionStep {
  id: string;
  node_id: string;
  status: string;
  input_data: any;
  output_data: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface Agent {
  name: string;
  description: string;
  category: string;
  inputs: string[];
  outputs: string[];
}

// Các request models
export interface CreateWorkflowRequest {
  user_id: string;
  name: string;
  description?: string;
  metadata?: any;
}

export interface CreateNodeRequest {
  node_type: string;
  name: string;
  description?: string;
  position_x: number;
  position_y: number;
  config?: any;
}

export interface CreateEdgeRequest {
  source_id: string;
  target_id: string;
  edge_type?: string;
  conditions?: any;
}

export interface ExecuteWorkflowRequest {
  user_id: string;
  input_data: any;
}

const workflowService = {
  // Workflow CRUD
  createWorkflow: async (data: CreateWorkflowRequest): Promise<Workflow> => {
    const response = await api.post<Workflow>('/workflows', data);
    return response.data;
  },

  getWorkflow: async (workflowId: string): Promise<Workflow> => {
    const response = await api.get<Workflow>(`/workflows/${workflowId}`);
    return response.data;
  },

  getUserWorkflows: async (userId: string): Promise<Workflow[]> => {
    const response = await api.get<Workflow[]>(`/users/${userId}/workflows`);
    return response.data;
  },

  deleteWorkflow: async (workflowId: string): Promise<{success: boolean, message: string}> => {
    const response = await api.delete<{success: boolean, message: string}>(`/workflows/${workflowId}`);
    return response.data;
  },

  // Node operations
  addNode: async (workflowId: string, data: CreateNodeRequest): Promise<WorkflowNode> => {
    const response = await api.post<WorkflowNode>(`/workflows/${workflowId}/nodes`, data);
    return response.data;
  },

  getWorkflowNodes: async (workflowId: string): Promise<WorkflowNode[]> => {
    const response = await api.get<WorkflowNode[]>(`/workflows/${workflowId}/nodes`);
    return response.data;
  },

  deleteNode: async (nodeId: string): Promise<{success: boolean, message: string}> => {
    const response = await api.delete<{success: boolean, message: string}>(`/nodes/${nodeId}`);
    return response.data;
  },

  // Edge operations
  addEdge: async (workflowId: string, data: CreateEdgeRequest): Promise<WorkflowEdge> => {
    const response = await api.post<WorkflowEdge>(`/workflows/${workflowId}/edges`, data);
    return response.data;
  },

  getWorkflowEdges: async (workflowId: string): Promise<WorkflowEdge[]> => {
    const response = await api.get<WorkflowEdge[]>(`/workflows/${workflowId}/edges`);
    return response.data;
  },

  deleteEdge: async (edgeId: string): Promise<{success: boolean, message: string}> => {
    const response = await api.delete<{success: boolean, message: string}>(`/edges/${edgeId}`);
    return response.data;
  },

  // Execution operations
  executeWorkflow: async (workflowId: string, data: ExecuteWorkflowRequest): Promise<{success: boolean, message: string, execution_id: string}> => {
    const response = await api.post<{success: boolean, message: string, execution_id: string}>(`/workflows/${workflowId}/execute`, data);
    return response.data;
  },

  getWorkflowExecution: async (executionId: string): Promise<WorkflowExecution> => {
    const response = await api.get<WorkflowExecution>(`/workflow-executions/${executionId}`);
    return response.data;
  },

  // Agent operations
  getAvailableAgents: async (): Promise<{agents: Record<string, Agent>}> => {
    const response = await api.get<{agents: Record<string, Agent>}>('/workflow-agents');
    return response.data;
  }
};

export default workflowService;