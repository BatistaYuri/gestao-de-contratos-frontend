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
        <h1 id="login-title">Gestão de Contratos</h1>
        <p>Entre com as credenciais configuradas no backend.</p>
        <LoginForm />
      </section>
    </main>
  )
}
