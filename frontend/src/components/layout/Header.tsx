import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, useAppDispatch } from '@/store/store';
import { clearCurrentUser } from '@/store/slices/userSlice'; // Thêm import
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import { Menu as MenuIcon, Code as CodeIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  // Thêm hàm xử lý đăng xuất
  const handleLogout = () => {
    dispatch(clearCurrentUser());
    handleUserMenuClose();
    navigate('/login');
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
            <Button
              color="inherit"
              onClick={handleUserMenuOpen}
              startIcon={
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Avatar>
              }
            >
              {currentUser.name}
            </Button>
            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={() => handleNavigate('/settings')}>Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
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