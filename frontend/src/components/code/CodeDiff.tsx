import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';

interface CodeDiffProps {
  originalCode: string;
  modifiedCode: string;
  language: string;
  height?: string | number;
  width?: string | number;
  theme?: 'vs-dark' | 'light' | string;
  className?: string;
}

export const CodeDiff: React.FC<CodeDiffProps> = ({
  originalCode,
  modifiedCode,
  language,
  height = '400px',
  width = '100%',
  theme = 'vs-dark',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

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

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast({ type: 'success', message: 'Code copied to clipboard' });
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast({ type: 'error', message: 'Failed to copy code' });
    }
  };

  return (
    <div className={`relative border border-gray-300 rounded-md overflow-hidden ${className}`}>
      <div className="p-2 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
        <div className="flex space-x-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(originalCode)}
          >
            Copy Original
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(modifiedCode)}
          >
            Copy Modified
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded mr-2">- Removed</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">+ Added</span>
        </div>
      </div>

      <DiffEditor
        height={height}
        width={width}
        language={getMonacoLanguage(language)}
        original={originalCode}
        modified={modifiedCode}
        theme={theme}
        loading={<div className="p-4 text-center">Loading diff editor...</div>}
        options={{
          readOnly: true,
          renderSideBySide: window.innerWidth >= 768, // Inline diff on mobile
          scrollBeyondLastLine: false,
          scrollbar: { alwaysConsumeMouseWheel: false },
          diffWordWrap: 'on',
        }}
        onMount={() => setIsLoading(false)}
      />
    </div>
  );
};