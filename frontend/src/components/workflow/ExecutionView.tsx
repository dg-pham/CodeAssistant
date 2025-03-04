import React from 'react';
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
  Alert
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { WorkflowExecution } from '@/api/workflowService';

interface ExecutionViewProps {
  execution: WorkflowExecution;
  onClose: () => void;
}

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
  // Sort steps by started_at time
  const sortedSteps = [...execution.steps].sort((a, b) =>
    new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

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
                      <Paper variant="outlined" sx={{ p: 1, maxHeight: 150, overflow: 'auto' }}>
                        <pre style={{ margin: 0, fontSize: '0.7rem' }}>
                          {JSON.stringify(step.output_data, null, 2)}
                        </pre>
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
      <Paper variant="outlined" sx={{ p: 1, mb: 3, maxHeight: 150, overflow: 'auto' }}>
        <pre style={{ margin: 0, fontSize: '0.7rem' }}>
          {JSON.stringify(execution.output_data, null, 2)}
        </pre>
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
    </Paper>
  );
};

export default ExecutionView;