import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ContractsPage } from '../features/contracts/pages/ContractsPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/contracts', element: <ContractsPage /> },
      { path: '/contracts/add', element: <ContractsPage /> },
      { path: '/contracts/:id/edit', element: <ContractsPage /> },
      { path: '/contracts/:id/delete', element: <ContractsPage /> },
      { path: '/clients/add', element: <ContractsPage /> },
      { path: '/clients/:id/edit', element: <ContractsPage /> },
      { path: '/clients/:id/delete', element: <ContractsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/contracts" replace /> },
])
