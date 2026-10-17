import {
  StrictMode,
} from 'react'

import {
  createRoot,
} from 'react-dom/client'

import { AuthSessionProvider } from './auth/AuthSession'

import App from './App'

import './index.css'


createRoot(
  document.getElementById(
    'root',
  )!,
).render(
  <StrictMode>
    <AuthSessionProvider>
      <App />
    </AuthSessionProvider>
  </StrictMode>,
)
