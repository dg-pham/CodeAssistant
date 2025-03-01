import React, { useState } from 'react';
import { Select, Button, Card } from '../common';
import { CodeEditor } from './CodeEditor';
import { CodeResult } from './CodeResult';
import { useCodeStore, useUserStore } from '../../store';
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from '../../types';
import { useToast } from '../common/Toast';

export const ExplainCodeTab: React.FC = () => {
  const { currentUser } = useUserStore();
  const {
    explainCode,
    currentResponse,
    setCurrentResponse,
    sourceCode,
    setSourceCode,
    sourceLanguage,
    setSourceLanguage,
    isLoading
  } = useCodeStore();

  const { showToast } = useToast();

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!sourceCode.trim()) {
      setError('Please enter some code to explain');
      return;
    }

    if (!sourceLanguage) {
      setError('Please select a programming language');
      return;
    }

    // Reset error
    setError('');

    try {
      // Call the explain code API
      await explainCode(sourceCode, sourceLanguage);
    } catch (error) {
      console.error('Code explanation error:', error);
      showToast({
        type: 'error',
        message: 'Failed to explain code. Please try again.',
      });
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Explain Code</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code to Explain
              </label>
              {error && <p className="text-sm text-red-600 mb-1">{error}</p>}
              <CodeEditor
                value={sourceCode}
                onChange={setSourceCode}
                language={sourceLanguage || 'plaintext'}
                height="300px"
              />
            </div>

            <div className="mb-4">
              <Select
                label="Language"
                options={PROGRAMMING_LANGUAGES}
                value={sourceLanguage}
                onChange={(value) => setSourceLanguage(value as ProgrammingLanguage)}
                fullWidth
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Explain Code
            </Button>
          </form>

          {currentResponse && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Code Explanation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentResponse(null)}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Result Display */}
        <div>
          {currentResponse ? (
            <Card>
              <div className="prose max-w-none">
                <CodeResult
                  result={currentResponse.result}
                  language={sourceLanguage || undefined}
                  userId={currentUser?.id || ''}
                />
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg p-8 text-center">
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Ready to explain code
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Paste your code, select a language, then click "Explain Code" to get a detailed explanation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};