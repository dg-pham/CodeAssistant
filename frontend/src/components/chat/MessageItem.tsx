// src/components/chat/MessageItem.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, IconButton, Tooltip, Rating, TextField,
  Button, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { 
  ContentCopy, ThumbUp, ThumbDown, Code, ExpandMore as ExpandMoreIcon 
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, useAppDispatch } from '@/store/store';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { submitFeedback } from '@/store/slices/feedbackSlice';
import { setCurrentCode, setLanguage } from '@/store/slices/codeSlice';
import { feedbackService } from '@/api';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  
  // Check if message is workflow result
  const isWorkflowResult = message.meta?.type === 'workflow_result';

  // Get status color function
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  // Debug log when component renders
  useEffect(() => {
    console.log('MessageItem rendered:', { messageId: message.id, role: message.role });
  }, [message]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Copied to clipboard');
    setSnackbarOpen(true);
  };

  const handleOpenFeedback = async () => {
    console.log('Opening feedback form for message:', message.id);

    try {
      const messageFeedbacks = await feedbackService.getMessageFeedback(message.id);

      if (messageFeedbacks && messageFeedbacks.length > 0) {
        const latestFeedback = messageFeedbacks[0];
        setExistingFeedback(latestFeedback);
        setRating(latestFeedback.rating);
        setComment(latestFeedback.comment || '');
        console.log('Loaded existing feedback:', latestFeedback);
      } else {
        setExistingFeedback(null);
        setRating(null);
        setComment('');
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      setExistingFeedback(null);
      setRating(null);
      setComment('');
    }

    setShowFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !currentUser) {
      console.log('Cannot submit feedback: missing rating or user', { rating, currentUser });
      return;
    }

    setIsFeedbackSubmitting(true);
    console.log('Submitting feedback:', { messageId: message.id, rating, comment });

    try {
      await dispatch(submitFeedback({
        message_id: message.id,
        rating,
        comment: comment || undefined
      })).unwrap();

      console.log('Feedback submitted successfully');

      // Show success state
      setFeedbackSubmitted(true);

      // Close feedback form after 2 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setRating(null);
        setComment('');
        // Reset feedback submitted state after closing
        setTimeout(() => setFeedbackSubmitted(false), 300);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setSnackbarMessage('Failed to submit feedback. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  const handleCopyCode = (code: string, language?: string) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setSnackbarMessage('Code copied to clipboard');
      setSnackbarOpen(true);
    }
  };

  const handleLoadCodeToEditor = (code: string, language?: string) => {
    console.log('Loading code to editor:', { codeLength: code.length, language });
    dispatch(setCurrentCode(code));
    if (language) {
      dispatch(setLanguage(language));
    }

    // Navigate to code editor page with state
    navigate('/code-editor', {
      state: {
        fromChat: true,
        codeLength: code.length,
        language: language || 'text'
      }
    });

    setSnackbarMessage('Code loaded to editor');
    setSnackbarOpen(true);
  };

  // Extract language name from code fence
  const getLanguageFromFence = (fence: string): string => {
    if (!fence || fence.trim() === '') return '';
    return fence.trim();
  };

  const isUserMessage = message.role === 'user';
  const avatarColor = isUserMessage ? 'primary.main' : 'secondary.main';
  const avatarLetter = isUserMessage ? (currentUser?.name?.charAt(0) || 'U') : 'A';

  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        flexDirection: isUserMessage ? 'row-reverse' : 'row'
      }}
    >
      <Avatar
        sx={{
          bgcolor: avatarColor,
          ml: isUserMessage ? 1 : 0,
          mr: isUserMessage ? 0 : 1
        }}
      >
        {avatarLetter}
      </Avatar>

      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '80%',
          backgroundColor: isUserMessage ? 'primary.light' : 'background.paper',
          borderRadius: 2,
        }}
      >
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
            flexWrap: 'nowrap',
            alignItems: 'flex-start'
        }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              flexShrink: 0,
              mr: 1
            }}
          >
            {isUserMessage ? 'You' : 'Code Agent'}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: 'right',
              flexShrink: 0,
              minWidth: '100px'
            }}
          >
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </Typography>
        </Box>

        <Box>
          {isWorkflowResult ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Workflow: {message.meta.workflowName}
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Kết quả workflow</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      backgroundColor: 'background.paper',
                      '& pre': {
                        margin: 0,
                        overflow: 'auto',
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </Paper>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => navigate(`/workflow/${message.meta.workflowId}`)}
                    >
                      Xem chi tiết workflow
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');

                  if (!inline && match) {
                    const language = getLanguageFromFence(match[1]);
                    return (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1,
                            p: 0.5,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: '0 0 0 4px',
                            display: 'flex'
                          }}
                        >
                          <Tooltip title="Copy code">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyCode(code, language)}
                              sx={{ color: 'white' }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Load to editor">
                            <IconButton
                              size="small"
                              onClick={() => handleLoadCodeToEditor(code, language)}
                              sx={{ color: 'white' }}
                            >
                              <Code fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language || 'text'}
                          PreTag="div"
                          wrapLines
                          wrapLongLines
                          {...props}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </Box>
                    );
                  }

                  return inline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          zIndex: 1,
                          p: 0.5,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          borderRadius: '0 0 0 4px'
                        }}
                      >
                        <Tooltip title="Copy code">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(code)}
                            sx={{ color: 'white' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language="text"
                        PreTag="div"
                        wrapLines
                        wrapLongLines
                        {...props}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </Box>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </Box>

        {!isUserMessage && !showFeedback && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Give feedback">
              <IconButton size="small" onClick={handleOpenFeedback}>
                <ThumbUp fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {!isUserMessage && showFeedback && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            {feedbackSubmitted ? (
              // Success message after submission
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="subtitle2" color="success.main">
                  Thank you for your feedback!
                </Typography>
              </Box>
            ) : (
              // Feedback form
              <>
                <Typography variant="subtitle2">
                  {existingFeedback ? 'Update your feedback' : 'How was this response?'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                    precision={1}
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {rating ? `${rating}/5` : 'Rate this response'}
                  </Typography>
                </Box>
                <TextField
                  multiline
                  fullWidth
                  rows={2}
                  size="small"
                  placeholder="Additional comments (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={() => setShowFeedback(false)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSubmitFeedback}
                    disabled={!rating || isFeedbackSubmitting}
                  >
                    {isFeedbackSubmitting ? 'Submitting...' : existingFeedback ? 'Update' : 'Submit'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessageItem;