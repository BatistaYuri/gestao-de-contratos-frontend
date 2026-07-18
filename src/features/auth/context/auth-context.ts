import { createContext } from 'react'
import type { LoginCredentials } from '../types/auth'

export interface AuthContextValue {
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
