import { apiRequest } from '../../../lib/api-client'
import type { LoginCredentials, LoginResponse } from '../types/auth'

export async function login(credentials: LoginCredentials) {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  if (!response?.token) {
    throw new Error('A API não retornou um token de acesso.')
  }

  return response.token
}
