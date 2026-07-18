import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ContractsPage } from '../features/contracts/pages/ContractsPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/contracts', element: <ContractsPage /> }],
  },
  { path: '*', element: <Navigate to="/contracts" replace /> },
])
