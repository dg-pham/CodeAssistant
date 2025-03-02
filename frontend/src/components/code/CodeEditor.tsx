import React, { useEffect, useState } from 'react';
import { Box, Paper, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Button, Tooltip } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { setCurrentCode, setLanguage } from '@/store/slices/codeSlice';
import { ContentCopy, Save, PlayArrow } from '@mui/icons-material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  readOnly?: boolean;
  height?: string;
  onRunCode?: () => void;
  onSaveCode?: () => void;
  onChange?: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  initialLanguage = '',
  readOnly = false,
  height = '500px',
  onRunCode,
  onSaveCode,
  onChange
}) => {
  const dispatch = useAppDispatch();
  const { currentCode, language } = useSelector((state: RootState) => state.code);
  const [localCode, setLocalCode] = useState(initialCode || currentCode);
  const [localLanguage, setLocalLanguage] = useState(initialLanguage || language);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // If initialCode or initialLanguage are set explicitly as props, prefer those
    if (initialCode) {
      setLocalCode(initialCode);
    } else {
      setLocalCode(currentCode);
    }

    if (initialLanguage) {
      setLocalLanguage(initialLanguage);
    } else {
      setLocalLanguage(language);
    }
  }, [initialCode, initialLanguage, currentCode, language]);

  const handleEditorChange = (value: string) => {
    setLocalCode(value);
    // Only update global state if we're not in read-only mode
    if (!readOnly) {
      dispatch(setCurrentCode(value));
      if (onChange) {
        onChange(value);
      }
    }
  };

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value;
    setLocalLanguage(newLanguage);
    // Only update global state if we're not in read-only mode
    if (!readOnly) {
      dispatch(setLanguage(newLanguage));
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(localCode);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get language extension for CodeMirror
  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'javascript':
        return javascript();
      case 'typescript':
        return javascript({ typescript: true });
      case 'jsx':
        return javascript({ jsx: true });
      case 'tsx':
        return javascript({ jsx: true, typescript: true });
      case 'python':
        return python();
      case 'java':
        return java();
      case 'cpp':
      case 'c++':
      case 'csharp':
      case 'c#':
        return cpp();
      case 'php':
        return php();
      case 'html':
        return html();
      case 'css':
        return css();
      case 'sql':
        return sql();
      case 'xml':
        return xml();
      default:
        return javascript();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, pb: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={localLanguage}
              label="Language"
              onChange={handleLanguageChange}
              disabled={readOnly}
            >
              {supportedLanguages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Tooltip title="Copy to clipboard">
              <Button
                size="small"
                startIcon={<ContentCopy />}
                onClick={handleCopyToClipboard}
                sx={{ mr: 1 }}
              >
                Copy
              </Button>
            </Tooltip>

            {onSaveCode && (
              <Tooltip title="Save code">
                <Button
                  size="small"
                  startIcon={<Save />}
                  onClick={onSaveCode}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
              </Tooltip>
            )}

            {onRunCode && (
              <Tooltip title="Run code">
                <Button
                  size="small"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={onRunCode}
                >
                  Run
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="editor tabs">
          <Tab label="Editor" />
        </Tabs>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {tabValue === 0 && (
          <CodeMirror
            value={localCode}
            height={height}
            onChange={handleEditorChange}
            extensions={[getLanguageExtension(localLanguage)]}
            theme="dark"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              searchKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
            readOnly={readOnly}
          />
        )}
      </Box>
    </Paper>
  );
};

export default CodeEditor;