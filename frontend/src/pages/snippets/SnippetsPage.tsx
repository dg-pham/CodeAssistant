import React, { useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { getOrCreateAnonymousUser } from '@/store/slices/userSlice';
import { getUserCodeSnippets } from '@/store/slices/codeSlice';
import { SnippetList } from '@/components/code';
import Layout from '@/components/layout/Layout';
import { CodeSnippet } from '@/types';

const SnippetsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, isLoading: userLoading, error: userError } = useSelector((state: RootState) => state.user);
  const { isProcessing: snippetsLoading, error: snippetsError } = useSelector((state: RootState) => state.code);

  // Ensure we have a user
  useEffect(() => {
    if (!currentUser && !userLoading) {
      dispatch(getOrCreateAnonymousUser());
    }
  }, [dispatch, currentUser, userLoading]);

  // Load snippets when user is available
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserCodeSnippets({ userId: currentUser.id }));
    }
  }, [dispatch, currentUser]);

  const handleOpenInEditor = (snippet: CodeSnippet) => {
    navigate('/code-editor', { state: { snippet } });
  };

  if (userLoading || snippetsLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const error = userError || snippetsError;

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Code Snippets
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your saved code snippets and reuse them in your projects.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4 }}>
          <SnippetList onOpenInEditor={handleOpenInEditor} />
        </Box>
      </Box>
    </Layout>
  );
};

export default SnippetsPage;