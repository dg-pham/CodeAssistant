import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Tooltip, Rating, TextField, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ContentCopy, ThumbUp, ThumbDown, Code } from '@mui/icons-material';
import { submitFeedback } from '@/store/slices/feedbackSlice';
import { setCurrentCode, setLanguage } from '@/store/slices/codeSlice';
import { useNavigate } from 'react-router-dom';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenFeedback = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !currentUser) return;

    setIsFeedbackSubmitting(true);
    try {
      await dispatch(submitFeedback({
        message_id: message.id,
        rating,
        comment: comment || undefined
      })).unwrap();

      // Reset and close feedback form
      setShowFeedback(false);
      setRating(null);
      setComment('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  const handleCopyCode = (code: string, language?: string) => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  const handleLoadCodeToEditor = (code: string, language?: string) => {
    dispatch(setCurrentCode(code));
    if (language) {
      dispatch(setLanguage(language));
    }

    navigate('/code-editor');
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {isUserMessage ? 'You' : 'Code Agent'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </Typography>
        </Box>

        <Box>
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
            <Typography variant="subtitle2">How was this response?</Typography>
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
                Submit
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MessageItem;