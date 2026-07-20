import { Navigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/contracts" replace />
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <h2 id="login-title">Bem-vindo à Gestão de Contratos da WebMais</h2>
        <LoginForm />
      </section>
    </main>
  )
}
