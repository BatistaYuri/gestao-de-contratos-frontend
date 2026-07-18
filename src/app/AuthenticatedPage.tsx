import { useAuth } from '../features/auth/context/useAuth'

export function AuthenticatedPage() {
  const { logout } = useAuth()

  return (
    <main className="app-shell">
      <h1>Gestão de Contratos</h1>
      <button type="button" onClick={logout}>
        Sair
      </button>
    </main>
  )
}
