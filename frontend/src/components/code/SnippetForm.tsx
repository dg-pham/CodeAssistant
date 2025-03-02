import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Autocomplete
} from '@mui/material';
import CodeEditor from './CodeEditor';
import { CodeSnippet, CodeSnippetCreate } from '@/types';

interface SnippetFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (snippet: CodeSnippetCreate) => void;
  initialData?: Partial<CodeSnippet | CodeSnippetCreate>;
  userId: string;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

// Common tags for code snippets
const commonTags = [
  'algorithm',
  'utility',
  'function',
  'class',
  'component',
  'api',
  'database',
  'frontend',
  'backend',
  'web',
  'mobile',
  'react',
  'vue',
  'angular',
  'node',
  'express',
  'django',
  'flask',
  'spring'
];

const SnippetForm: React.FC<SnippetFormProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  userId
}) => {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    description: false,
    language: false,
    code: false
  });

  // Reset form when opening/closing or when initialData changes
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setLanguage(initialData.language);
      setCode(initialData.code);
      setTags(initialData.tags || []);
    } else {
      setDescription('');
      setLanguage('javascript');
      setCode('');
      setTags([]);
    }
    setErrors({ description: false, language: false, code: false });
  }, [open, initialData]);

  const handleSave = () => {
    // Validate form
    const newErrors = {
      description: !description.trim(),
      language: !language,
      code: !code.trim()
    };

    setErrors(newErrors);

    if (newErrors.description || newErrors.language || newErrors.code) {
      return;
    }

    const snippetData: CodeSnippetCreate = {
      id: initialData?.id,
      user_id: userId,
      language,
      code,
      description,
      tags
    };

    onSave(snippetData);
    onClose();
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (value.trim()) {
      setErrors({ ...errors, code: false });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{initialData ? 'Edit Code Snippet' : 'Create New Code Snippet'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) {
                setErrors({ ...errors, description: false });
              }
            }}
            error={errors.description}
            helperText={errors.description ? 'Description is required' : ''}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Language"
              onChange={(e) => {
                setLanguage(e.target.value);
                setErrors({ ...errors, language: false });
              }}
              error={errors.language}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            multiple
            freeSolo
            options={commonTags}
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Tags"
                placeholder="Add tags..."
              />
            )}
            sx={{ mb: 2 }}
          />

          <Box sx={{ height: 400 }}>
            <CodeEditor
              initialCode={code}
              initialLanguage={language}
              height="100%"
              onChange={(value) => {
                setCode(value);
                if (value.trim()) {
                  setErrors({ ...errors, code: false });
                }
              }}
            />
          </Box>
          {errors.code && (
            <Box sx={{ color: 'error.main', mt: 1, fontSize: '0.75rem' }}>
              Code is required
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SnippetForm;