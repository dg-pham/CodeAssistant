import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
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
  getUserMergeSessions,
  getMergeSession,
  getSessionConflicts,
  createMergeSession,
  resolveConflict,
  completeMerge,
  deleteMergeSession,
  clearCurrentSession
} from '@/store/slices/gitMergeSlice';
import Layout from '@/components/layout/Layout';
import SessionsList from '@/components/git/SessionsList';
import SessionStatusCard from '@/components/git/SessionStatusCard';
import ConflictViewer from '@/components/git/ConflictViewer';
import CreateSessionForm from '@/components/git/CreateSessionForm';
import { CreateMergeSessionRequest } from '@/api/gitMergeService';

const GitMergePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { sessions, currentSession, conflicts, isLoading, error } = useSelector((state: RootState) => state.gitMerge);

  const [tabValue, setTabValue] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load user's sessions and current session if ID is provided
  useEffect(() => {
      if (currentUser) {
        const interval = setInterval(() => {
          dispatch(getUserMergeSessions(currentUser.id));
        }, 1000); // Refresh every 10 seconds

        return () => clearInterval(interval);
      }
    }, [dispatch, currentUser]);

  // Load session details and conflicts when sessionId changes
  useEffect(() => {
    if (sessionId) {
      dispatch(getMergeSession(sessionId));
      dispatch(getSessionConflicts(sessionId));
    } else {
      dispatch(clearCurrentSession());
    }
  }, [dispatch, sessionId]);

  // Set up auto-refresh for session status
  useEffect(() => {
    if (currentSession) {
      // Clear any existing interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Only set up auto-refresh for sessions that are still active
      const isActiveStatus = [
        'pending',
        'in_progress',
        'analyzing_conflicts',
        'ready_for_resolution',
        'ready_for_merge',
        'merging'
      ].includes(currentSession.status);

      if (isActiveStatus) {
        const interval = setInterval(() => {
          dispatch(getMergeSession(currentSession.id));
          dispatch(getSessionConflicts(currentSession.id));
        }, 5000); // Refresh every 5 seconds
        setRefreshInterval(interval);
      }
    }

    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [dispatch, currentSession]);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectSession = (session: any) => {
    navigate(`/git-merge/${session.id}`);
  };

  const handleCreateSession = async (data: CreateMergeSessionRequest) => {
    try {
      const result = await dispatch(createMergeSession(data)).unwrap();
      navigate(`/git-merge/${result.id}`);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (sessionToDelete) {
      try {
        await dispatch(deleteMergeSession(sessionToDelete)).unwrap();
        if (currentSession?.id === sessionToDelete) {
          navigate('/git-merge');
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleResolveConflict = async (conflictId: string, resolvedContent: string, strategy: string) => {
    try {
      await dispatch(resolveConflict({
        conflict_id: conflictId,
        resolved_content: resolvedContent,
        resolution_strategy: strategy
      })).unwrap();

      // Refresh the conflicts after resolution
      if (currentSession) {
        dispatch(getSessionConflicts(currentSession.id));
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const handleCompleteMerge = async () => {
    if (currentSession) {
      try {
        await dispatch(completeMerge({
          session_id: currentSession.id
        })).unwrap();

        // Refresh the session status
        dispatch(getMergeSession(currentSession.id));
          if (currentUser) {
            dispatch(getUserMergeSessions(currentUser.id));
          }
      } catch (error) {
        console.error('Failed to complete merge:', error);
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
          Git Merge Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage and resolve Git merge conflicts with AI assistance
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left sidebar - Sessions list */}
          <Grid item xs={12} md={4} lg={3}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Merge Sessions
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateForm(true)}
              >
                New
              </Button>
            </Box>

            {isLoading && !currentSession ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <SessionsList
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                selectedSessionId={currentSession?.id}
              />
            )}

            {/* Create Session Dialog */}
            <Dialog
              open={showCreateForm}
              onClose={() => setShowCreateForm(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Create New Merge Session</DialogTitle>
              <DialogContent>
                <CreateSessionForm
                  userId={currentUser.id}
                  onSubmit={handleCreateSession}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Merge Session</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this merge session? This action cannot be undone.
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
            {currentSession ? (
              <Box>
                {/* Session Status Card */}
                <SessionStatusCard
                  session={currentSession}
                  conflicts={conflicts}
                  onCompleteMerge={handleCompleteMerge}
                  isLoading={isLoading}
                />

                {/* Tabs for different views */}
                <Paper variant="outlined" sx={{ mb: 3 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleChangeTab}
                    variant="fullWidth"
                  >
                    <Tab label="Conflicts" />
                    <Tab label="Repository Info" />
                  </Tabs>

                  {/* Conflicts Tab */}
                  <Box sx={{ p: 2, display: tabValue === 0 ? 'block' : 'none' }}>
                    {isLoading && conflicts.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : conflicts.length > 0 ? (
                      conflicts.map(conflict => (
                        <ConflictViewer
                          key={conflict.id}
                          conflict={conflict}
                          onResolve={handleResolveConflict}
                          isLoading={isLoading}
                        />
                      ))
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          {currentSession.status === 'pending' || currentSession.status === 'in_progress' || currentSession.status === 'analyzing_conflicts'
                            ? 'Analyzing repository for conflicts...'
                            : currentSession.status === 'completed'
                            ? 'No conflicts found or all conflicts resolved.'
                            : 'No conflicts found.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Repository Info Tab */}
                  <Box sx={{ p: 2, display: tabValue === 1 ? 'block' : 'none' }}>
                    <Typography variant="h6" gutterBottom>
                      Repository Details
                    </Typography>
                    <Typography variant="body1">
                      <strong>URL:</strong> {currentSession.repository_url}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Base Branch:</strong> {currentSession.base_branch}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Target Branch:</strong> {currentSession.target_branch}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Status:</strong> {currentSession.status}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Created:</strong> {new Date(currentSession.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Last Updated:</strong> {new Date(currentSession.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
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
                  Select a merge session or create a new one
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCreateForm(true)}
                  sx={{ mt: 2 }}
                >
                  Create New Merge Session
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default GitMergePage;