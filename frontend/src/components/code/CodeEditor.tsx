import React, { useCallback, useEffect, useState } from 'react';
import Editor, { useMonaco, OnMount, BeforeMount, OnChange } from '@monaco-editor/react';
import { ProgrammingLanguage } from '../../types';

interface CodeEditorProps {
  value: string;
  language: ProgrammingLanguage | string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
  theme?: 'vs-dark' | 'light' | string;
  fontSize?: number;
  lineNumbers?: 'on' | 'off';
  minimap?: { enabled: boolean };
  padding?: { top: number; bottom: number };
  showLineHighlight?: boolean;
  className?: string;
  onSave?: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  readOnly = false,
  height = '400px',
  width = '100%',
  theme = 'vs-dark',
  fontSize = 14,
  lineNumbers = 'on',
  minimap = { enabled: true },
  padding = { top: 10, bottom: 10 },
  showLineHighlight = true,
  className = '',
  onSave,
}) => {
  const monaco = useMonaco();
  const [internalValue, setInternalValue] = useState(value);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Register Ctrl+S / Cmd+S save handler
  useEffect(() => {
    if (monaco && onSave) {
      const disposable = monaco.editor.addKeybindingRule({
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        command: 'editor.action.customSave',
        context: '!editorReadonly',
      });

      return () => {
        disposable.dispose();
      };
    }
  }, [monaco, onSave]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      if (onSave) {
        // Register custom save command
        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
          () => {
            onSave(editor.getValue());
          }
        );
      }

      // Focus editor
      editor.focus();
    },
    [onSave]
  );

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // You can customize editor themes or configuration here
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBorder': '#383838',
      },
    });
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      const value = newValue || '';
      setInternalValue(value);
      if (onChange) {
        onChange(value);
      }
    },
    [onChange]
  );

  // Map our language prop to Monaco's language id
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'python': 'python',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'csharp': 'csharp',
      'go': 'go',
      'ruby': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'rust': 'rust',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
    };

    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
      <Editor
        height={height}
        width={width}
        language={getMonacoLanguage(language)}
        value={internalValue}
        onChange={handleChange}
        theme={theme}
        options={{
          readOnly,
          fontSize,
          lineNumbers,
          minimap,
          padding,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          folding: true,
          automaticLayout: true,
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: 'auto',
            horizontal: 'auto',
          },
          wordWrap: 'on',
          renderLineHighlight: showLineHighlight ? 'all' : 'none',
        }}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};