import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Lazy-loaded components
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ChatPage = lazy(() => import('@/pages/chat/ChatPage'));
const CodeEditorPage = lazy(() => import('@/pages/code-editor/CodeEditorPage'));
const SnippetsPage = lazy(() => import('@/pages/snippets/SnippetsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const GitMergePage = lazy(() => import('@/pages/git/GitMergePage'));
const OrchestrationPage = lazy(() => import('@/pages/orchestration/OrchestrationPage'));
const WorkflowPage = lazy(() => import('@/pages/workflow/WorkflowPage'));


// Loading component for suspense fallback
const Loading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}
  >
    <CircularProgress />
  </Box>
);

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Private route component
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  // For this app, authentication is optional and we use anonymous users
  // So we'll always allow access, but in a real app you would
  // redirect to login if not authenticated
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/code-editor"
            element={
              <PrivateRoute>
                <CodeEditorPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/snippets"
            element={
              <PrivateRoute>
                <SnippetsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/git-merge"
            element={
              <PrivateRoute>
                <GitMergePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/git-merge/:sessionId"
            element={
              <PrivateRoute>
                <GitMergePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orchestration"
            element={
              <PrivateRoute>
                <OrchestrationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orchestration/:taskId"
            element={
              <PrivateRoute>
                <OrchestrationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflow"
            element={
              <PrivateRoute>
                <WorkflowPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflow/:workflowId"
            element={
              <PrivateRoute>
                <WorkflowPage />
              </PrivateRoute>
            }
          />
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;