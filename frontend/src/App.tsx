import React from 'react';
import { CssBaseline } from '@mui/material';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import AppRouter from '@/router';
import { ThemeProvider } from '@/contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <CssBaseline />
          <AppRouter />
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;