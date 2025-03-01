import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { useUserStore } from './store';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CodePage } from './pages/CodePage';
import { SnippetsPage } from './pages/SnippetsPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Auth guard component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, createAnonymousUser } = useUserStore();

  useEffect(() => {
    const ensureUser = async () => {
      if (!currentUser) {
        try {
          await createAnonymousUser();
        } catch (error) {
          console.error('Failed to create anonymous user:', error);
        }
      }
    };

    ensureUser();
  }, [currentUser, createAnonymousUser]);

  if (!currentUser) {
    // Return loading state or redirect
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/code"
            element={
              <ProtectedRoute>
                <CodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snippets"
            element={
              <ProtectedRoute>
                <SnippetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <ConversationsPage />
              </ProtectedRoute>
            }
          />

          {/* Code function-specific routes */}
          <Route
            path="/code/generate"
            element={
              <ProtectedRoute>
                <CodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/code/optimize"
            element={
              <ProtectedRoute>
                <CodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/code/translate"
            element={
              <ProtectedRoute>
                <CodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/code/explain"
            element={
              <ProtectedRoute>
                <CodePage />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
};

export default App;