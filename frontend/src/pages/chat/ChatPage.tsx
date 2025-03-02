import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, CircularProgress, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { getOrCreateAnonymousUser } from '@/store/slices/userSlice';
import { getConversationWithMessages, clearCurrentConversation } from '@/store/slices/conversationSlice';
import { ChatInterface } from '@/components/chat';
import Layout from '@/components/layout/Layout';

const ChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { currentUser, isLoading: userLoading, error: userError } = useSelector((state: RootState) => state.user);
  const { currentConversation, isLoading: conversationLoading, error: conversationError } = useSelector((state: RootState) => state.conversation);

  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Ensure we have a user
  useEffect(() => {
    if (!currentUser && !userLoading) {
      dispatch(getOrCreateAnonymousUser());
    }
  }, [dispatch, currentUser, userLoading]);

  // Load the conversation when conversationId changes
  useEffect(() => {
    if (conversationId && currentUser) {
      console.log("Loading conversation:", conversationId);

      dispatch(getConversationWithMessages(conversationId))
        .unwrap()
        .then(() => {
          console.log("Successfully loaded conversation with messages");
        })
        .catch((err) => {
          console.error("Error loading conversation:", err);
          setError(`Failed to load conversation: ${err}`);
          setSnackbarMessage('Could not load conversation. It may have been deleted.');
          setSnackbarOpen(true);
        });
    } else if (!conversationId) {
      // Clear current conversation if no ID is provided
      dispatch(clearCurrentConversation());
    }

    // Cleanup function to clear current conversation when unmounting
    return () => {
      if (!conversationId) {
        dispatch(clearCurrentConversation());
      }
    };
  }, [dispatch, conversationId, currentUser]);

  // Handle errors from global state
  useEffect(() => {
    if (userError) {
      setError(userError);
    } else if (conversationError) {
      setError(conversationError);
    } else {
      setError(null);
    }
  }, [userError, conversationError]);

  if (userLoading) {
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
      <Box sx={{
        height: 'calc(100vh - 64px)', // Subtract header height
        display: 'flex',
        flexDirection: 'column',
        mt: '64px',
        overflow: 'hidden'
      }}>
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <ChatInterface conversationId={conversationId} />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Layout>
  );
};

export default ChatPage;