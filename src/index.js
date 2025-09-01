import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  window.__GOOGLE_CLIENT_ID__ || // fallback if you want to set it manually
  '';

if (!CLIENT_ID) {
  console.warn('⚠️ Missing Google Client ID. Make sure to set it in .env');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);