import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="846342530574-h044i5hdsrcjgeig3o8e0gt5ueapfbg9.apps.googleusercontent.com">
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
