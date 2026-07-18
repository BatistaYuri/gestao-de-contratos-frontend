import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { AuthenticatedPage } from './AuthenticatedPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/contracts', element: <AuthenticatedPage /> }],
  },
  { path: '*', element: <Navigate to="/contracts" replace /> },
])
