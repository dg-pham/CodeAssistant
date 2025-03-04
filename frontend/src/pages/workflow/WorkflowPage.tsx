import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Drawer
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, useAppDispatch } from '@/store/store';
import {
  getUserWorkflows,
  getWorkflow,
  createWorkflow,
  deleteWorkflow,
  getWorkflowNodes,
  getWorkflowEdges,
  addNode,
  deleteNode,
  addEdge,
  deleteEdge,
  getAvailableAgents,
  updateNodePosition,
  executeWorkflow,
  getWorkflowExecution
} from '@/store/slices/workflowSlice';
import Layout from '@/components/layout/Layout';
import {
  WorkflowList,
  WorkflowEditor,
  ControlPanel,
  ExecutionView,
  CreateWorkflowDialog
} from '@/components/workflow';
import { Workflow, CreateWorkflowRequest } from '@/api/workflowService';

const WorkflowPage: React.FC = () => {
  const { workflowId } = useParams<{ workflowId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    workflows,
    currentWorkflow,
    nodes,
    edges,
    availableAgents,
    executions,
    isLoading,
    error
  } = useSelector((state: RootState) => state.workflow);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [activeExecution, setActiveExecution] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');

  // Load user's workflows
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserWorkflows(currentUser.id));
      dispatch(getAvailableAgents());
    }
  }, [dispatch, currentUser]);

  // Load workflow details when workflowId changes
  useEffect(() => {
    if (workflowId) {
      dispatch(getWorkflow(workflowId));
      dispatch(getWorkflowNodes(workflowId));
      dispatch(getWorkflowEdges(workflowId));
    }
  }, [dispatch, workflowId]);

  // Update workflow name when workflow changes
  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow.name);
    } else {
      setWorkflowName('');
    }
  }, [currentWorkflow]);

  // Handle node drag start
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle selecting a workflow
  const handleSelectWorkflow = (workflow: Workflow) => {
    navigate(`/workflow/${workflow.id}`);
  };

  // Handle creating a new workflow
  const handleCreateWorkflow = async (data: CreateWorkflowRequest) => {
    try {
      const result = await dispatch(createWorkflow(data)).unwrap();
      navigate(`/workflow/${result.id}`);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  // Handle deleting a workflow
  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflowToDelete(workflowId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (workflowToDelete) {
      try {
        await dispatch(deleteWorkflow(workflowToDelete)).unwrap();
        navigate('/workflow');
      } catch (error) {
        console.error('Failed to delete workflow:', error);
      }
    }
    setDeleteDialogOpen(false);
    setWorkflowToDelete(null);
  };

  // Handle adding a node
  const handleAddNode = (nodeType: string, position: { x: number, y: number }) => {
    if (!currentWorkflow) return;

    // Get the agent details
    const agent = availableAgents[nodeType];
    if (!agent) return;

    dispatch(addNode({
      workflowId: currentWorkflow.id,
      data: {
        node_type: nodeType,
        name: agent.name,
        description: agent.description,
        position_x: position.x,
        position_y: position.y,
        config: {}
      }
    }));
  };

  // Handle deleting a node
  const handleDeleteNode = (nodeId: string) => {
    dispatch(deleteNode(nodeId));
  };

  // Handle adding an edge
  const handleAddEdge = (sourceId: string, targetId: string) => {
    if (!currentWorkflow) return;

    dispatch(addEdge({
      workflowId: currentWorkflow.id,
      data: {
        source_id: sourceId,
        target_id: targetId,
        edge_type: 'default'
      }
    }));
  };

  // Handle deleting an edge
  const handleDeleteEdge = (edgeId: string) => {
    dispatch(deleteEdge(edgeId));
  };

  // Handle node position change
  const handleNodePositionChange = (nodeId: string, position: { x: number, y: number }) => {
    dispatch(updateNodePosition({ id: nodeId, position }));
  };

  // Handle running a workflow
  const handleRunWorkflow = async (workflowId: string = currentWorkflow?.id || '') => {
    if (!workflowId || !currentUser) return;

    try {
      const result = await dispatch(executeWorkflow({
        workflowId,
        data: {
          user_id: currentUser.id,
          input_data: {}
        }
      })).unwrap();

      // Get execution details
      if (result.execution_id) {
        await dispatch(getWorkflowExecution(result.execution_id)).unwrap();
        setActiveExecution(result.execution_id);
        setDrawerOpen(true);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
    }
  };

  // Handle saving workflow
  const handleSaveWorkflow = () => {
    // Currently, nodes and edges are automatically saved when added/updated
    // This function would be for additional save operations if needed
    console.log('Workflow saved');
  };

  // Handle workflow name change
  const handleWorkflowNameChange = (name: string) => {
    setWorkflowName(name);
    // TODO: Implement API call to update workflow name
  };

  if (!currentUser) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout maxWidth={false} padding={0}>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', mt: '64px' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Left sidebar - Workflows list */}
          <Grid item xs={12} md={3} lg={2} sx={{ height: '100%', borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Workflows
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCreateDialog(true)}
                >
                  New
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {isLoading && !currentWorkflow ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                  <WorkflowList
                    workflows={workflows}
                    onSelectWorkflow={handleSelectWorkflow}
                    onDeleteWorkflow={handleDeleteWorkflow}
                    onRunWorkflow={handleRunWorkflow}
                    selectedWorkflowId={currentWorkflow?.id}
                  />
                </Box>
              )}
            </Box>

            {/* Create Workflow Dialog */}
            <CreateWorkflowDialog
              open={showCreateDialog}
              onClose={() => setShowCreateDialog(false)}
              onCreateWorkflow={handleCreateWorkflow}
              userId={currentUser.id}
              isLoading={isLoading}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Workflow</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this workflow? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmDelete} color="error">Delete</Button>
              </DialogActions>
            </Dialog>
          </Grid>

          {/* Main content area */}
          <Grid item xs={12} md={9} lg={10} sx={{ height: '100%', display: 'flex' }}>
            {currentWorkflow ? (
              <>
                {/* Control panel */}
                <ControlPanel
                  agents={availableAgents}
                  onDragStart={onDragStart}
                  onSaveWorkflow={handleSaveWorkflow}
                  onRunWorkflow={() => handleRunWorkflow()}
                  workflowName={workflowName}
                  onWorkflowNameChange={handleWorkflowNameChange}
                />

                {/* Flow editor */}
                <Box sx={{ flexGrow: 1, height: '100%' }}>
                  <WorkflowEditor
                    workflowId={currentWorkflow.id}
                    availableAgents={availableAgents}
                    backendNodes={nodes}
                    backendEdges={edges}
                    onAddNode={handleAddNode}
                    onDeleteNode={handleDeleteNode}
                    onAddEdge={handleAddEdge}
                    onDeleteEdge={handleDeleteEdge}
                    onNodePositionChange={handleNodePositionChange}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    maxWidth: 600,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Workflow Builder
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Create and manage custom agent workflows with drag-and-drop simplicity.
                    Build powerful automation by connecting different AI agents together.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateDialog(true)}
                    size="large"
                  >
                    Create Your First Workflow
                  </Button>
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Execution Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { width: '35%' },
          }}
        >
          {activeExecution && executions[activeExecution] && (
            <ExecutionView
              execution={executions[activeExecution]}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </Drawer>
      </Box>
    </Layout>
  );
};

export default WorkflowPage;