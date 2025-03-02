import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Menu as MenuIcon, Code as CodeIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ mr: 1 }} />
          Code Agent
        </Typography>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleNavigate('/')}>Dashboard</MenuItem>
          <MenuItem onClick={() => handleNavigate('/chat')}>Chat</MenuItem>
          <MenuItem onClick={() => handleNavigate('/code-editor')}>Code Editor</MenuItem>
          <MenuItem onClick={() => handleNavigate('/snippets')}>Code Snippets</MenuItem>
          <MenuItem onClick={() => handleNavigate('/settings')}>Settings</MenuItem>
        </Menu>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {currentUser.name}
            </Typography>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </Avatar>
          </div>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;