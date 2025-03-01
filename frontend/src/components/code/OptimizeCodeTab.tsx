import React, { useState } from 'react';
import { Select, SelectOption, Button, Card } from '../common';
import { CodeEditor } from './CodeEditor';
import { CodeResult } from './CodeResult';
import { useCodeStore, useUserStore } from '../../store';
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from '../../types';
import { useToast } from '../common/Toast';

export const OptimizeCodeTab: React.FC = () => {
  const { currentUser } = useUserStore();
  const {
    optimizeCode,
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
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const optimizationOptions: SelectOption[] = [
    { value: 'low', label: 'Low - Maintain readability' },
    { value: 'medium', label: 'Medium - Balance performance and readability' },
    { value: 'high', label: 'High - Maximize performance' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!sourceCode.trim()) {
      setError('Please enter some code to optimize');
      return;
    }

    if (!sourceLanguage) {
      setError('Please select a programming language');
      return;
    }

    // Reset error
    setError('');

    try {
      // Call the optimize code API
      await optimizeCode(sourceCode, sourceLanguage, optimizationLevel);
    } catch (error) {
      console.error('Code optimization error:', error);
      showToast({
        type: 'error',
        message: 'Failed to optimize code. Please try again.',
      });
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Optimize Code</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code to Optimize
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
                label="Language"
                options={PROGRAMMING_LANGUAGES}
                value={sourceLanguage}
                onChange={(value) => setSourceLanguage(value as ProgrammingLanguage)}
                fullWidth
              />

              <Select
                label="Optimization Level"
                options={optimizationOptions}
                value={optimizationLevel}
                onChange={(value) => setOptimizationLevel(value as 'low' | 'medium' | 'high')}
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
              Optimize Code
            </Button>
          </form>

          {currentResponse && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Optimized Code</h3>
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
            <CodeResult
              result={currentResponse.result}
              language={sourceLanguage || undefined}
              userId={currentUser?.id || ''}
            />
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Ready to optimize code
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Paste your code, select a language and optimization level, then click "Optimize Code"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};