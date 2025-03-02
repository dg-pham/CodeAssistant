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
import { createUser } from '@/store/slices/userSlice';
import Layout from '@/components/layout/Layout';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, error } = useSelector((state: RootState) => state.user);

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // If already registered and logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const validateUsername = () => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUsername()) {
      dispatch(createUser({ name: username }));
    }
  };

  if (isLoading) {
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
              Create Account
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Join Code Agent and start coding with AI
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister} noValidate>
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
              onBlur={validateUsername}
              error={!!usernameError}
              helperText={usernameError}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!username.trim() || !!usernameError}
            >
              Create Account
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign in
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
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default RegisterPage;