import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './lib/auth'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="541876873252-jc4q1vgotr0a5qgv75a65kmesppq8kct.apps.googleusercontent.com">
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>
)
