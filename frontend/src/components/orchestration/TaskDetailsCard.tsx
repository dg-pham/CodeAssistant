import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Grid,
  Alert,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TaskDetailsCardProps {
  task: any;
  onAbort: () => void;
  isLoading: boolean;
}

// Component mới để hiển thị kết quả của agent
const AgentResultDisplay = ({ result }: { result: any }) => {
  // Kiểm tra xem có phải kết quả code_generator không
  const isCodeGenerator = result.agent_type === 'code_generator';
  const isCodeOptimizer = result.agent_type === 'code_optimizer';

  // Tìm code trong kết quả
  let codeSnippet = '';
  let language = 'python'; // Mặc định

  if (isCodeGenerator && result.result_data.generated_code) {
    // Trích xuất code từ generated_code (tìm phần trong ```python ... ```)
    const codeMatch = result.result_data.generated_code.match(/```python\s+([\s\S]+?)\s+```/);
    if (codeMatch && codeMatch[1]) {
      codeSnippet = codeMatch[1];
    }
  } else if (isCodeOptimizer && result.result_data.optimized_code) {
    // Trích xuất code từ optimized_code nếu có
    const codeMatch = result.result_data.optimized_code.match(/```python\s+([\s\S]+?)\s+```/);
    if (codeMatch && codeMatch[1]) {
      codeSnippet = codeMatch[1];
    }
  }

  // Hiển thị khác nhau tùy theo loại agent
  return (
    <Box sx={{ mt: 2 }}>
      {/* Tiêu đề */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        {result.agent_type.charAt(0).toUpperCase() + result.agent_type.slice(1).replace(/_/g, ' ')}
      </Typography>

      {/* Status */}
      <Chip
        label={result.result_data.status}
        color={result.result_data.status === 'success' ? 'success' : 'error'}
        size="small"
        sx={{ mb: 2 }}
      />

      {/* Message */}
      {result.result_data.message && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Message:</strong> {result.result_data.message}
        </Typography>
      )}

      {/* Code Display */}
      {codeSnippet && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Generated Code:</strong>
          </Typography>
          <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {codeSnippet}
          </SyntaxHighlighter>
        </Box>
      )}

      {/* Thông tin khác (nếu không có code) */}
      {!codeSnippet && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {isCodeGenerator ? result.result_data.generated_code :
             isCodeOptimizer ? result.result_data.optimized_code :
             JSON.stringify(result.result_data, null, 2)}
          </Typography>
        </Box>
      )}

      {/* Thời gian tạo */}
      <Typography variant="caption" color="text.secondary">
        {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
      </Typography>
    </Box>
  );
};

const TaskDetailsCard: React.FC<TaskDetailsCardProps> = ({ task, onAbort, isLoading }) => {
  if (!task) return null;

  const progress = task.total_agents > 0
    ? (task.current_agent_index / task.total_agents) * 100
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'aborted': return 'error';
      default: return 'default';
    }
  };

  const canAbort = task.status === 'pending' || task.status === 'in_progress';

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Task Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
                label={task.status}
                color={getStatusColor(task.status) as any}
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Updated {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Task Type:</strong> {task.task_type}
              </Typography>
              <Typography variant="body2">
                <strong>Task ID:</strong> {task.task_id}
              </Typography>
            </Box>

            {task.error_message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {task.error_message}
              </Alert>
            )}

            {canAbort && (
              <Button
                variant="outlined"
                color="error"
                onClick={onAbort}
                disabled={isLoading}
              >
                Abort Task
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Agent Progress
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Agent {task.current_agent_index} of {task.total_agents}
                </Typography>
                <Typography variant="body2">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Results
        </Typography>

        {task.results && task.results.length > 0 ? (
          <List component={Paper} variant="outlined" sx={{ width: '100%' }}>
            {task.results.map((result: any, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <AgentResultDisplay result={result} />
                      </Box>
                </ListItem>
                {index < task.results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">No results available yet</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskDetailsCard;