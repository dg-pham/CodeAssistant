import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            width: '100%',
            maxWidth: 500,
            borderRadius: 2
          }}
        >
          <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', fontWeight: 700 }}>
            404
          </Typography>

          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
            >
              Go to Homepage
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default NotFoundPage;