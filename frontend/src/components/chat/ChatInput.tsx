import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Tooltip, Paper, Select, MenuItem } from '@mui/material';
import { Send, AttachFile, Code } from '@mui/icons-material';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
  defaultValue?: string;
  showCodeOptions?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  loading = false,
  placeholder = 'Type your message...',
  defaultValue = '',
  showCodeOptions = true,
}) => {
  const [message, setMessage] = useState(defaultValue);
  const [codeAction, setCodeAction] = useState<string>('generate');
  const [showCodeMenu, setShowCodeMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSend = () => {
    if (message.trim() && !loading) {
      onSendMessage(message.trim());
      setMessage('');
      setShowCodeMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCodeButtonClick = () => {
    setShowCodeMenu(!showCodeMenu);
  };

  const handleCodeAction = (action: string) => {
    setCodeAction(action);

    // Create template for the selected action
    let template = '';

    switch (action) {
      case 'generate':
        template = 'Generate the following code in [language]:\n\n[description]';
        break;
      case 'optimize':
        template = 'Optimize this code:\n\n```\n[your code here]\n```';
        break;
      case 'translate':
        template = 'Translate this code from [source language] to [target language]:\n\n```\n[your code here]\n```';
        break;
      case 'explain':
        template = 'Explain this code:\n\n```\n[your code here]\n```';
        break;
      default:
        template = '';
    }

    setMessage(template);
    setShowCodeMenu(false);

    // Focus and select text in the input
    if (inputRef.current) {
      inputRef.current.focus();
      // Small delay to ensure the template is set
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 50);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            inputRef={inputRef}
            InputProps={{
              sx: { pr: 12 } // Add space for buttons
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {showCodeOptions && (
              <Tooltip title="Code actions">
                <IconButton
                  color="primary"
                  onClick={handleCodeButtonClick}
                  disabled={loading}
                >
                  <Code />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Send message">
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!message.trim() || loading}
              >
                <Send />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {showCodeMenu && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 16,
            mb: 1,
            p: 1,
            zIndex: 10,
            width: 200,
          }}
        >
          <MenuItem
            selected={codeAction === 'generate'}
            onClick={() => handleCodeAction('generate')}
          >
            Generate Code
          </MenuItem>
          <MenuItem
            selected={codeAction === 'optimize'}
            onClick={() => handleCodeAction('optimize')}
          >
            Optimize Code
          </MenuItem>
          <MenuItem
            selected={codeAction === 'translate'}
            onClick={() => handleCodeAction('translate')}
          >
            Translate Code
          </MenuItem>
          <MenuItem
            selected={codeAction === 'explain'}
            onClick={() => handleCodeAction('explain')}
          >
            Explain Code
          </MenuItem>
        </Paper>
      )}
    </Paper>
  );
};

export default ChatInput;