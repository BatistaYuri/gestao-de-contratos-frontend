

let getAccessToken: () => string | null = () => null
let handleUnauthorized: () => void = () => undefined
const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function configureApiAuth(config: {
  getToken: () => string | null
  onUnauthorized: () => void
}) {
  getAccessToken = config.getToken
  handleUnauthorized = config.onUnauthorized
}

export class ApiError extends Error {
  readonly status: number
  readonly issues: ApiIssue[]

  constructor(message: string, status: number, issues: ApiIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

export interface ApiIssue {
  path?: string | (string | number)[]
  message?: string
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | undefined> {
  const headers = new Headers(options.headers)
  const token = getAccessToken()

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized()
      }

      let body: { message?: string; issues?: ApiIssue[] } = {}
      try {
        body = (await response.json()) as typeof body
      } catch {
        // Some API errors legitimately have no JSON response body.
      }

      throw new ApiError(
        body.message ?? `A requisição falhou com status ${response.status}.`,
        response.status,
        Array.isArray(body.issues) ? body.issues : [],
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
