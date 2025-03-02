import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { getOrCreateAnonymousUser } from '@/store/slices/userSlice';
import Layout from '@/components/layout/Layout';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, error } = useSelector((state: RootState) => state.user);

  const [username, setUsername] = useState('');
  const [anonymousLoading, setAnonymousLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For simplicity, we'll just create an anonymous user with the provided name
    dispatch(getOrCreateAnonymousUser(username));
  };

  const handleContinueAsGuest = async () => {
    setAnonymousLoading(true);
    try {
      await dispatch(getOrCreateAnonymousUser()).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Error creating anonymous user:', err);
    } finally {
      setAnonymousLoading(false);
    }
  };

  if (isLoading || anonymousLoading) {
    return (
      <Layout maxWidth="xs">
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="xs">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Code Agent
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sign in to access your personalized AI assistant
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!username.trim()}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={handleContinueAsGuest}
            >
              Continue as Guest
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Create an account
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <Link component={RouterLink} to="/" variant="body2">
                  Return to Home
                </Link>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default LoginPage;