import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, Divider, CircularProgress, Drawer, useMediaQuery, IconButton, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import {
  getConversationWithMessages,
  createConversation,
  addLocalMessage
} from '@/store/slices/conversationSlice';
import { processCode } from '@/store/slices/codeSlice';
import { ConversationList } from '@/components/chat';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import { Message, CodeRequest } from '@/types';

interface ChatInterfaceProps {
  conversationId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentConversation, messages, isLoading } = useSelector((state: RootState) => state.conversation);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load conversation if ID is provided
  useEffect(() => {
    if (conversationId && currentUser) {
      dispatch(getConversationWithMessages(conversationId))
        .unwrap()
        .catch((err) => {
          setError('Failed to load conversation: ' + err);
        });
    }
  }, [dispatch, conversationId, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!currentUser) {
      setError('You must be logged in to send messages');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Create conversation if none exists
      let conversationId = currentConversation?.id;

      if (!conversationId) {
        // Create a new conversation
        const newConversation = await dispatch(createConversation({
          user_id: currentUser.id,
          title: content.length > 30 ? `${content.substring(0, 30)}...` : content
        })).unwrap();

        conversationId = newConversation.id;
      }

      // Add message locally for immediate UI update
      dispatch(addLocalMessage({
        conversation_id: conversationId,
        role: 'user',
        content
      }));

      // Determine code action type from message content
      let action: CodeRequest['action'] = 'generate';
      let code: string | undefined;
      let language_from: string | undefined;
      let language_to: string | undefined;

      if (content.toLowerCase().includes('optimize this code') || content.toLowerCase().includes('optimize the following')) {
        action = 'optimize';
        // Try to extract code from content
        const codeMatch = content.match(/```([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          code = codeMatch[1].trim();
        }
      } else if (content.toLowerCase().includes('translate this code') || content.toLowerCase().includes('translate the following')) {
        action = 'translate';
        // Try to extract code and languages
        const codeMatch = content.match(/```([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          code = codeMatch[1].trim();
        }

        // Try to extract languages
        const fromMatch = content.match(/from\s+(\w+)\s+to/i);
        const toMatch = content.match(/to\s+(\w+)/i);

        if (fromMatch && fromMatch[1]) {
          language_from = fromMatch[1].toLowerCase();
        }

        if (toMatch && toMatch[1]) {
          language_to = toMatch[1].toLowerCase();
        }
      } else if (content.toLowerCase().includes('explain this code') || content.toLowerCase().includes('explain the following')) {
        action = 'explain';
        // Try to extract code
        const codeMatch = content.match(/```([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          code = codeMatch[1].trim();
        }
      } else {
        // Default to generate
        action = 'generate';

        // Check if there's a target language specified
        const languageMatch = content.match(/in\s+(\w+)/i);
        if (languageMatch && languageMatch[1]) {
          language_to = languageMatch[1].toLowerCase();
        }
      }

      // Process the code request
      const codeRequest: CodeRequest = {
        action,
        code,
        language_from,
        language_to,
        description: content,
        conversation_id: conversationId,
        user_id: currentUser.id,
      };

      const response = await dispatch(processCode(codeRequest)).unwrap();

      // Add the AI's response locally
      if (response && response.result) {
        dispatch(addLocalMessage({
          conversation_id: conversationId,
          role: 'assistant',
          content: response.result
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Conversation List Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            position: 'relative',
          },
        }}
      >
        <ConversationList
          selectedId={currentConversation?.id}
        />
      </Drawer>

      {/* Chat Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {isMobile && (
            <IconButton
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6">
            {currentConversation ? currentConversation.title : 'New Conversation'}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ m: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Messages Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress />
            </Box>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Welcome to Code Agent
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Start a conversation by asking questions, requesting code examples, or uploading code for analysis.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, pt: 0 }}>
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={isProcessing}
            placeholder="Ask a question or request code..."
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;