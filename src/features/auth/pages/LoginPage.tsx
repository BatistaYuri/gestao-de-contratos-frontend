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
      <section className="auth-intro" aria-label="WebMais">
        <div className="brand-lockup brand-lockup-light">
          <img src="https://webmaissistemas.com.br/assets/images/logos/logo-webmais-positive.svg" alt="WebMais Sistemas" />
        </div>
        <p className="eyebrow">Gestão simples e eficiente</p>
        <h1>Seus contratos organizados. Suas decisões mais rápidas.</h1>
        <p>Centralize informações, acompanhe prazos e mantenha a operação sob controle.</p>
      </section>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Área segura</p>
        <h2 id="login-title">Bem-vindo de volta</h2>
        <p>Entre com suas credenciais para acessar a gestão de contratos.</p>
        <LoginForm />
      </section>
    </main>
  )
}
