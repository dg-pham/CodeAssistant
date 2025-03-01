import React, { useState } from 'react';
import { Select, SelectOption, TextArea, Button, Input, Card } from '../common';
import { CodeResult } from './CodeResult';
import { useCodeStore, useUserStore } from '../../store';
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from '../../types';
import { useToast } from '../common/Toast';

export const GenerateCodeTab: React.FC = () => {
  const { currentUser } = useUserStore();
  const { generateCode, currentResponse, setCurrentResponse, isLoading } = useCodeStore();
  const { showToast } = useToast();

  const [description, setDescription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('python');
  const [withComments, setWithComments] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!description.trim()) {
      setError('Please provide a description of the code you want to generate');
      return;
    }

    if (!selectedLanguage) {
      setError('Please select a programming language');
      return;
    }

    // Reset error and response
    setError('');

    try {
      // Call the generate code API
      await generateCode(description, selectedLanguage, withComments);
    } catch (error) {
      console.error('Code generation error:', error);
      showToast({
        type: 'error',
        message: 'Failed to generate code. Please try again.',
      });
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Generate Code</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <TextArea
                label="Describe the code you want to generate"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                placeholder="E.g., A function that calculates the Fibonacci sequence up to n terms"
                rows={8}
                error={error}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Language"
                options={PROGRAMMING_LANGUAGES}
                value={selectedLanguage}
                onChange={(value) => setSelectedLanguage(value as ProgrammingLanguage)}
                fullWidth
              />

              <div className="flex items-end">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withComments}
                    onChange={(e) => setWithComments(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">Include comments</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Generate Code
            </Button>
          </form>

          {currentResponse && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Generated Code</h3>
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
              language={selectedLanguage}
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
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Ready to generate code
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Describe what you want to create, select a language, and click "Generate Code"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};