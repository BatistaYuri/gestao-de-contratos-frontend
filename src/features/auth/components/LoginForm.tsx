import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { useAuth } from '../context/useAuth'

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!username.trim() || !password) {
      setErrorMessage('Informe o usuário e a senha.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({ username: username.trim(), password })
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.status === 401
          ? 'Usuário ou senha inválidos.'
          : 'Não foi possível conectar à API. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="username">Usuário</label>
      <input
        id="username"
        type="text"
        placeholder="Digite seu usuário"
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        disabled={isSubmitting}
        required
      />

      <label htmlFor="password">Senha</label>
      <input
        id="password"
        type="password"
        placeholder="Digite sua senha"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isSubmitting}
        required
      />

      {errorMessage && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
