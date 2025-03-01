import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../common/Button';
import { CodeBlock } from './CodeBlock';
import { CodeSnippetCreate } from '../../types';
import { codeApi } from '../../api';
import { Badge } from '../common/Badge';
import { useToast } from '../common/Toast';

interface CodeResultProps {
  result: string;
  language?: string;
  userId: string;
  onSaveSuccess?: (snippet: CodeSnippetCreate) => void;
  className?: string;
}

export const CodeResult: React.FC<CodeResultProps> = ({
  result,
  language,
  userId,
  onSaveSuccess,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Extract code blocks from markdown
  const extractCodeBlocks = (markdown: string): Array<{ code: string; language: string }> => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
    const blocks: Array<{ code: string; language: string }> = [];

    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
      });
    }

    return blocks;
  };

  const codeBlocks = extractCodeBlocks(result);

  const handleSaveSnippet = async (code: string, lang: string) => {
    setIsLoading(true);

    try {
      // Create a description by extracting the first line or first 50 chars
      const description = code.split('\n')[0].slice(0, 50) + (code.split('\n')[0].length > 50 ? '...' : '');

      const snippet: CodeSnippetCreate = {
        user_id: userId,
        language: lang || language || 'plaintext',
        code,
        description,
        tags: [],
      };

      await codeApi.saveCodeSnippet(snippet);
      showToast({ type: 'success', message: 'Code snippet saved successfully' });

      if (onSaveSuccess) {
        onSaveSuccess(snippet);
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      showToast({ type: 'error', message: 'Failed to save code snippet' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <ReactMarkdown
        components={{
          // Override code blocks to use our CodeBlock component
          code({ node, inline, className, children, ...props }) {
            if (inline) {
              return <code className="px-1 py-0.5 bg-gray-100 rounded font-mono text-sm" {...props}>{children}</code>;
            }

            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : language || 'plaintext';

            return (
              <div className="relative mb-4">
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={lang}
                  showLineNumbers
                  showCopyButton
                />
                <div className="mt-2 flex justify-between items-center">
                  <Badge variant="secondary" size="sm">{lang}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSnippet(String(children).replace(/\n$/, ''), lang)}
                    isLoading={isLoading}
                  >
                    Save Snippet
                  </Button>
                </div>
              </div>
            );
          },
          // Style other markdown elements
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary-600 hover:underline" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic bg-gray-50" {...props} />
          ),
        }}
      >
        {result}
      </ReactMarkdown>

      {/* If there are no code blocks in the markdown, but we have a language,
          we display the entire result as a code block */}
      {codeBlocks.length === 0 && language && (
        <div className="mt-4">
          <CodeBlock
            code={result}
            language={language}
            showLineNumbers
            showCopyButton
          />
          <div className="mt-2 flex justify-between items-center">
            <Badge variant="secondary" size="sm">{language}</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSaveSnippet(result, language)}
              isLoading={isLoading}
            >
              Save Snippet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};