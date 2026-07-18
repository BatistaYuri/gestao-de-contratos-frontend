import { useEffect, useState } from 'react'
import { ApiError, apiRequest } from '../lib/api-client'

type HealthStatus = 'loading' | 'available' | 'unavailable'

export function App() {
  const [status, setStatus] = useState<HealthStatus>('loading')
  const [message, setMessage] = useState('Verificando a API...')

  useEffect(() => {
    const controller = new AbortController()

    apiRequest<unknown>('/health', { signal: controller.signal })
      .then(() => {
        setStatus('available')
        setMessage('API disponível')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setStatus('unavailable')
        setMessage(
          error instanceof ApiError
            ? `A API respondeu com erro (${error.status}).`
            : 'Não foi possível conectar à API.',
        )
      })

    return () => controller.abort()
  }, [])

  return (
    <main className="app-shell">
      <h1>Gestão de Contratos</h1>
      <p>Frontend conectado à API do módulo de contratos.</p>
      <p className={`api-status api-status--${status}`} role="status">
        {message}
      </p>
    </main>
  )
}
