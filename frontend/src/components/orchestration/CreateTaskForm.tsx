import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { StartOrchestrationRequest } from '@/api/orchestrationService';

interface CreateTaskFormProps {
  userId: string;
  onSubmit: (data: StartOrchestrationRequest) => void;
  isLoading: boolean;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  userId,
  onSubmit,
  isLoading
}) => {
  const [taskType, setTaskType] = useState('code_generation');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({
    taskType: '',
    description: ''
  });

  const taskTypes = [
    { value: 'code_generation', label: 'Code Generation' },
    { value: 'code_optimization', label: 'Code Optimization' },
    { value: 'code_translation', label: 'Code Translation' },
    { value: 'git_merge', label: 'Git Merge' }
  ];

  const validate = () => {
    const newErrors = {
      taskType: '',
      description: ''
    };

    if (!taskType) {
      newErrors.taskType = 'Task type is required';
    }

    if (!description) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // Prepare input data based on task type
      let inputData: any = { description };

      if (taskType === 'code_generation') {
        inputData.language_to = 'python'; // Default language
      } else if (taskType === 'code_optimization') {
        inputData.optimization_level = 'medium';
      } else if (taskType === 'code_translation') {
        inputData.language_from = 'python';
        inputData.language_to = 'javascript';
      }

      onSubmit({
        user_id: userId,
        task_type: taskType,
        input_data: inputData
      });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Orchestration Task
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.taskType}>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={taskType}
                label="Task Type"
                onChange={(e) => setTaskType(e.target.value)}
                disabled={isLoading}
              >
                {taskTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description || "Describe what you want the task to accomplish"}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Agent Chain:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {taskType === 'code_generation' && (
                  <>
                    <Chip label="1. Requirements Analyzer" size="small" />
                    <Chip label="2. Code Generator" size="small" />
                    <Chip label="3. Code Optimizer" size="small" />
                  </>
                )}
                {taskType === 'code_optimization' && (
                  <>
                    <Chip label="1. Code Analyzer" size="small" />
                    <Chip label="2. Performance Optimizer" size="small" />
                    <Chip label="3. Quality Checker" size="small" />
                  </>
                )}
                {taskType === 'code_translation' && (
                  <>
                    <Chip label="1. Source Analyzer" size="small" />
                    <Chip label="2. Language Translator" size="small" />
                    <Chip label="3. Idiom Adapter" size="small" />
                  </>
                )}
                {taskType === 'git_merge' && (
                  <>
                    <Chip label="1. Git Analyzer" size="small" />
                    <Chip label="2. Code Understander" size="small" />
                    <Chip label="3. Conflict Resolver" size="small" />
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Start Orchestration Task'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateTaskForm;