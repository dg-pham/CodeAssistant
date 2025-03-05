// src/components/chat/ChatInterface.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Drawer,
  useMediaQuery,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import {
  getUserConversations,
  getConversation,  // Thêm dòng này
  createConversation,
  addLocalMessage,
  getConversationWithMessages,
  getConversationHistory,
  setCurrentConversation
} from '@/store/slices/conversationSlice';
import { useNavigate } from 'react-router-dom';
import {
  getUserWorkflows,
  executeWorkflow,
  getWorkflowExecution
} from '@/store/slices/workflowSlice';
import { processCode } from '@/store/slices/codeSlice';
import { ConversationList } from '@/components/chat';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import { Message, CodeRequest } from '@/types';
import { Workflow } from '@/api/workflowService';
import WorkflowInputDialog from '@/components/workflow/WorkflowInputDialog';
import api from '@/api/axios-config';

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
  const { workflows } = useSelector((state: RootState) => state.workflow);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [runDialogOpen, setRunDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Workflow related states
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [runWorkflowDialogOpen, setRunWorkflowDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Load conversation if ID is provided
  useEffect(() => {
    if (conversationId && currentUser) {
      // Tải cuộc hội thoại kèm tin nhắn
      dispatch(getConversationWithMessages(conversationId))
        .unwrap()
        .then(() => {
          // Thêm log kiểm tra
          console.log("Loaded messages:", messages);
        })
        .catch((err) => {
          setError('Failed to load conversation: ' + err);
        });
    }
  }, [dispatch, conversationId, currentUser]);

  // Load user's workflows
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserWorkflows(currentUser.id));
    }
  }, [dispatch, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Function to save message to backend
  const saveMessageToHistory = async (messageData) => {
    try {
      // Sử dụng API để lưu tin nhắn
      // Đường dẫn API phải được điều chỉnh theo backend của bạn
      const response = await api.post('/messages', messageData);

      // Sau khi lưu thành công, refresh lại tin nhắn
      if (currentConversation?.id) {
        dispatch(getConversationHistory(currentConversation.id));
      }

      return response.data;
    } catch (err) {
      console.error('Failed to save message to history:', err);
      // Fallback tới hiển thị tin nhắn cục bộ
      dispatch(addLocalMessage(messageData));
      return null;
    }
  };

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

      // Lưu tin nhắn người dùng vào lịch sử
      const userMessageData = {
        conversation_id: conversationId,
        role: 'user',
        content
      };

      // Thử lưu tin nhắn vào backend
      await saveMessageToHistory(userMessageData);

      // Hiển thị tin nhắn ngay lập tức (optimistic update)
      dispatch(addLocalMessage(userMessageData));

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

      // Add the AI's response to history
      if (response && response.result) {
        const assistantMessageData = {
          conversation_id: conversationId,
          role: 'assistant',
          content: response.result
        };

        // Lưu tin nhắn AI vào lịch sử
        await saveMessageToHistory(assistantMessageData);

        // Hiển thị tin nhắn ngay lập tức
        dispatch(addLocalMessage(assistantMessageData));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle selecting a workflow
  const handleSelectWorkflow = (workflowId: string) => {
    if (!workflowId) return;

    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      setSelectedWorkflow(workflow);
      setRunWorkflowDialogOpen(true);
    }

    // Reset select
    setSelectedWorkflowId('');
  };

    const handleRunWorkflowWithInput = async (inputData: any) => {
      if (!selectedWorkflow || !currentUser?.id) return;

      setError(null);
      setIsProcessing(true);

      try {
        // Add user message about running the workflow
        let conversationId = currentConversation?.id;
        let isNewConversation = false;

        if (!conversationId) {
          // Tạo conversation mới với tiêu đề là tên workflow
          isNewConversation = true;
          const newConversation = await dispatch(createConversation({
            user_id: currentUser.id,
            title: `Workflow: ${selectedWorkflow.name}`
          })).unwrap();

          conversationId = newConversation.id;

          dispatch(setCurrentConversation(newConversation));
        }

        // Tạo user message với ID conversation đúng
        const userMessageData = {
          conversation_id: conversationId,
          role: 'user',
          content: `Run workflow "${selectedWorkflow.name}" with input:\n\`\`\`json\n${JSON.stringify(inputData, null, 2)}\n\`\`\``
        };

        // Lưu tin nhắn người dùng vào lịch sử
        await saveMessageToHistory(userMessageData);

        // Hiển thị tin nhắn ngay lập tức
        dispatch(addLocalMessage(userMessageData));

        // Execute the workflow
        const result = await dispatch(executeWorkflow({
          workflowId: selectedWorkflow.id,
          data: {
            user_id: currentUser.id,
            input_data: inputData
          }
        })).unwrap();

        // Get execution details
        if (result.execution_id) {
          const execution = await dispatch(getWorkflowExecution(result.execution_id)).unwrap();

          // Add result to chat history
          const assistantMessageData = {
            conversation_id: conversationId,
            role: 'assistant',
            content: `Kết quả workflow "${selectedWorkflow.name}":\n\`\`\`json\n${JSON.stringify(execution.output_data, null, 2)}\n\`\`\``,
            meta: {
              type: 'workflow_result',
              executionId: result.execution_id,
              workflowId: selectedWorkflow.id,
              workflowName: selectedWorkflow.name
            }
          };

          // Lưu tin nhắn vào lịch sử
          await saveMessageToHistory(assistantMessageData);

          // Hiển thị tin nhắn ngay lập tức
          dispatch(addLocalMessage(assistantMessageData));

          // Nếu là conversation mới, cập nhật URL để khớp với conversation ID
          if (isNewConversation) {
            navigate(`/chat/${conversationId}`);
          }
        }

        setRunWorkflowDialogOpen(false);
      } catch (err: any) {
        setError(err.message || 'Failed to execute workflow');

        // Add error message to chat
        if (conversationId) {
          const errorMessageData = {
            conversation_id: currentConversation.id,
            role: 'system',
            content: `Lỗi khi thực thi workflow: ${err.message || 'Lỗi không xác định'}`
          };

          // Lưu tin nhắn lỗi vào lịch sử
          await saveMessageToHistory(errorMessageData);

          // Hiển thị tin nhắn lỗi ngay lập tức
          dispatch(addLocalMessage(errorMessageData));
        }
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
              {[...messages].reverse().map((message) => (
                <MessageItem key={message.id || `tmp-${message.timestamp}`} message={message} />
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

        {/* Workflow Selector */}
        <Box sx={{ px: 2, mb: 2 }}>
          <FormControl size="small" fullWidth>
            {/* Sửa InputLabel để không bị đè */}
            <InputLabel
              id="workflow-select-label"
              shrink={Boolean(selectedWorkflowId)}
              sx={{
                backgroundColor: theme.palette.background.paper,
                px: 0.5,
                '&.MuiFormLabel-filled': { transform: 'translate(12px, -9px) scale(0.75)' },
                zIndex: 1
              }}
            >
              Chọn Workflow để chạy
            </InputLabel>
            <Select
              labelId="workflow-select-label"
              value={selectedWorkflowId}
              label="Chọn Workflow để chạy"
              onChange={(e) => handleSelectWorkflow(e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Chọn workflow</em>
              </MenuItem>
              {workflows.map((workflow) => (
                <MenuItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

      {/* Workflow Input Dialog */}
      <WorkflowInputDialog
        open={runWorkflowDialogOpen}
        onClose={() => setRunWorkflowDialogOpen(false)}
        onSubmit={handleRunWorkflowWithInput}
        workflow={selectedWorkflow}
        isLoading={isProcessing}
      />
    </Box>
  );
};

export default ChatInterface;