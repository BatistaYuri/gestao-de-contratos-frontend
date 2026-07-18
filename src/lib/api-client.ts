const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_STORAGE_KEY = 'auth_token'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | undefined> {
  const headers = new Headers(options.headers)
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers })

    if (!response.ok) {
      throw new ApiError(
        `A requisição falhou com status ${response.status}.`,
        response.status,
      )
    }

    return response.status === 204 ? undefined : ((await response.json()) as T)
  } catch (error) {
    if (error instanceof ApiError || options.signal?.aborted) {
      throw error
    }

    throw new Error('Não foi possível conectar à API.', { cause: error })
  }
}
