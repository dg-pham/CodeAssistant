import React, { useState } from 'react';
import { Select, Button, Card } from '../common';
import { CodeEditor } from './CodeEditor';
import { CodeDiff } from './CodeDiff';
import { CodeResult } from './CodeResult';
import { useCodeStore, useUserStore } from '../../store';
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from '../../types';
import { useToast } from '../common/Toast';

export const TranslateCodeTab: React.FC = () => {
  const { currentUser } = useUserStore();
  const {
    translateCode,
    currentResponse,
    setCurrentResponse,
    sourceCode,
    setSourceCode,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isLoading
  } = useCodeStore();

  const { showToast } = useToast();

  const [error, setError] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!sourceCode.trim()) {
      setError('Please enter some code to translate');
      return;
    }

    if (!sourceLanguage) {
      setError('Please select a source programming language');
      return;
    }

    if (!targetLanguage) {
      setError('Please select a target programming language');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError('Source and target languages must be different');
      return;
    }

    // Reset error
    setError('');

    try {
      // Call the translate code API
      await translateCode(sourceCode, sourceLanguage, targetLanguage);
    } catch (error) {
      console.error('Code translation error:', error);
      showToast({
        type: 'error',
        message: 'Failed to translate code. Please try again.',
      });
    }
  };

  // Extract code from response (if it's wrapped in markdown code blocks)
  const extractCodeFromResponse = (): string => {
    if (!currentResponse) return '';

    const codeBlockRegex = /```[\w]*\n([\s\S]+?)\n```/g;
    const matches = [...currentResponse.result.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
      return matches[0][1].trim();
    }

    return currentResponse.result;
  };

  const translatedCode = extractCodeFromResponse();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Translate Code</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code to Translate
              </label>
              {error && <p className="text-sm text-red-600 mb-1">{error}</p>}
              <CodeEditor
                value={sourceCode}
                onChange={setSourceCode}
                language={sourceLanguage || 'plaintext'}
                height="300px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Source Language"
                options={PROGRAMMING_LANGUAGES}
                value={sourceLanguage}
                onChange={(value) => setSourceLanguage(value as ProgrammingLanguage)}
                fullWidth
              />

              <Select
                label="Target Language"
                options={PROGRAMMING_LANGUAGES}
                value={targetLanguage}
                onChange={(value) => setTargetLanguage(value as ProgrammingLanguage)}
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
              Translate Code
            </Button>
          </form>

          {currentResponse && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Translated Code</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDiff(!showDiff)}
                  >
                    {showDiff ? 'Hide Diff' : 'Show Diff'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentResponse(null)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result Display */}
        <div>
          {currentResponse ? (
            <>
              {showDiff ? (
                <Card>
                  <h3 className="text-lg font-medium mb-4">Code Comparison</h3>
                  <CodeDiff
                    originalCode={sourceCode}
                    modifiedCode={translatedCode}
                    language={targetLanguage || 'plaintext'}
                  />
                </Card>
              ) : (
                <CodeResult
                  result={currentResponse.result}
                  language={targetLanguage || undefined}
                  userId={currentUser?.id || ''}
                />
              )}
            </>
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
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Ready to translate code
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Paste your code, select source and target languages, then click "Translate Code"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};