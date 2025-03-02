import React, { useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { getOrCreateAnonymousUser } from '@/store/slices/userSlice';
import { ChatInterface } from '@/components/chat';
import Layout from '@/components/layout/Layout';

const ChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { currentUser, isLoading: userLoading, error: userError } = useSelector((state: RootState) => state.user);

  // Ensure we have a user
  useEffect(() => {
    if (!currentUser && !userLoading) {
      dispatch(getOrCreateAnonymousUser());
    }
  }, [dispatch, currentUser, userLoading]);

  if (userLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (userError) {
    return (
      <Layout>
        <Alert severity="error">
          Error loading user: {userError}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout maxWidth={false} padding={0}>
      <Box sx={{
        height: 'calc(100vh - 64px)', // Subtract header height
        display: 'flex',
        flexDirection: 'column',
        mt: '64px',
        overflow: 'hidden'
      }}>
        <ChatInterface conversationId={conversationId} />
      </Box>
    </Layout>
  );
};

export default ChatPage;