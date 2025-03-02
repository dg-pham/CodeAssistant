import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme, darkTheme } from '@/theme';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  // Áp dụng màu nền cho body
  useEffect(() => {
    document.body.style.backgroundColor = darkMode
      ? darkTheme.palette.background.default
      : theme.palette.background.default;
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={darkMode ? darkTheme : theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};