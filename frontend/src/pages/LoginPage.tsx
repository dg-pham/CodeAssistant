import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '../components/common';
import { MainLayout } from '../components/layout';
import { useUserStore } from '../store';
import { useToast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAnonymousUser } = useUserStore();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!userName.trim()) {
      setNameError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      // Create a new user with the provided name
      await createAnonymousUser();

      showToast({
        type: 'success',
        message: 'Logged in successfully!',
      });

      // Redirect to dashboard or home page
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      showToast({
        type: 'error',
        message: 'Failed to login. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center">
            <img
              className="mx-auto h-12 w-auto"
              src="/logo.svg"
              alt="CodeAgent"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to CodeAgent
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your name to continue
            </p>
          </div>

          <Card className="mt-8 shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="name"
                label="Your Name"
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setNameError('');
                }}
                error={nameError}
                placeholder="Enter your name"
                required
                fullWidth
              />

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Continue
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </Card>

          {/* Anonymous login */}
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await createAnonymousUser();
                  navigate('/');
                  showToast({
                    type: 'success',
                    message: 'Logged in anonymously!',
                  });
                } catch (error) {
                  console.error('Anonymous login error:', error);
                  showToast({
                    type: 'error',
                    message: 'Failed to create anonymous user',
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Continue Anonymously
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};