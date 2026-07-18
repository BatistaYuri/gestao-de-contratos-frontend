import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { getClients } from '../../clients/api/clientsApi'
import { ClientForm } from '../../clients/components/ClientForm'
import { ClientList } from '../../clients/components/ClientList'
import type { Client } from '../../clients/types/client'

export function ContractsPage() {
  const { logout } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState('')

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
      .finally(() => setIsLoadingClients(false))
  }, [])

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Gestão de Contratos</h1>
        <button type="button" className="secondary-button" onClick={logout}>
          Sair
        </button>
      </header>

      <section className="content-section" aria-labelledby="clients-title">
        <h2 id="clients-title">Clientes</h2>
        <div className="clients-layout">
          <div>
            <h3>Novo cliente</h3>
            <ClientForm
              onClientCreated={(client) =>
                setClients((current) => [...current, client])
              }
            />
          </div>
          <div>
            <h3>Clientes cadastrados</h3>
            <ClientList
              clients={clients}
              isLoading={isLoadingClients}
              errorMessage={clientsError}
            />
          </div>
        </div>
      </section>

      <section className="content-section" aria-labelledby="contracts-title">
        <h2 id="contracts-title">Contratos</h2>
        <p>A gestão de contratos será disponibilizada em uma próxima etapa.</p>
      </section>
    </main>
  )
}
