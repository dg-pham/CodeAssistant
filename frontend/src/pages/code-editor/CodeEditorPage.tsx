import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Save as SaveIcon,
  AutoAwesome as OptimizeIcon,
  Translate as TranslateIcon,
  Info as ExplainIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { generateCode, optimizeCode, translateCode, explainCode, saveCodeSnippet, setCurrentCode, setLanguage } from '@/store/slices/codeSlice';
import { getOrCreateAnonymousUser } from '@/store/slices/userSlice';
import { CodeEditor, SnippetForm } from '@/components/code';
import { extractCodeBlocks } from '@/utils/formatters';
import Layout from '@/components/layout/Layout';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeSnippetCreate } from '@/types';
import { useLocation } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CodeEditorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { currentUser, isLoading: userLoading } = useSelector((state: RootState) => state.user);
  const { currentCode, language, lastResponse, isProcessing, error } = useSelector((state: RootState) => state.code);

  const [action, setAction] = useState<'generate' | 'optimize' | 'translate' | 'explain'>('generate');
  const [description, setDescription] = useState('');
  const [languageFrom, setLanguageFrom] = useState('javascript');
  const [languageTo, setLanguageTo] = useState('python');
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [optimizationDescription, setOptimizationDescription] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // States for saving snippets
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const [snippetTags, setSnippetTags] = useState<string[]>([]);

  // States for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Check if we navigated from chat
    setTabValue(0);
  }, [location]);

  // Ensure we have a user
  useEffect(() => {
    if (!currentUser && !userLoading) {
      dispatch(getOrCreateAnonymousUser());
    }
  }, [dispatch, currentUser, userLoading]);

  // Extract code from AI response
  const handleExtractCodeFromResponse = () => {
    if (lastResponse?.result) {
      const codeBlocks = extractCodeBlocks(lastResponse.result);
      if (codeBlocks.length > 0) {
        return codeBlocks[0].code;
      }
    }
    return '';
  };

  const handleActionChange = (newAction: 'generate' | 'optimize' | 'translate' | 'explain') => {
    setAction(newAction);
  };

  const handleCodeAction = async () => {
    if (!currentUser) {
      return;
    }

    try {
      switch (action) {
        case 'generate':
          await dispatch(generateCode({
            action: 'generate',
            description,
            language_to: languageTo,
            user_id: currentUser.id,
          }));
          break;
        case 'optimize':
          await dispatch(optimizeCode({
            action: 'optimize',
            code: currentCode,
            language_from: language,
            optimization_level: optimizationLevel,
            user_id: currentUser.id,
            description: optimizationDescription || `Code optimization with level: ${optimizationLevel}`
          }));
          break;
        case 'translate':
          await dispatch(translateCode({
            action: 'translate',
            code: currentCode,
            language_from: languageFrom,
            language_to: languageTo,
            user_id: currentUser.id,
            description: `Translated from ${languageFrom} to ${languageTo}`
          }));
          break;
        case 'explain':
          await dispatch(explainCode({
            action: 'explain',
            code: currentCode,
            language_from: language,
            user_id: currentUser.id,
            description: `Code explanation for ${language} code`
          }));
          break;
      }

      // Switch to output tab after processing
      setTabValue(1);
    } catch (err) {
      console.error('Error processing code action:', err);
      setSnackbarSeverity('error');
      setSnackbarMessage('Error processing your request. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Handler for opening save dialog
  const handleOpenSaveDialog = () => {
    // Set default title based on current action
    let defaultTitle = '';
    if (action === 'translate') {
      defaultTitle = `Translated from ${languageFrom} to ${languageTo}`;
    } else if (action === 'optimize') {
      defaultTitle = `Optimized ${language} code (${optimizationLevel})`;
    } else if (action === 'generate') {
      defaultTitle = description || 'Generated code';
    } else if (action === 'explain') {
      defaultTitle = `${language} code with explanation`;
    } else {
      defaultTitle = `Code in ${language}`;
    }

    setSnippetName(defaultTitle);
    setSaveDialogOpen(true);
  };

  // Handler for saving snippet
  const handleSaveSnippet = (snippetData: CodeSnippetCreate) => {
    if (!currentUser) return;

    dispatch(saveCodeSnippet(snippetData))
      .unwrap()
      .then(() => {
        setSnackbarSeverity('success');
        setSnackbarMessage('Code snippet saved successfully!');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to save code snippet: ' + error);
        setSnackbarOpen(true);
      });

    setSaveDialogOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyToClipboard = () => {
    const text = lastResponse?.result || '';
    navigator.clipboard.writeText(text);
    setSnackbarSeverity('success');
    setSnackbarMessage('Content copied to clipboard');
    setSnackbarOpen(true);
  };

  const handleCopyCodeToClipboard = () => {
    const code = handleExtractCodeFromResponse() || '';
    navigator.clipboard.writeText(code);
    setSnackbarSeverity('success');
    setSnackbarMessage('Code copied to clipboard');
    setSnackbarOpen(true);
  };

  // Determine which action component to show
  const renderActionComponent = () => {
    switch (action) {
      case 'generate':
        return (
          <Stack spacing={2}>
            <TextField
              label="Describe what code you need"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Target Language</InputLabel>
              <Select
                value={languageTo}
                label="Target Language"
                onChange={(e) => setLanguageTo(e.target.value)}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="csharp">C#</MenuItem>
                <MenuItem value="go">Go</MenuItem>
                <MenuItem value="php">PHP</MenuItem>
                <MenuItem value="ruby">Ruby</MenuItem>
                <MenuItem value="rust">Rust</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<RunIcon />}
              onClick={handleCodeAction}
              disabled={isProcessing || !description.trim()}
            >
              Generate Code
            </Button>
          </Stack>
        );
      case 'optimize':
        return (
          <Stack spacing={2}>
            <TextField
              label="Optimization Description"
              value={optimizationDescription}
              onChange={(e) => setOptimizationDescription(e.target.value)}
              fullWidth
              required
              placeholder="Describe what you want to optimize"
              helperText="Required - e.g., 'Optimize for performance' or 'Reduce code complexity'"
            />
            <FormControl fullWidth>
              <InputLabel>Optimization Level</InputLabel>
              <Select
                value={optimizationLevel}
                label="Optimization Level"
                onChange={(e) => setOptimizationLevel(e.target.value as 'low' | 'medium' | 'high')}
              >
                <MenuItem value="low">Low - Basic improvements</MenuItem>
                <MenuItem value="medium">Medium - Standard optimizations</MenuItem>
                <MenuItem value="high">High - Advanced optimizations</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="warning"
              startIcon={<OptimizeIcon />}
              onClick={handleCodeAction}
              disabled={isProcessing || !currentCode.trim() || !optimizationDescription.trim()}
            >
              Optimize Code
            </Button>
          </Stack>
        );
      case 'translate':
        return (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>From Language</InputLabel>
              <Select
                value={languageFrom}
                label="From Language"
                onChange={(e) => setLanguageFrom(e.target.value)}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="csharp">C#</MenuItem>
                <MenuItem value="go">Go</MenuItem>
                <MenuItem value="php">PHP</MenuItem>
                <MenuItem value="ruby">Ruby</MenuItem>
                <MenuItem value="rust">Rust</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>To Language</InputLabel>
              <Select
                value={languageTo}
                label="To Language"
                onChange={(e) => setLanguageTo(e.target.value)}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="csharp">C#</MenuItem>
                <MenuItem value="go">Go</MenuItem>
                <MenuItem value="php">PHP</MenuItem>
                <MenuItem value="ruby">Ruby</MenuItem>
                <MenuItem value="rust">Rust</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="info"
              startIcon={<TranslateIcon />}
              onClick={handleCodeAction}
              disabled={isProcessing || !currentCode.trim()}
            >
              Translate Code
            </Button>
          </Stack>
        );
      case 'explain':
        return (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              The AI will analyze and explain the code in the editor, providing insights into how it works and its purpose.
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<ExplainIcon />}
              onClick={handleCodeAction}
              disabled={isProcessing || !currentCode.trim()}
            >
              Explain Code
            </Button>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Code Editor
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Write, generate, optimize, translate, or get explanations for your code.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Left panel - Code Editor */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="editor tabs"
              sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Editor" />
              <Tab label="Output" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ height: '100%', p: 0 }}>
                <CodeEditor
                  height="100%"
                  onSaveCode={handleOpenSaveDialog}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                {isProcessing ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : lastResponse ? (
                  <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={handleCopyToClipboard}
                      >
                        Copy All
                      </Button>
                      {action === 'generate' && (
                        <Button
                          size="small"
                          startIcon={<CopyIcon />}
                          onClick={handleCopyCodeToClipboard}
                          sx={{ ml: 1 }}
                        >
                          Copy Code Only
                        </Button>
                      )}
                    </Box>
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <Box sx={{ position: 'relative', mb: 2 }}>
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </Box>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {lastResponse.result}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    Output will appear here after processing
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Right panel - Actions */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Code Actions
            </Typography>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Button
                variant={action === 'generate' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleActionChange('generate')}
              >
                Generate
              </Button>
              <Button
                variant={action === 'optimize' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleActionChange('optimize')}
              >
                Optimize
              </Button>
              <Button
                variant={action === 'translate' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleActionChange('translate')}
              >
                Translate
              </Button>
              <Button
                variant={action === 'explain' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleActionChange('explain')}
              >
                Explain
              </Button>
            </Stack>

            {/* Action-specific controls */}
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {renderActionComponent()}
            </Box>

            {/* Save Button */}
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleOpenSaveDialog}
              fullWidth
            >
              Save Code Snippet
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Save Dialog */}
      {currentUser && (
        <SnippetForm
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onSave={handleSaveSnippet}
          initialData={{
            id: undefined,
            user_id: currentUser.id,
            language: action === 'translate' ? languageTo : language,
            code: action === 'generate' && lastResponse
              ? handleExtractCodeFromResponse() || currentCode
              : currentCode,
            description: snippetName,
            tags: snippetTags
          }}
          userId={currentUser.id}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default CodeEditorPage;