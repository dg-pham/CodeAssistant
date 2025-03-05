import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, IconButton, Tooltip, Rating, TextField,
  Button, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails, Chip,
  List, ListItem, ListItemText, Divider, Card, CardContent
} from '@mui/material';
import {
  ContentCopy, ThumbUp, ThumbDown, Code, ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon
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

// Function to get a better result label based on agent type
const getResultLabel = (agentType) => {
  switch (agentType) {
    case 'requirements_analyzer':
      return 'Requirements Analysis';
    case 'code_generator':
      return 'Generated Code';
    case 'code_optimizer':
      return 'Optimized Code';
    case 'code_analyzer':
      return 'Code Analysis';
    case 'performance_optimizer':
      return 'Performance Recommendations';
    case 'quality_checker':
      return 'Quality Assessment';
    case 'language_translator':
      return 'Translated Code';
    case 'git_analyzer':
      return 'Repository Analysis';
    case 'conflict_resolver':
      return 'Conflict Resolution';
    case 'code_understander':
      return 'Code Understanding';
    default:
      return 'Analysis Result';
  }
};

// Helper function to extract code blocks from markdown content
const extractCodeBlocks = (content) => {
  if (!content) return [];

  const regex = /```(\w+)?\n([\s\S]+?)\n```/g;
  const codeBlocks = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2]
    });
  }

  return codeBlocks;
};

// Component hiển thị kết quả workflow theo dạng thân thiện
const WorkflowResultContent = ({ content, meta, onCopyCode, onLoadToEditor }) => {
  // Parse content từ markdown có chứa JSON
  const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/);
  let jsonData = null;

  try {
    if (jsonMatch && jsonMatch[1]) {
      jsonData = JSON.parse(jsonMatch[1]);
    }
  } catch (e) {
    console.error("Failed to parse JSON from workflow result", e);
  }

  // Get code blocks from the content
  const codeBlocks = extractCodeBlocks(content);

  // Render code block with syntax highlighting and copy button
  const renderCodeBlock = (code, language, index) => (
    <Box key={index} sx={{ position: 'relative', mb: 2 }}>
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
            onClick={() => onCopyCode(code, language)}
            sx={{ color: 'white' }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Load to editor">
          <IconButton
            size="small"
            onClick={() => onLoadToEditor(code, language)}
            sx={{ color: 'white' }}
          >
            <Code fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        showLineNumbers={true}
        wrapLines
        customStyle={{ fontSize: '0.85rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  );

  if (jsonData) {
    return (
      <Box sx={{ mt: 2 }}>
        {Object.entries(jsonData).map(([key, value]) => {
          // Bỏ qua một số trường không cần hiển thị
          if (key === 'status' || key === 'message') return null;

          // Get a better label for the result_text field
          let displayKey = key;
          if (key === 'result_text') {
            const agentType = meta?.agentType || '';
            displayKey = getResultLabel(agentType);
          } else {
            // Format other keys
            displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          }

          return (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {displayKey}
              </Typography>

              {typeof value === 'string' ? (
                <Box>
                  {/* Check if the value contains code blocks */}
                  {value.includes('```') ? (
                    <Box>
                      {/* Render text before code blocks */}
                      {value.split(/```(\w+)?\n[\s\S]+?\n```/).map((part, i) =>
                        part && part.trim() ? (
                          <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                            {part}
                          </Typography>
                        ) : null
                      )}

                      {/* Render code blocks */}
                      {extractCodeBlocks(value).map((block, index) =>
                        renderCodeBlock(block.code, block.language, index)
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2">{value}</Typography>
                  )}
                </Box>
              ) : Array.isArray(value) ? (
                <Box component="ul" sx={{ pl: 2 }}>
                  {value.map((item, index) => (
                    <Typography component="li" key={index} variant="body2">
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </Typography>
                  ))}
                </Box>
              ) : typeof value === 'object' && value !== null ? (
                <Card variant="outlined" sx={{ mb: 1, backgroundColor: 'background.paper' }}>
                  <CardContent sx={{ '&:last-child': { pb: 2 }, py: 1 }}>
                    {Object.entries(value).map(([innerKey, innerValue]) => (
                      <Box key={innerKey} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {innerKey.charAt(0).toUpperCase() + innerKey.slice(1).replace(/_/g, ' ')}:
                        </Typography>
                        {typeof innerValue === 'string' ? (
                          innerKey === 'implementation' || innerKey === 'code' ? (
                            <Box sx={{ position: 'relative', my: 1 }}>
                              <SyntaxHighlighter
                                language="javascript"
                                style={vscDarkPlus}
                                customStyle={{ fontSize: '0.85rem' }}
                                showLineNumbers={true}
                              >
                                {innerValue}
                              </SyntaxHighlighter>
                            </Box>
                          ) : (
                            <Typography variant="body2">{innerValue}</Typography>
                          )
                        ) : (
                          <Typography variant="body2">{JSON.stringify(innerValue, null, 2)}</Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Typography variant="body2">{String(value)}</Typography>
              )}
            </Box>
          );
        })}
      </Box>
    );
  }

  // Hiển thị codeBlocks nếu có
  if (codeBlocks.length > 0) {
    return (
      <Box>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const code = String(children).replace(/\n$/, '');

              if (!inline && match) {
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
                          onClick={() => onCopyCode(code, match[1])}
                          sx={{ color: 'white' }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Load to editor">
                        <IconButton
                          size="small"
                          onClick={() => onLoadToEditor(code, match[1])}
                          sx={{ color: 'white' }}
                        >
                          <Code fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      showLineNumbers={true}
                      wrapLines
                      wrapLongLines
                      customStyle={{
                        margin: '0',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </Box>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
    );
  }

  // Fallback khi không thể parse JSON hoặc hiển thị code
  return (
    <Typography variant="body1">
      {content}
    </Typography>
  );
};

// CodeContentRenderer component - ensures consistent code rendering across the app
const CodeContentRenderer = ({ content, onCopyCode, onLoadToEditor }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');

          // Xác định ngôn ngữ: từ class hoặc tự động đoán
          let language = match ? match[1] : '';

          // Tự động phát hiện ngôn ngữ nếu không có chỉ định
          if (!language && code.length > 0) {
            // Đơn giản hóa: kiểm tra một số từ khóa phổ biến
            if (code.includes('def ') || code.includes('import ') && code.includes(':')) {
              language = 'python';
            } else if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
              language = 'javascript';
            } else if (code.includes('public class') || code.includes('private ')) {
              language = 'java';
            }
          }

          if (!inline) {
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
                      onClick={() => onCopyCode(code, language)}
                      sx={{ color: 'white' }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Load to editor">
                    <IconButton
                      size="small"
                      onClick={() => onLoadToEditor(code, language)}
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
                  showLineNumbers={true}
                  wrapLines
                  wrapLongLines
                  customStyle={{
                    margin: '0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    padding: '16px',
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </Box>
            );
          }

          return inline ? (
            <code className={className} {...props} style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '2px 4px', borderRadius: '3px' }}>
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
                    onClick={() => onCopyCode(code)}
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
                showLineNumbers={true}
                wrapLines
                wrapLongLines
                customStyle={{
                  margin: '0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  padding: '16px',
                }}
                {...props}
              >
                {code}
              </SyntaxHighlighter>
            </Box>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming = false }) => {
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
    console.log('MessageItem rendered:', { messageId: message.id, role: message.role, meta: message.meta });
  }, [message]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .typing-indicator {
        display: inline-block;
        position: relative;
        width: 16px;
        height: 16px;
      }
      .typing-indicator::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        height: 100%;
        width: 3px;
        background-color: #3f51b5;
        animation: blink 1s infinite;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Hiển thị nội dung với streaming indicator
  const renderContent = () => {
    if (isWorkflowResult) {
      return (
        <WorkflowResultContent
          content={message.content}
          meta={message.meta}
          onCopyCode={handleCopyCode}
          onLoadToEditor={handleLoadCodeToEditor}
        />
      );
    } else {
      return (
        <Box>
          <CodeContentRenderer
            content={message.content}
            onCopyCode={handleCopyCode}
            onLoadToEditor={handleLoadCodeToEditor}
          />
          {isStreaming && (
            <Box sx={{ display: 'inline-block', ml: 1 }}>
              <span className="typing-indicator"></span>
            </Box>
          )}
        </Box>
      );
    }
  };

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
          {renderContent()}
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