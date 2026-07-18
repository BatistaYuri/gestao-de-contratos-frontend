import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { configureApiAuth } from '../../../lib/api-client'
import { login as requestLogin } from '../api/login'
import type { LoginCredentials } from '../types/auth'
import {
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from '../utils/auth-storage'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAuthToken()),
  )

  const logout = useCallback(() => {
    removeAuthToken()
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    configureApiAuth({ getToken: getAuthToken, onUnauthorized: logout })
  }, [logout])

  async function login(credentials: LoginCredentials) {
    const nextToken = await requestLogin(credentials)
    setAuthToken(nextToken)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
