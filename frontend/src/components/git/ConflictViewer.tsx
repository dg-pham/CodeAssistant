import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Tabs,
  Tab,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GitMergeConflict } from '@/api/gitMergeService';

interface ConflictViewerProps {
  conflict: GitMergeConflict;
  onResolve: (conflictId: string, resolvedContent: string, strategy: string) => void;
  isLoading: boolean;
}

const ConflictViewer: React.FC<ConflictViewerProps> = ({ conflict, onResolve, isLoading }) => {
  const [resolvedContent, setResolvedContent] = useState(conflict.resolved_content || '');
  const [resolutionStrategy, setResolutionStrategy] = useState(conflict.resolution_strategy || 'custom');
  const [tabValue, setTabValue] = useState(0);

  // Detect language from file path
  const getLanguage = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'jsx': return 'jsx';
      case 'tsx': return 'tsx';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp': case 'cxx': case 'cc': return 'cpp';
      case 'cs': return 'csharp';
      case 'rb': return 'ruby';
      case 'go': return 'go';
      case 'php': return 'php';
      case 'rs': return 'rust';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'yml': case 'yaml': return 'yaml';
      default: return 'text';
    }
  };

  const language = getLanguage(conflict.file_path);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStrategyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const strategy = event.target.value;
    setResolutionStrategy(strategy);

    // Automatically set content based on strategy
    if (strategy === 'ours') {
      setResolvedContent(conflict.our_changes);
    } else if (strategy === 'theirs') {
      setResolvedContent(conflict.their_changes);
    }
  };

  const handleResolve = () => {
    onResolve(conflict.id, resolvedContent, resolutionStrategy);
  };

  const handleAiSuggest = () => {
    // If there's an AI suggestion, use it as the resolved content
    if (conflict.ai_suggestion) {
      // Try to extract code from the AI suggestion
      const codeMatch = conflict.ai_suggestion.match(/```[\s\S]*?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setResolvedContent(codeMatch[1].trim());
      } else {
        setResolvedContent(conflict.ai_suggestion);
      }
      setResolutionStrategy('custom');
    }
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Conflict in {conflict.file_path}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {conflict.is_resolved ? 'Resolved' : 'Unresolved'}
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={handleChangeTab} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Our Changes" />
        <Tab label="Their Changes" />
        <Tab label="Resolution" />
        {conflict.ai_suggestion && <Tab label="AI Suggestion" />}
      </Tabs>

      <Box sx={{ height: 400, overflow: 'auto' }}>
        {tabValue === 0 && (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0 }}
          >
            {conflict.our_changes}
          </SyntaxHighlighter>
        )}

        {tabValue === 1 && (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0 }}
          >
            {conflict.their_changes}
          </SyntaxHighlighter>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Resolution Strategy</FormLabel>
              <RadioGroup
                row
                name="resolution-strategy"
                value={resolutionStrategy}
                onChange={handleStrategyChange}
              >
                <FormControlLabel value="ours" control={<Radio />} label="Use Our Changes" />
                <FormControlLabel value="theirs" control={<Radio />} label="Use Their Changes" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom Resolution" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={12}
              value={resolvedContent}
              onChange={(e) => setResolvedContent(e.target.value)}
              disabled={resolutionStrategy !== 'custom'}
              placeholder="Enter your custom resolution here..."
              sx={{ fontFamily: 'monospace' }}
            />

            {conflict.ai_suggestion && (
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handleAiSuggest}
              >
                Use AI Suggestion
              </Button>
            )}
          </Box>
        )}

        {tabValue === 3 && conflict.ai_suggestion && (
          <Box sx={{ p: 2, whiteSpace: 'pre-wrap' }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {conflict.ai_suggestion}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleResolve}
          disabled={isLoading || conflict.is_resolved}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Resolve Conflict'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ConflictViewer;