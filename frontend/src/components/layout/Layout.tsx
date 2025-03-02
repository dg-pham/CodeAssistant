import React from 'react';
import { Container, Box, useTheme } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  padding?: number;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  maxWidth = 'lg',
  padding = 3
}) => {
  const theme = useTheme();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <Header />
      <Box component="main" sx={{
        flexGrow: 1,
        pt: `calc(${theme.spacing(8)} + ${theme.spacing(padding)})`,
        pb: padding,
        px: { xs: 2, sm: padding }
      }}>
        <Container maxWidth={maxWidth} sx={{ height: '100%' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;