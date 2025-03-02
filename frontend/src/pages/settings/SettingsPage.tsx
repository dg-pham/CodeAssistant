import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Button,
  IconButton,
  Slider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  BrightnessMedium as ThemeIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, useAppDispatch } from '@/store/store';
import { getOrCreateAnonymousUser } from '@/store/slices/userSlice';
import { getUserMemories, forgetMemory, updateMemoryPriority } from '@/store/slices/memorySlice';
import { formatDateTime } from '@/utils/formatters';
import Layout from '@/components/layout/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Memory } from '@/types';
import { useThemeContext } from '@/contexts/ThemeContext';
import { clearCurrentUser } from '@/store/slices/userSlice';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, isLoading: userLoading, error: userError } = useSelector((state: RootState) => state.user);
  const { memories, contextMemories, isLoading: memoriesLoading, error: memoriesError } = useSelector((state: RootState) => state.memory);

  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const { darkMode, toggleDarkMode } = useThemeContext();
  const [username, setUsername] = useState('');
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);

  // Ensure we have a user
  useEffect(() => {
    if (!currentUser && !userLoading) {
      dispatch(getOrCreateAnonymousUser());
    }
  }, [dispatch, currentUser, userLoading]);

  // Set username from current user
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.name);
    }
  }, [currentUser]);

  // Load memories when user is available
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserMemories({ userId: currentUser.id }));
    }
  }, [dispatch, currentUser]);

  // Filter memories based on selected context
  useEffect(() => {
    if (selectedContext) {
      // Filter memories by context
      const contextFiltered = memories.filter(memory =>
        memory.context && memory.context.includes(selectedContext)
      );
      setFilteredMemories(contextFiltered);
    } else {
      setFilteredMemories(memories);
    }
  }, [memories, selectedContext]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');

    if (tabParam === 'memory') {
      setTabValue(1);
    }
  }, [location]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const handleUpdateUsername = () => {
    // This would update the username in backend
    // For now, just log it
    console.log('Update username to:', username);
  };

  const handleDeleteMemory = (key: string) => {
    setMemoryToDelete(key);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentUser?.id && memoryToDelete) {
      dispatch(forgetMemory({ userId: currentUser.id, key: memoryToDelete }));
    }
    setDeleteDialogOpen(false);
    setMemoryToDelete(null);
  };

  const handlePriorityChange = (key: string, newValue: number) => {
    if (currentUser?.id) {
      dispatch(updateMemoryPriority({
        userId: currentUser.id,
        key,
        priority: newValue
      }));
    }
  };

  const handleLogout = () => {
    dispatch(clearCurrentUser());
    navigate('/login');
  };

  const handleContextSelect = (context: string | null) => {
    setSelectedContext(context);
  };

  // Get unique contexts from memories
  const getUniqueContexts = (): string[] => {
    const contexts = memories
      .map(memory => memory.context)
      .filter((context): context is string => !!context);

    return [...new Set(contexts)];
  };

  // Get a color for a context
  const getContextColor = (context: string) => {
    const colors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
    const hash = context.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length] as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };

  if (userLoading || memoriesLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const error = userError || memoriesError;

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your preferences and view agent memory.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mt: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="settings tabs"
          >
            <Tab label="User Preferences" />
            <Tab label="Agent Memory" />
            <Tab label="About" />
          </Tabs>

          {/* User Preferences Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Profile Settings
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <TextField
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                    />

                    <Button
                      variant="contained"
                      onClick={handleUpdateUsername}
                    >
                      Update Username
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Logout
                    </Button>

                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Appearance
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={darkMode}
                          onChange={handleDarkModeToggle}
                          color="primary"
                        />
                      }
                      label="Dark Mode"
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Toggle between light and dark theme. Changes will apply immediately.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Agent Memory Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Agent Memory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                These are the preferences and patterns the AI has learned about you. You can manage them to influence how the AI interacts with you.
              </Typography>
            </Box>

            {/* Context Filter */}
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All Memories"
                color={selectedContext === null ? 'primary' : 'default'}
                onClick={() => handleContextSelect(null)}
                variant={selectedContext === null ? 'filled' : 'outlined'}
              />

              {getUniqueContexts().map((context) => (
                <Chip
                  key={context}
                  label={context}
                  color={selectedContext === context ? getContextColor(context) : 'default'}
                  onClick={() => handleContextSelect(context)}
                  variant={selectedContext === context ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {/* Memory List */}
            {filteredMemories.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No memories found. The AI will learn about your preferences as you interact with it.
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredMemories.map((memory) => (
                  <Paper
                      key={memory.id}
                      variant="outlined"
                      sx={{ mb: 2, borderLeft: memory.context ? `4px solid ${getContextColor(memory.context)}` : undefined }}
                    >
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {memory.key.replace(/_/g, ' ')}
                              </Typography>
                              {memory.context && (
                                <Chip
                                  label={memory.context}
                                  size="small"
                                  color={getContextColor(memory.context) as any}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {memory.value}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Last updated: {formatDateTime(memory.updated_at)}
                              </Typography>
                            </>
                          }
                          sx={{ width: '100%', mb: 2 }}
                        />

                        {/* Phần priority controls - chuyển xuống dưới và sử dụng chiều rộng đầy đủ */}
                        <Box sx={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Typography variant="caption" sx={{ width: 80 }}>
                              Priority: {(memory.priority * 100).toFixed(0)}%
                            </Typography>
                            <Box sx={{ flex: 1, mx: 2, maxWidth: 200 }}>
                              <Slider
                                value={memory.priority}
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={(_e, value) =>
                                  handlePriorityChange(memory.key, Array.isArray(value) ? value[0] : value)
                                }
                              />
                            </Box>
                          </Box>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteMemory(memory.key)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    </Paper>
                ))}
              </List>
            )}
          </TabPanel>

          {/* About Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom>
                Code Agent
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Version 1.0.0
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                An intelligent AI assistant for code generation, optimization, translation, and explanation.
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Key Features
                </Typography>
                <Typography variant="body2">
                  • AI-powered code generation<br />
                  • Code optimization and translation<br />
                  • Code explanations and insights<br />
                  • Personalized learning<br />
                  • Conversation history<br />
                  • Code snippet management
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Memory</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this memory? The AI will no longer consider this preference when interacting with you.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SettingsPage;