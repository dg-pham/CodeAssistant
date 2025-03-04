import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';
import { CreateWorkflowRequest } from '@/api/workflowService';

interface CreateWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateWorkflow: (data: CreateWorkflowRequest) => void;
  userId: string;
  isLoading: boolean;
}

const CreateWorkflowDialog: React.FC<CreateWorkflowDialogProps> = ({
  open,
  onClose,
  onCreateWorkflow,
  userId,
  isLoading
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({
    name: false
  });

  const handleSubmit = () => {
    // Validate
    const newErrors = {
      name: !name.trim()
    };

    setErrors(newErrors);

    if (newErrors.name) return;

    // Submit
    onCreateWorkflow({
      user_id: userId,
      name,
      description: description || undefined
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create New Workflow</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Workflow Name"
            name="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            helperText={errors.name ? 'Workflow name is required' : ''}
            disabled={isLoading}
          />

          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description (optional)"
            name="description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWorkflowDialog;