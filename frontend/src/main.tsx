import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import ThemeInitializer from './components/ThemeInitializer.tsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '152277690774-klmvefke6jl6i60jo4h2lsmshs8d3vb9.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <ThemeInitializer />
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)

