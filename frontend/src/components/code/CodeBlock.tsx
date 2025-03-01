import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  fileName?: string;
  maxHeight?: string;
  showCopyButton?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  fileName,
  maxHeight,
  showCopyButton = true,
  className = '',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      showToast({ type: 'success', message: 'Code copied to clipboard' });

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      showToast({ type: 'error', message: 'Failed to copy code to clipboard' });
    }
  };

  // Convert language names to SyntaxHighlighter's format
  const formatLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
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
      'json': 'json',
      'yaml': 'yaml',
      'markdown': 'markdown',
      'shell': 'bash',
      'bash': 'bash',
      'plaintext': 'text',
      'text': 'text',
    };

    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      {fileName && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono border-b border-gray-700">
          {fileName}
        </div>
      )}

      <div
        style={{ maxHeight }}
        className={`relative ${maxHeight ? 'overflow-auto' : ''}`}
      >
        <SyntaxHighlighter
          language={formatLanguage(language)}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          wrapLines
          customStyle={{
            margin: 0,
            borderRadius: fileName ? '0' : '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {showCopyButton && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800 bg-opacity-50"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      )}
    </div>
  );
};