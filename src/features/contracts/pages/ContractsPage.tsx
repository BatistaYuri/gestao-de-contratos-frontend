import { useEffect, useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/useAuth'
import { getClient, getClients } from '../../clients/api/clientsApi'
import { CreateClientModal } from '../../clients/components/CreateClientModal'
import { DeleteClientModal } from '../../clients/components/DeleteClientModal'
import { EditClientModal } from '../../clients/components/EditClientModal'
import { ClientList } from '../../clients/components/ClientList'
import type { Client } from '../../clients/types/client'
import {
  getContract,
  getContracts,
  getContractSummary,
} from '../api/contractsApi'
import { CreateContractModal } from '../components/CreateContractModal'
import { DeleteContractModal } from '../components/DeleteContractModal'
import { EditContractModal } from '../components/EditContractModal'
import { ContractList } from '../components/ContractList'
import { ContractSummary } from '../components/ContractSummary'
import type {
  Contract,
  ContractSummary as ContractSummaryData,
} from '../types/contract'

export function ContractsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const createRoute = useMatch('/contracts/add')
  const createClientRoute = useMatch('/clients/add')
  const editRoute = useMatch('/contracts/:id/edit')
  const deleteRoute = useMatch('/contracts/:id/delete')
  const editClientRoute = useMatch('/clients/:id/edit')
  const deleteClientRoute = useMatch('/clients/:id/delete')
  const editContractId = editRoute?.params.id
  const deleteContractId = deleteRoute?.params.id
  const clientRouteId = editClientRoute?.params.id ?? deleteClientRoute?.params.id
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState('')
  const [routeClient, setRouteClient] = useState<Client | null>(null)
  const [clientRouteError, setClientRouteError] = useState('')
  const [clientActionMessage, setClientActionMessage] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoadingContracts, setIsLoadingContracts] = useState(true)
  const [contractsError, setContractsError] = useState('')
  const [summary, setSummary] = useState<ContractSummaryData | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [routeContract, setRouteContract] = useState<Contract | null>(null)
  const [routeError, setRouteError] = useState<{
    contractId: string
    message: string
  } | null>(null)

  function fetchContracts() {
    return getContracts()
      .then(setContracts)
      .catch(() =>
        setContractsError('Não foi possível carregar os contratos.'),
      )
      .finally(() => setIsLoadingContracts(false))
  }

  function fetchClients() {
    setIsLoadingClients(true)
    setClientsError('')
    return getClients()
      .then(setClients)
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
      .finally(() => setIsLoadingClients(false))
  }

  function fetchSummary() {
    return getContractSummary()
      .then((data) => setSummary(data ?? null))
      .catch(() => setSummaryError('Não foi possível carregar o resumo.'))
      .finally(() => setIsLoadingSummary(false))
  }

  async function loadContractsAndSummary() {
    setIsLoadingContracts(true)
    setIsLoadingSummary(true)
    setContractsError('')
    setSummaryError('')

    await Promise.all([fetchContracts(), fetchSummary()])
  }

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
      .finally(() => setIsLoadingClients(false))

    void fetchContracts()
    void fetchSummary()
  }, [])

  useEffect(() => {
    if (!clientRouteId) return

    getClient(clientRouteId)
      .then((client) => {
        setRouteClient(client)
        setClientRouteError('')
      })
      .catch(async (error) => {
        setClientRouteError(
          error instanceof Error && 'status' in error && error.status === 404
            ? 'Cliente não encontrado. A lista foi atualizada.'
            : 'Não foi possível carregar o cliente.',
        )
        await fetchClients()
      })
  }, [clientRouteId])

  useEffect(() => {
    const contractId = editContractId ?? deleteContractId
    if (!contractId) return

    getContract(contractId)
      .then((contract) => {
        if (contract) {
          setRouteContract(contract)
          setRouteError(null)
        } else {
          setRouteError({
            contractId,
            message: 'Contrato não encontrado.',
          })
        }
      })
      .catch(() =>
        setRouteError({
          contractId,
          message: 'Não foi possível carregar o contrato.',
        }),
      )
  }, [editContractId, deleteContractId])

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Gestão de Contratos</h1>
        <button type="button" className="secondary-button" onClick={logout}>
          Sair
        </button>
      </header>

      <section className="content-section" aria-labelledby="clients-title">
        <div className="section-header">
          <h2 id="clients-title">Clientes</h2>
          <button type="button" onClick={() => navigate('/clients/add')}>
            Novo cliente
          </button>
        </div>
        <div>
            <ClientList
              clients={clients}
              isLoading={isLoadingClients}
              errorMessage={clientsError}
              onEdit={(client) => navigate(`/clients/${client.id}/edit`)}
              onDelete={(client) => navigate(`/clients/${client.id}/delete`)}
            />
            {clientRouteError && (
              <p className="form-message error" role="alert">{clientRouteError}</p>
            )}
            {clientActionMessage && (
              <p className="form-message success" role="status">{clientActionMessage}</p>
            )}
        </div>
      </section>

      <section className="content-section" aria-labelledby="summary-title">
        <h2 id="summary-title">Resumo</h2>
        <ContractSummary
          summary={summary}
          isLoading={isLoadingSummary}
          errorMessage={summaryError}
        />
      </section>

      <section className="content-section" aria-labelledby="contracts-title">
        <div className="section-header">
          <h2 id="contracts-title">Contratos</h2>
          <div className="section-actions">
            <button
              type="button"
              onClick={() => navigate('/contracts/add')}
              disabled={clients.length === 0}
            >
              Novo contrato
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => void loadContractsAndSummary()}
              disabled={isLoadingContracts || isLoadingSummary}
            >
              {isLoadingContracts || isLoadingSummary
                ? 'Atualizando...'
                : 'Atualizar'}
            </button>
          </div>
        </div>
        {routeError &&
          routeError.contractId === (editContractId ?? deleteContractId) && (
          <p className="form-message error" role="alert">
            {routeError.message}
          </p>
        )}
        <div className="contracts-layout">
          <div>
            <h3>Contratos cadastrados</h3>
            <ContractList
              contracts={contracts}
              isLoading={isLoadingContracts}
              errorMessage={contractsError}
              onEdit={(contract) => navigate(`/contracts/${contract.id}/edit`)}
              onDelete={(contract) =>
                navigate(`/contracts/${contract.id}/delete`)
              }
              onChanged={loadContractsAndSummary}
            />
          </div>
        </div>
      </section>
      {createRoute && (
        <CreateContractModal
          clients={clients}
          onCreated={loadContractsAndSummary}
          onClose={() => navigate('/contracts')}
        />
      )}
      {createClientRoute && (
        <CreateClientModal
          onCreated={(client) => {
            setClients((current) => [...current, client])
            setClientActionMessage('Cliente cadastrado com sucesso.')
          }}
          onClose={() => navigate('/contracts')}
        />
      )}
      {editContractId && routeContract?.id === editContractId && (
        <EditContractModal
          clients={clients}
          contract={routeContract}
          onUpdated={loadContractsAndSummary}
          onClose={() => navigate('/contracts')}
        />
      )}
      {deleteContractId && routeContract?.id === deleteContractId && (
        <DeleteContractModal
          contract={routeContract}
          onDeleted={loadContractsAndSummary}
          onClose={() => navigate('/contracts')}
        />
      )}
      {editClientRoute && routeClient && routeClient.id === clientRouteId && (
        <EditClientModal
          client={routeClient}
          onUpdated={(updated) => {
            setClients((current) => current.map((client) => client.id === updated.id ? updated : client))
            setRouteClient(updated)
            setClientActionMessage('Cliente atualizado com sucesso.')
          }}
          onNotFound={fetchClients}
          onClose={() => navigate('/contracts')}
        />
      )}
      {deleteClientRoute && routeClient && routeClient.id === clientRouteId && (
        <DeleteClientModal
          client={routeClient}
          onDeleted={(id) => {
            setClients((current) => current.filter((client) => client.id !== id))
            setClientActionMessage('Cliente excluído com sucesso.')
          }}
          onNotFound={fetchClients}
          onClose={() => navigate('/contracts')}
        />
      )}
    </main>
  )
}
