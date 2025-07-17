import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
// import App from './App.tsx'
import { RouterProvider } from 'react-router'
import router from './router.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
