import React, { useEffect, useState } from 'react';
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
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, useAppDispatch } from '@/store/store';
import {
  getUserTasks,
  getTaskStatus,
  startOrchestration,
  abortTask,
  deleteTask,
  clearCurrentTask
} from '@/store/slices/orchestrationSlice';
import Layout from '@/components/layout/Layout';
import TasksList from '@/components/orchestration/TasksList';
import TaskDetailsCard from '@/components/orchestration/TaskDetailsCard';
import CreateTaskForm from '@/components/orchestration/CreateTaskForm';
import { StartOrchestrationRequest } from '@/api/orchestrationService';

const OrchestrationPage: React.FC = () => {
  const { taskId } = useParams<{ taskId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { tasks, currentTask, isLoading, error } = useSelector((state: RootState) => state.orchestration);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load user's tasks and current task if ID is provided
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserTasks(currentUser.id));
    }
  }, [dispatch, currentUser]);

  // Load task details when taskId changes
  useEffect(() => {
    if (taskId) {
      dispatch(getTaskStatus(taskId));
    } else {
      dispatch(clearCurrentTask());
    }
  }, [dispatch, taskId]);

  // Set up auto-refresh for task status
  useEffect(() => {
    if (currentTask && taskId) {
      // Clear any existing interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Only set up auto-refresh for tasks that are still active
      const isActiveStatus = ['pending', 'in_progress'].includes(currentTask.status);

      if (isActiveStatus) {
        const interval = setInterval(() => {
          dispatch(getTaskStatus(taskId));
        }, 3000); // Refresh every 3 seconds
        setRefreshInterval(interval);
      }
    }

    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [dispatch, currentTask, taskId]);

  const handleSelectTask = (task: any) => {
    navigate(`/orchestration/${task.id}`);
  };

  const handleCreateTask = async (data: StartOrchestrationRequest) => {
    try {
      const result = await dispatch(startOrchestration(data)).unwrap();
      navigate(`/orchestration/${result.task_id}`);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await dispatch(deleteTask(taskToDelete)).unwrap();
        if (currentTask?.task_id === taskToDelete) {
          navigate('/orchestration');
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleAbortTask = async () => {
    if (currentTask) {
      try {
        await dispatch(abortTask({
          task_id: currentTask.task_id,
          reason: 'Aborted by user'
        })).unwrap();

        // Refresh the task status
        dispatch(getTaskStatus(currentTask.task_id));
      } catch (error) {
        console.error('Failed to abort task:', error);
      }
    }
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
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Agent Orchestration
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage and monitor AI agent workflows
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left sidebar - Tasks list */}
          <Grid item xs={12} md={4} lg={3}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Tasks
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateForm(true)}
              >
                New
              </Button>
            </Box>

            {isLoading && !currentTask ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TasksList
                tasks={tasks}
                onSelectTask={handleSelectTask}
                onDeleteTask={handleDeleteTask}
                selectedTaskId={currentTask?.task_id}
              />
            )}

            {/* Create Task Dialog */}
            <Dialog
              open={showCreateForm}
              onClose={() => setShowCreateForm(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Create New Orchestration Task</DialogTitle>
              <DialogContent>
                <CreateTaskForm
                  userId={currentUser.id}
                  onSubmit={handleCreateTask}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Task</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this task? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmDelete} color="error">Delete</Button>
              </DialogActions>
            </Dialog>
          </Grid>

          {/* Main content area */}
          <Grid item xs={12} md={8} lg={9}>
            {currentTask ? (
              <TaskDetailsCard
                task={currentTask}
                onAbort={handleAbortTask}
                isLoading={isLoading}
              />
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '50vh'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Select a task or create a new one
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCreateForm(true)}
                  sx={{ mt: 2 }}
                >
                  Create New Task
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default OrchestrationPage;