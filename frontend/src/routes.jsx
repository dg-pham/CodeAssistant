import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Layouts
import Layout from './components/common/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodeGenerator from './pages/CodeGenerator';
import CodeOptimizer from './pages/CodeOptimizer';
// Placeholder for other pages that will be implemented
const CodeTranslator = () => <div>Code Translator Page</div>;
const CodeExplainer = () => <div>Code Explainer Page</div>;
const SnippetManager = () => <div>Snippet Manager Page</div>;
const ConversationList = () => <div>Conversation List Page</div>;
const Conversation = () => <div>Conversation Page</div>;
const Profile = () => <div>Profile Page</div>;
const NotFound = () => <div>404 Page Not Found</div>;

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public route that redirects to dashboard if authenticated
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  // Redirect if authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Define routes
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '/code/generate',
        element: (
          <ProtectedRoute>
            <CodeGenerator />
          </ProtectedRoute>
        )
      },
      {
        path: '/code/optimize',
        element: (
          <ProtectedRoute>
            <CodeOptimizer />
          </ProtectedRoute>
        )
      },
      {
        path: '/code/translate',
        element: (
          <ProtectedRoute>
            <CodeTranslator />
          </ProtectedRoute>
        )
      },
      {
        path: '/code/explain',
        element: (
          <ProtectedRoute>
            <CodeExplainer />
          </ProtectedRoute>
        )
      },
      {
        path: '/snippets',
        element: (
          <ProtectedRoute>
            <SnippetManager />
          </ProtectedRoute>
        )
      },
      {
        path: '/snippets/:snippetId',
        element: (
          <ProtectedRoute>
            <SnippetManager />
          </ProtectedRoute>
        )
      },
      {
        path: '/conversations',
        element: (
          <ProtectedRoute>
            <ConversationList />
          </ProtectedRoute>
        )
      },
      {
        path: '/conversation/:conversationId',
        element: (
          <ProtectedRoute>
            <Conversation />
          </ProtectedRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <NotFound /> }
    ]
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    )
  }
];

export default routes;