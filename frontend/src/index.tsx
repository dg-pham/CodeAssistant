import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Thêm global error handler
window.addEventListener('error', (event) => {
  // Bỏ qua lỗi từ SES/lockdown-install.js
  if (event.filename?.includes('lockdown-install.js')) {
    event.preventDefault();
    console.warn('SES error prevented:', event.message);
    return;
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);