import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Chip,
  Divider,
  Button,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { ContentCopy, Code } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { WorkflowExecution } from '@/api/workflowService';

interface ExecutionViewProps {
  execution: WorkflowExecution;
  onClose: () => void;
}

// Function to get a better result label based on agent type or node type
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

// Helper function to extract code blocks from text
const extractCodeBlocks = (text) => {
  if (!text) return [];

  const regex = /```(\w+)?\n([\s\S]+?)\n```/g;
  const codeBlocks = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2]
    });
  }

  return codeBlocks;
};

// Helper function to get status color
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

const ExecutionView: React.FC<ExecutionViewProps> = ({ execution, onClose }) => {
  // State for showing snackbar when copying code
  const [copying, setCopying] = useState(false);

  // Sort steps by started_at time
  const sortedSteps = [...execution.steps].sort((a, b) =>
    new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  // Handle copying code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  // Render output data with better formatting
  const renderOutputData = (data, nodeType = '') => {
    if (!data) return null;

    return (
      <Box>
        {Object.entries(data).map(([key, value]) => {
          if (key === 'result_text') {
            // Better labeling for result_text
            const resultLabel = getResultLabel(nodeType);

            return (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{resultLabel}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {value as string}
                </Typography>

                {/* Extract and render code blocks in result_text */}
                {(value as string).includes('```') &&
                  extractCodeBlocks(value as string).map((block, idx) => (
                    <Box key={`code-${idx}`} sx={{ position: 'relative', my: 2 }}>
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
                            onClick={() => handleCopyCode(block.code)}
                            sx={{ color: 'white' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <SyntaxHighlighter
                        language={block.language}
                        style={vscDarkPlus}
                        showLineNumbers
                        customStyle={{ margin: 0 }}
                      >
                        {block.code}
                      </SyntaxHighlighter>
                    </Box>
                  ))
                }
              </Box>
            );
          } else if (key === 'generated_code' || key === 'optimized_code' || key === 'translated_code') {
            // Render code with syntax highlighting
            const codeValue = value as string;
            const codeBlocks = extractCodeBlocks(codeValue);

            return (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {key === 'generated_code' ? 'Generated Code' :
                   key === 'optimized_code' ? 'Optimized Code' :
                   'Translated Code'}
                </Typography>
                {codeBlocks.length > 0 ? (
                  codeBlocks.map((block, idx) => (
                    <Box key={`code-${idx}`} sx={{ position: 'relative', my: 2 }}>
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
                            onClick={() => handleCopyCode(block.code)}
                            sx={{ color: 'white' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <SyntaxHighlighter
                        language={block.language}
                        style={vscDarkPlus}
                        showLineNumbers
                        customStyle={{ margin: 0 }}
                      >
                        {block.code}
                      </SyntaxHighlighter>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {codeValue}
                  </Typography>
                )}
              </Box>
            );
          } else if (typeof value === 'object' && value !== null) {
            // Render nested objects
            return (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <pre style={{ margin: 0, fontSize: '0.7rem' }}>
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </Paper>
              </Box>
            );
          } else {
            // Render simple values
            return (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2">{value as string}</Typography>
              </Box>
            );
          }
        })}
      </Box>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxHeight: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Workflow Execution</Typography>
        <Chip
          label={execution.status}
          color={getStatusColor(execution.status) as any}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Started {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
        {execution.completed_at && ` • Completed ${formatDistanceToNow(new Date(execution.completed_at), { addSuffix: true })}`}
      </Typography>

      {execution.error_message && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {execution.error_message}
        </Alert>
      )}

      <Typography variant="subtitle1" sx={{ mb: 2 }}>Execution Steps</Typography>

      {sortedSteps.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Preparing execution steps...
          </Typography>
        </Box>
      ) : (
        <Stepper orientation="vertical" sx={{ mb: 3 }}>
          {sortedSteps.map((step) => (
            <Step key={step.id} active={step.status === 'in_progress'} completed={step.status === 'completed'}>
              <StepLabel
                error={step.status === 'failed'}
                optional={
                  <Typography variant="caption">
                    {step.status === 'in_progress' && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={12} sx={{ mr: 1 }} />
                        In Progress
                      </Box>
                    )}
                    {step.status === 'completed' && 'Completed'}
                    {step.status === 'failed' && 'Failed'}
                    {step.status === 'pending' && 'Pending'}
                  </Typography>
                }
              >
                <Typography>Node Execution</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Node ID:</strong> {step.node_id}
                  </Typography>

                  {step.error_message && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {step.error_message}
                    </Alert>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle2">Input Data</Typography>
                  <Paper variant="outlined" sx={{ p: 1, mb: 1, maxHeight: 150, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '0.7rem' }}>
                      {JSON.stringify(step.input_data, null, 2)}
                    </pre>
                  </Paper>

                  {step.status === 'completed' && (
                    <>
                      <Typography variant="subtitle2">Output Data</Typography>
                      <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                        {renderOutputData(step.output_data, step.input_data?.node_type)}
                      </Paper>
                    </>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Full execution data (input/output) */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Execution Input</Typography>
      <Paper variant="outlined" sx={{ p: 1, mb: 2, maxHeight: 150, overflow: 'auto' }}>
        <pre style={{ margin: 0, fontSize: '0.7rem' }}>
          {JSON.stringify(execution.input_data, null, 2)}
        </pre>
      </Paper>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>Execution Output</Typography>
      <Paper variant="outlined" sx={{ p: 1, mb: 3, overflow: 'auto', maxHeight: 200 }}>
        {renderOutputData(execution.output_data)}
      </Paper>

      <Box sx={{ mt: 'auto' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          fullWidth
        >
          Close
        </Button>
      </Box>

      {/* Snackbar for copy notification */}
      {copying && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'success.main',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            zIndex: 9999
          }}
        >
          Code copied to clipboard!
        </Box>
      )}
    </Paper>
  );
};

export default ExecutionView;