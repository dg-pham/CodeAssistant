import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Card, Tabs, Button, Spinner } from '../components/common';
import { GenerateCodeTab } from '../components/code/GenerateCodeTab';
import { OptimizeCodeTab } from '../components/code/OptimizeCodeTab';
import { TranslateCodeTab } from '../components/code/TranslateCodeTab';
import { ExplainCodeTab } from '../components/code/ExplainCodeTab';
import { useUserStore } from '../store';
import { useToast } from '../components/common/Toast';

export const CodePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, createAnonymousUser } = useUserStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ensureUser = async () => {
      try {
        // If no user is authenticated, create an anonymous user
        if (!currentUser) {
          await createAnonymousUser();
        }
      } catch (error) {
        console.error('Failed to create anonymous user:', error);
        showToast({
          type: 'error',
          message: 'Failed to initialize. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    ensureUser();
  }, [currentUser, createAnonymousUser, showToast]);

  // Tabs configuration
  const tabs = [
    {
      id: 'generate',
      label: 'Generate',
      content: <GenerateCodeTab />,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: 'optimize',
      label: 'Optimize',
      content: <OptimizeCodeTab />,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'translate',
      label: 'Translate',
      content: <TranslateCodeTab />,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
    {
      id: 'explain',
      label: 'Explain',
      content: <ExplainCodeTab />,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
          <Spinner size="xl" color="primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Code Assistant</h1>
          <p className="mt-2 text-lg text-gray-600">
            Generate, optimize, translate, and explain code with AI assistance
          </p>
        </div>

        <Card className="shadow-lg">
          <Tabs items={tabs} variant="enclosed" />
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Need to save your code or continue a conversation?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/snippets')}
          >
            View Saved Snippets
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};