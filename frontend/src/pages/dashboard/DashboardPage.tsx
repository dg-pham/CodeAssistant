import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  Code as CodeIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Merge as MergeIcon,         // Thêm icon mới
  AccountTree as OrchestratorIcon   // Thêm icon mới
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { getUserConversations } from '@/store/slices/conversationSlice';
import { getUserCodeSnippets } from '@/store/slices/codeSlice';
import { getUserMergeSessions } from '@/store/slices/gitMergeSlice';   // Thêm mới
import { getUserTasks } from '@/store/slices/orchestrationSlice';   // Thêm mới
import { getUserMemories } from '@/store/slices/memorySlice';
import { formatDate } from '@/utils/formatters';
import Layout from '@/components/layout/Layout';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { conversations, isLoading: conversationsLoading } = useSelector((state: RootState) => state.conversation);
  const { snippets, isLoading: snippetsLoading } = useSelector((state: RootState) => state.code);
  const { memories, isLoading: memoriesLoading } = useSelector((state: RootState) => state.memory);
  const { sessions, isLoading: sessionsLoading } = useSelector((state: RootState) => state.gitMerge);   // Thêm mới
  const { tasks, isLoading: tasksLoading } = useSelector((state: RootState) => state.orchestration);   // Thêm mới

  const [stats, setStats] = useState({
    totalConversations: 0,
    totalSnippets: 0,
    totalMemories: 0,
    totalMergeSessions: 0,    // Thêm mới
    totalTasks: 0             // Thêm mới
  });

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserConversations(currentUser.id));
      dispatch(getUserCodeSnippets({ userId: currentUser.id }));
      dispatch(getUserMemories({ userId: currentUser.id }));
      dispatch(getUserMergeSessions(currentUser.id));      // Thêm mới
      dispatch(getUserTasks(currentUser.id));              // Thêm mới
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    setStats({
      totalConversations: conversations.length,
      totalSnippets: snippets.length,
      totalMemories: memories.length,
      totalMergeSessions: sessions.length,     // Thêm mới
      totalTasks: tasks.length                 // Thêm mới
    });
  }, [conversations, snippets, memories, sessions, tasks]);

  const isLoading = conversationsLoading || snippetsLoading || memoriesLoading || sessionsLoading || tasksLoading;

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Welcome{currentUser ? `, ${currentUser.name}` : ''}! Here's an overview of your activity.
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ChatIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Conversations
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {stats.totalConversations}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigateTo('/chat')}
                    >
                      View All
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CodeIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Code Snippets
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {stats.totalSnippets}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigateTo('/snippets')}
                    >
                      View All
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Thêm mới: Card Git Merge Sessions */}
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MergeIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Git Merges
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {stats.totalMergeSessions}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigateTo('/git-merge')}
                    >
                      View All
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Thêm mới: Card Orchestration Tasks */}
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.secondary.main}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <OrchestratorIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Agent Tasks
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {stats.totalTasks}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigateTo('/orchestration')}
                    >
                      View All
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.success.main}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Agent Memory
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {stats.totalMemories}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigateTo('/settings?tab=memory')}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activity */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Recent Activity
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6">
                      Recent Conversations
                    </Typography>
                  </Box>

                  {conversations.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No conversations yet
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigateTo('/chat')}
                      >
                        Start a Conversation
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {conversations.slice(0, 5).map((conversation) => (
                        <React.Fragment key={conversation.id}>
                          <ListItem
                            button
                            onClick={() => navigateTo(`/chat/${conversation.id}`)}
                          >
                            <ListItemText
                              primary={conversation.title}
                              secondary={conversation.updated_at ? formatDate(conversation.updated_at) : 'No date'}
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                      {conversations.length > 5 && (
                        <ListItem
                          button
                          onClick={() => navigateTo('/chat')}
                          sx={{ justifyContent: 'center' }}
                        >
                          <Typography color="primary">
                            View All Conversations
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6">
                      Recent Code Snippets
                    </Typography>
                  </Box>

                  {snippets.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No code snippets yet
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigateTo('/snippets')}
                      >
                        Create a Snippet
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {snippets.slice(0, 5).map((snippet) => (
                        <React.Fragment key={snippet.id}>
                          <ListItem
                            button
                            onClick={() => navigateTo(`/snippets/${snippet.id}`)}
                          >
                            <ListItemText
                              primary={snippet.description || 'Untitled Snippet'}
                              secondary={`${snippet.language} - ${formatDate(snippet.created_at)}`}
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                      {snippets.length > 5 && (
                        <ListItem
                          button
                          onClick={() => navigateTo('/snippets')}
                          sx={{ justifyContent: 'center' }}
                        >
                          <Typography color="primary">
                            View All Snippets
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* Thêm mới: Recent Git Merge Sessions */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6">
                      Recent Git Merge Sessions
                    </Typography>
                  </Box>

                  {sessions.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No git merge sessions yet
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigateTo('/git-merge')}
                      >
                        Create a Merge Session
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {sessions.slice(0, 5).map((session) => (
                        <React.Fragment key={session.id}>
                          <ListItem
                            button
                            onClick={() => navigateTo(`/git-merge/${session.id}`)}
                          >
                            <ListItemText
                              primary={`${session.base_branch} ← ${session.target_branch}`}
                              secondary={`Status: ${session.status} - ${formatDate(session.updated_at)}`}
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                      {sessions.length > 5 && (
                        <ListItem
                          button
                          onClick={() => navigateTo('/git-merge')}
                          sx={{ justifyContent: 'center' }}
                        >
                          <Typography color="primary">
                            View All Merge Sessions
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* Thêm mới: Recent Orchestration Tasks */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6">
                      Recent Agent Tasks
                    </Typography>
                  </Box>

                  {tasks.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No agent tasks yet
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigateTo('/orchestration')}
                      >
                        Create a Task
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {tasks.slice(0, 5).map((task) => (
                        <React.Fragment key={task.id}>
                          <ListItem
                            button
                            onClick={() => navigateTo(`/orchestration/${task.id}`)}
                          >
                            <ListItemText
                              primary={task.task_type}
                              secondary={`Status: ${task.status} - ${formatDate(task.updated_at)}`}
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                      {tasks.length > 5 && (
                        <ListItem
                          button
                          onClick={() => navigateTo('/orchestration')}
                          sx={{ justifyContent: 'center' }}
                        >
                          <Typography color="primary">
                            View All Tasks
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Quick Actions
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ChatIcon />}
                  onClick={() => navigateTo('/chat')}
                  sx={{
                    py: 2,
                    height: '100%',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  New Chat
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CodeIcon />}
                  onClick={() => navigateTo('/code-editor')}
                  sx={{
                    py: 2,
                    height: '100%',
                    backgroundColor: theme.palette.info.main,
                    '&:hover': {
                      backgroundColor: theme.palette.info.dark,
                    },
                  }}
                >
                  Code Editor
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CodeIcon />}
                  onClick={() => navigateTo('/snippets')}
                  sx={{
                    py: 2,
                    height: '100%',
                    backgroundColor: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                    },
                  }}
                >
                  Manage Snippets
                </Button>
              </Grid>

              {/* Thêm mới: Git Merge Quick Action */}
              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MergeIcon />}
                  onClick={() => navigateTo('/git-merge')}
                  sx={{
                    py: 2,
                    height: '100%',
                    backgroundColor: theme.palette.warning.main,
                    '&:hover': {
                      backgroundColor: theme.palette.warning.dark,
                    },
                  }}
                >
                  Git Merge
                </Button>
              </Grid>

              {/* Thêm mới: Orchestration Quick Action */}
              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<OrchestratorIcon />}
                  onClick={() => navigateTo('/orchestration')}
                  sx={{
                    py: 2,
                    height: '100%',
                    backgroundColor: theme.palette.secondary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                    },
                  }}
                >
                  Agent Tasks
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<HistoryIcon />}
                  onClick={() => navigateTo('/settings')}
                  sx={{
                    py: 2,
                    height: '100%',
                    backgroundColor: theme.palette.grey[700],
                    '&:hover': {
                      backgroundColor: theme.palette.grey[800],
                    },
                  }}
                >
                  Settings
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default DashboardPage;