import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Button } from '../components/common';

export const NotFoundPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-6xl font-extrabold text-primary-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Link to="/">
              <Button variant="outline">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};