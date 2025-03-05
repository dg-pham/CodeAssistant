import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Workflow, WorkflowNode, WorkflowEdge, WorkflowExecution,
  CreateWorkflowRequest, CreateNodeRequest, CreateEdgeRequest, ExecuteWorkflowRequest
} from '@/api/workflowService';
import { workflowService } from '@/api';

// State interface
interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executions: Record<string, WorkflowExecution>;
  availableAgents: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  executions: {},
  availableAgents: {},
  isLoading: false,
  error: null
};

// Async thunks
export const createWorkflow = createAsyncThunk(
  'workflow/createWorkflow',
  async (data: CreateWorkflowRequest, { rejectWithValue }) => {
    try {
      return await workflowService.createWorkflow(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create workflow');
    }
  }
);

export const getWorkflow = createAsyncThunk(
  'workflow/getWorkflow',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      return await workflowService.getWorkflow(workflowId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get workflow');
    }
  }
);

export const getUserWorkflows = createAsyncThunk(
  'workflow/getUserWorkflows',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await workflowService.getUserWorkflows(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user workflows');
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  'workflow/deleteWorkflow',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      const result = await workflowService.deleteWorkflow(workflowId);
      return { success: result.success, id: workflowId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete workflow');
    }
  }
);

export const addNode = createAsyncThunk(
  'workflow/addNode',
  async ({ workflowId, data }: { workflowId: string, data: CreateNodeRequest }, { rejectWithValue }) => {
    try {
      return await workflowService.addNode(workflowId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add node');
    }
  }
);

export const getWorkflowNodes = createAsyncThunk(
  'workflow/getWorkflowNodes',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      return await workflowService.getWorkflowNodes(workflowId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get workflow nodes');
    }
  }
);

export const deleteNode = createAsyncThunk(
  'workflow/deleteNode',
  async (nodeId: string, { rejectWithValue }) => {
    try {
      const result = await workflowService.deleteNode(nodeId);
      return { success: result.success, id: nodeId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete node');
    }
  }
);

export const addEdge = createAsyncThunk(
  'workflow/addEdge',
  async ({ workflowId, data }: { workflowId: string, data: CreateEdgeRequest }, { rejectWithValue }) => {
    try {
      return await workflowService.addEdge(workflowId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add edge');
    }
  }
);

export const getWorkflowEdges = createAsyncThunk(
  'workflow/getWorkflowEdges',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      return await workflowService.getWorkflowEdges(workflowId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get workflow edges');
    }
  }
);

export const deleteEdge = createAsyncThunk(
  'workflow/deleteEdge',
  async (edgeId: string, { rejectWithValue }) => {
    try {
      const result = await workflowService.deleteEdge(edgeId);
      return { success: result.success, id: edgeId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete edge');
    }
  }
);

export const executeWorkflow = createAsyncThunk(
  'workflow/executeWorkflow',
  async ({ workflowId, data }: { workflowId: string, data: ExecuteWorkflowRequest }, { rejectWithValue }) => {
    try {
      return await workflowService.executeWorkflow(workflowId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to execute workflow');
    }
  }
);

export const getWorkflowExecution = createAsyncThunk(
  'workflow/getWorkflowExecution',
  async (executionId: string, { rejectWithValue }) => {
    try {
      return await workflowService.getWorkflowExecution(executionId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get workflow execution');
    }
  }
);

export const getAvailableAgents = createAsyncThunk(
  'workflow/getAvailableAgents',
  async (_, { rejectWithValue }) => {
    try {
      return await workflowService.getAvailableAgents();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get available agents');
    }
  }
);

// Workflow slice
const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
      state.nodes = [];
      state.edges = [];
    },
    updateNodePosition: (state, action: PayloadAction<{ id: string, position: { x: number, y: number } }>) => {
      const { id, position } = action.payload;
      const nodeIndex = state.nodes.findIndex(node => node.id === id);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex].position_x = position.x;
        state.nodes[nodeIndex].position_y = position.y;
      }
    }
  },
  extraReducers: (builder) => {
    // Helper functions
    const setPending = (state: WorkflowState) => {
      state.isLoading = true;
      state.error = null;
    };

    const setRejected = (state: WorkflowState, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    // Create workflow
    builder.addCase(createWorkflow.pending, setPending);
    builder.addCase(createWorkflow.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workflows.push(action.payload);
      state.currentWorkflow = action.payload;
    });
    builder.addCase(createWorkflow.rejected, setRejected);

    // Get workflow
    builder.addCase(getWorkflow.pending, setPending);
    builder.addCase(getWorkflow.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentWorkflow = action.payload;
    });
    builder.addCase(getWorkflow.rejected, setRejected);

    // Get user workflows
    builder.addCase(getUserWorkflows.pending, setPending);
    builder.addCase(getUserWorkflows.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workflows = action.payload;
    });
    builder.addCase(getUserWorkflows.rejected, setRejected);

    // Delete workflow
    builder.addCase(deleteWorkflow.pending, setPending);
    builder.addCase(deleteWorkflow.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workflows = state.workflows.filter(workflow => workflow.id !== action.payload.id);
      if (state.currentWorkflow?.id === action.payload.id) {
        state.currentWorkflow = null;
        state.nodes = [];
        state.edges = [];
      }
    });
    builder.addCase(deleteWorkflow.rejected, setRejected);

    // Add node
    builder.addCase(addNode.pending, setPending);
    builder.addCase(addNode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.nodes.push(action.payload);
    });
    builder.addCase(addNode.rejected, setRejected);

    // Get workflow nodes
    builder.addCase(getWorkflowNodes.pending, setPending);
    builder.addCase(getWorkflowNodes.fulfilled, (state, action) => {
      state.isLoading = false;
      state.nodes = action.payload;
    });
    builder.addCase(getWorkflowNodes.rejected, setRejected);

    // Delete node
    builder.addCase(deleteNode.pending, setPending);
    builder.addCase(deleteNode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.nodes = state.nodes.filter(node => node.id !== action.payload.id);
      // Also remove any connected edges
      state.edges = state.edges.filter(edge =>
        edge.source_id !== action.payload.id && edge.target_id !== action.payload.id
      );
    });
    builder.addCase(deleteNode.rejected, setRejected);

    // Add edge
    builder.addCase(addEdge.pending, setPending);
    builder.addCase(addEdge.fulfilled, (state, action) => {
      state.isLoading = false;
      state.edges.push(action.payload);
    });
    builder.addCase(addEdge.rejected, setRejected);

    // Get workflow edges
    builder.addCase(getWorkflowEdges.pending, setPending);
    builder.addCase(getWorkflowEdges.fulfilled, (state, action) => {
      state.isLoading = false;
      state.edges = action.payload;
    });
    builder.addCase(getWorkflowEdges.rejected, setRejected);

    // Delete edge
    builder.addCase(deleteEdge.pending, setPending);
    builder.addCase(deleteEdge.fulfilled, (state, action) => {
      state.isLoading = false;
      state.edges = state.edges.filter(edge => edge.id !== action.payload.id);
    });
    builder.addCase(deleteEdge.rejected, setRejected);

    // Execute workflow
    builder.addCase(executeWorkflow.pending, setPending);
    builder.addCase(executeWorkflow.fulfilled, (state) => {
      state.isLoading = false;
      // The execution ID is returned, but we'll need to fetch the details separately
    });
    builder.addCase(executeWorkflow.rejected, setRejected);

    // Get workflow execution
    builder.addCase(getWorkflowExecution.pending, setPending);
    builder.addCase(getWorkflowExecution.fulfilled, (state, action) => {
      state.isLoading = false;
      state.executions[action.payload.id] = action.payload;
    });
    builder.addCase(getWorkflowExecution.rejected, setRejected);

    // Get available agents
    builder.addCase(getAvailableAgents.pending, setPending);
    builder.addCase(getAvailableAgents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.availableAgents = action.payload.agents;
    });
    builder.addCase(getAvailableAgents.rejected, setRejected);

    builder.addCase(updateNodeConfig.pending, setPending);
    builder.addCase(updateNodeConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.nodes.findIndex(node => node.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = action.payload;
      }
    });
    builder.addCase(updateNodeConfig.rejected, setRejected);
  }
});

export const updateNodeConfig = createAsyncThunk(
  'workflow/updateNodeConfig',
  async ({ nodeId, config }: { nodeId: string, config: any }, { rejectWithValue }) => {
    try {
      return await workflowService.updateNodeConfig(nodeId, config);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update node configuration');
    }
  }
);

export const { clearCurrentWorkflow, updateNodePosition } = workflowSlice.actions;
export default workflowSlice.reducer;