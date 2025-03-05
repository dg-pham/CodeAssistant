// src/components/workflow/WorkflowInputDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { Workflow } from '@/api/workflowService';

interface WorkflowInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (inputData: any) => void;
  workflow: Workflow | null;
  isLoading: boolean;
}

const WorkflowInputDialog: React.FC<WorkflowInputDialogProps> = ({
  open,
  onClose,
  onSubmit,
  workflow,
  isLoading
}) => {
  const [inputValues, setInputValues] = useState<any>({
    description: '',
    language: 'javascript'
  });

  // Reset form khi workflow thay đổi
  useEffect(() => {
    if (open) {
      setInputValues({
        description: '',
        language: 'javascript'
      });
    }
  }, [open, workflow]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValues({
      ...inputValues,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setInputValues({
      ...inputValues,
      [e.target.name as string]: e.target.value
    });
  };

  const handleSubmit = () => {
    onSubmit(inputValues);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {workflow ? `Chạy Workflow: ${workflow.name}` : 'Chạy Workflow'}
      </DialogTitle>
      <DialogContent>
        {workflow ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Mô tả yêu cầu"
              name="description"
              value={inputValues.description}
              onChange={handleChange}
              multiline
              rows={4}
              helperText="Mô tả chi tiết yêu cầu của bạn"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="language-select-label">Ngôn ngữ lập trình</InputLabel>
              <Select
                labelId="language-select-label"
                name="language"
                value={inputValues.language}
                label="Ngôn ngữ lập trình"
                onChange={handleSelectChange}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="csharp">C#</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="php">PHP</MenuItem>
                <MenuItem value="go">Go</MenuItem>
                <MenuItem value="ruby">Ruby</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Workflow này sẽ được thực thi với các input trên. Kết quả sẽ hiển thị trong cuộc trò chuyện.
            </Typography>
          </Box>
        ) : (
          <Typography color="text.secondary">
            Không tìm thấy workflow.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !workflow || !inputValues.description}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Chạy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowInputDialog;