import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { CreateMergeSessionRequest } from '@/api/gitMergeService';

interface CreateSessionFormProps {
  userId: string;
  onSubmit: (data: CreateMergeSessionRequest) => void;
  isLoading: boolean;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  userId,
  onSubmit,
  isLoading
}) => {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [targetBranch, setTargetBranch] = useState('');
  const [errors, setErrors] = useState({
    repositoryUrl: '',
    baseBranch: '',
    targetBranch: ''
  });

  const validate = () => {
    const newErrors = {
      repositoryUrl: '',
      baseBranch: '',
      targetBranch: ''
    };

    if (!repositoryUrl) {
      newErrors.repositoryUrl = 'Repository URL is required';
    } else if (!repositoryUrl.match(/^(https?:\/\/|git@).*\.git$/)) {
      newErrors.repositoryUrl = 'Invalid repository URL format';
    }

    if (!baseBranch) {
      newErrors.baseBranch = 'Base branch is required';
    }

    if (!targetBranch) {
      newErrors.targetBranch = 'Target branch is required';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        user_id: userId,
        repository_url: repositoryUrl,
        base_branch: baseBranch,
        target_branch: targetBranch
      });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Merge Session
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Repository URL"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              error={!!errors.repositoryUrl}
              helperText={errors.repositoryUrl || "Example: https://github.com/username/repo.git"}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Base Branch"
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              error={!!errors.baseBranch}
              helperText={errors.baseBranch || "The branch you're merging into (e.g., main)"}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Target Branch"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              error={!!errors.targetBranch}
              helperText={errors.targetBranch || "The branch you're merging from (e.g., feature)"}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Start Git Merge Process'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateSessionForm;