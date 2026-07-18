import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { getClients } from '../../clients/api/clientsApi'
import { ClientForm } from '../../clients/components/ClientForm'
import { ClientList } from '../../clients/components/ClientList'
import type { Client } from '../../clients/types/client'
import { getContracts } from '../api/contractsApi'
import { ContractForm } from '../components/ContractForm'
import { ContractList } from '../components/ContractList'
import type { Contract } from '../types/contract'

export function ContractsPage() {
  const { logout } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoadingContracts, setIsLoadingContracts] = useState(true)
  const [contractsError, setContractsError] = useState('')

  async function loadContracts() {
    setIsLoadingContracts(true)
    setContractsError('')

    try {
      setContracts(await getContracts())
    } catch {
      setContractsError('Não foi possível carregar os contratos.')
    } finally {
      setIsLoadingContracts(false)
    }
  }

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
      .finally(() => setIsLoadingClients(false))

    getContracts()
      .then(setContracts)
      .catch(() =>
        setContractsError('Não foi possível carregar os contratos.'),
      )
      .finally(() => setIsLoadingContracts(false))
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
        <div className="section-header">
          <h2 id="contracts-title">Contratos</h2>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadContracts()}
            disabled={isLoadingContracts}
          >
            {isLoadingContracts ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
        <div className="contracts-layout">
          <div>
            <h3>Novo contrato</h3>
            <ContractForm clients={clients} onContractCreated={loadContracts} />
          </div>
          <div>
            <h3>Contratos cadastrados</h3>
            <ContractList
              contracts={contracts}
              isLoading={isLoadingContracts}
              errorMessage={contractsError}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
