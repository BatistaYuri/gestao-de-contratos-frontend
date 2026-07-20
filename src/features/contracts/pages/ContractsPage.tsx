import { useEffect, useState } from 'react'
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/context/useAuth'
import { getAllClients, getClient, getClients } from '../../clients/api/clientsApi'
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
import { ContractFilters } from '../components/ContractFilters'
import { ApprovalHistoryModal } from '../components/ApprovalHistoryModal'
import { RejectContractModal } from '../components/RejectContractModal'
import { ContractSummary } from '../components/ContractSummary'
import type {
  Contract,
  ContractFilters as ContractFiltersData,
  ContractSummary as ContractSummaryData,
} from '../types/contract'
import { Pagination } from '../../../components/Pagination'
import type { PaginationMeta } from '../../../types/pagination'

const PAGE_SIZE = 10
const initialPagination: PaginationMeta = {
  page: 1,
  pageSize: PAGE_SIZE,
  total: 0,
  totalPages: 0,
}

export function ContractsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
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
  const [listedClients, setListedClients] = useState<Client[]>([])
  const [clientsPage, setClientsPage] = useState(1)
  const [clientsPagination, setClientsPagination] = useState(initialPagination)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState('')
  const [routeClient, setRouteClient] = useState<Client | null>(null)
  const [clientRouteError, setClientRouteError] = useState('')
  const [clientActionMessage, setClientActionMessage] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contractsPage, setContractsPage] = useState(1)
  const [contractsPagination, setContractsPagination] = useState(initialPagination)
  const [isLoadingContracts, setIsLoadingContracts] = useState(true)
  const [contractsError, setContractsError] = useState('')
  const [summary, setSummary] = useState<ContractSummaryData | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [routeContract, setRouteContract] = useState<Contract | null>(null)
  const [historyContract, setHistoryContract] = useState<Contract | null>(null)
  const [rejectingContract, setRejectingContract] = useState<Contract | null>(null)
  const [routeError, setRouteError] = useState<{
    contractId: string
    message: string
  } | null>(null)

  const filters: ContractFiltersData = {
    status: (searchParams.get('status') || undefined) as ContractFiltersData['status'],
    type: (searchParams.get('type') || undefined) as ContractFiltersData['type'],
    approvalStatus: (searchParams.get('approvalStatus') || undefined) as ContractFiltersData['approvalStatus'],
    clientId: searchParams.get('clientId') || undefined,
  }
  const filterSearch = searchParams.toString()
  const listLocation = { pathname: '/contracts', search: filterSearch }
  const withFilters = (pathname: string) => ({ pathname, search: filterSearch })

  function fetchContracts(activeFilters = filters, page = contractsPage) {
    setIsLoadingContracts(true)
    setContractsError('')
    return getContracts(activeFilters, { page, pageSize: PAGE_SIZE })
      .then((response) => {
        if (!response) return
        setContracts(response.data)
        setContractsPagination(response.pagination)
        if (page > Math.max(1, response.pagination.totalPages)) {
          setContractsPage(Math.max(1, response.pagination.totalPages))
        }
      })
      .catch(() =>
        setContractsError('Não foi possível carregar os contratos.'),
      )
      .finally(() => setIsLoadingContracts(false))
  }

  function fetchClients(page = clientsPage) {
    setIsLoadingClients(true)
    setClientsError('')
    return getClients({ page, pageSize: PAGE_SIZE })
      .then((response) => {
        if (!response) return
        setListedClients(response.data)
        setClientsPagination(response.pagination)
        if (page > Math.max(1, response.pagination.totalPages)) {
          setClientsPage(Math.max(1, response.pagination.totalPages))
        }
      })
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
      .finally(() => setIsLoadingClients(false))
  }

  function fetchSummary(activeFilters = filters) {
    setIsLoadingSummary(true)
    setSummaryError('')
    return getContractSummary(activeFilters)
      .then((data) => setSummary(data ?? null))
      .catch(() => setSummaryError('Não foi possível carregar o resumo.'))
      .finally(() => setIsLoadingSummary(false))
  }

  async function loadContractsAndSummary(activeFilters = filters) {
    setIsLoadingContracts(true)
    setIsLoadingSummary(true)
    setContractsError('')
    setSummaryError('')

    await Promise.all([fetchContracts(activeFilters), fetchSummary(activeFilters)])
  }

  async function refreshClients() {
    await Promise.all([
      fetchClients(),
      getAllClients().then(setClients),
    ])
  }

  useEffect(() => {
    getAllClients()
      .then(setClients)
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
  }, [])

  useEffect(() => {
    getClients({ page: clientsPage, pageSize: PAGE_SIZE })
      .then((response) => {
        if (!response) return
        setListedClients(response.data)
        setClientsPagination(response.pagination)
      })
      .catch(() => setClientsError('Não foi possível carregar os clientes.'))
      .finally(() => setIsLoadingClients(false))
  }, [clientsPage])

  useEffect(() => {
    const activeFilters: ContractFiltersData = {
      status: (searchParams.get('status') || undefined) as ContractFiltersData['status'],
      type: (searchParams.get('type') || undefined) as ContractFiltersData['type'],
      approvalStatus: (searchParams.get('approvalStatus') || undefined) as ContractFiltersData['approvalStatus'],
      clientId: searchParams.get('clientId') || undefined,
    }
    void Promise.all([
      getContracts(activeFilters, { page: contractsPage, pageSize: PAGE_SIZE })
        .then((response) => {
          if (!response) return
          setContracts(response.data)
          setContractsPagination(response.pagination)
        })
        .catch(() => setContractsError('Não foi possível carregar os contratos.'))
        .finally(() => setIsLoadingContracts(false)),
      getContractSummary(activeFilters)
        .then((data) => setSummary(data ?? null))
        .catch(() => setSummaryError('Não foi possível carregar o resumo.'))
        .finally(() => setIsLoadingSummary(false)),
    ])
  }, [searchParams, contractsPage])

  function applyFilters(nextFilters: ContractFiltersData) {
    const params = new URLSearchParams()
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    if (params.toString() === filterSearch) {
      if (contractsPage === 1) void loadContractsAndSummary(nextFilters)
      else {
        setIsLoadingContracts(true)
        setContractsPage(1)
      }
      return
    }

    setIsLoadingContracts(true)
    setIsLoadingSummary(true)
    setContractsError('')
    setSummaryError('')
    setContractsPage(1)
    setSearchParams(params)
  }

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
        const response = await getClients({ page: 1, pageSize: PAGE_SIZE })
        if (response) {
          setListedClients(response.data)
          setClientsPagination(response.pagination)
          setClientsPage(1)
        }
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
        <div className="brand-lockup">
          <img src="https://webmaissistemas.com.br/assets/images/logos/logo-webmais-positive.svg" alt="WebMais Sistemas" />
          <div>
            <p>Gestão de Contratos</p>
          </div>
        </div>
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
              clients={listedClients}
              isLoading={isLoadingClients}
              errorMessage={clientsError}
              onEdit={(client) => navigate(`/clients/${client.id}/edit`)}
              onDelete={(client) => navigate(`/clients/${client.id}/delete`)}
            />
            <Pagination
              pagination={clientsPagination}
              onPageChange={(page) => {
                setIsLoadingClients(true)
                setClientsPage(page)
              }}
              disabled={isLoadingClients}
            />
            {clientRouteError && (
              <p className="form-message error" role="alert">{clientRouteError}</p>
            )}
            {clientActionMessage && (
              <p className="form-message success" role="status">{clientActionMessage}</p>
            )}
        </div>
      </section>

      <section className="content-section" aria-labelledby="contracts-title">
        <div className="section-header">
          <h2 id="contracts-title">Contratos</h2>
          <div className="section-actions">
            <button
              type="button"
              onClick={() => navigate(withFilters('/contracts/add'))}
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
            <ContractFilters clients={clients} filters={filters} onApply={applyFilters} />
            <div className="summary-block" aria-labelledby="summary-title">
              <h3 id="summary-title">Resumo dos contratos</h3>
              <ContractSummary
                summary={summary}
                isLoading={isLoadingSummary}
                errorMessage={summaryError}
              />
            </div>
            <h3>Contratos cadastrados</h3>
            <ContractList
              contracts={contracts}
              isLoading={isLoadingContracts}
              errorMessage={contractsError}
              onEdit={(contract) => navigate(withFilters(`/contracts/${contract.id}/edit`))}
              onDelete={(contract) =>
                navigate(withFilters(`/contracts/${contract.id}/delete`))
              }
              onHistory={setHistoryContract}
              onReject={setRejectingContract}
              onChanged={loadContractsAndSummary}
            />
            <Pagination
              pagination={contractsPagination}
              onPageChange={(page) => {
                setIsLoadingContracts(true)
                setContractsPage(page)
              }}
              disabled={isLoadingContracts}
            />
          </div>
        </div>
      </section>
      {createRoute && (
        <CreateContractModal
          clients={clients}
          onCreated={loadContractsAndSummary}
          onClose={() => navigate(listLocation)}
        />
      )}
      {createClientRoute && (
        <CreateClientModal
          onCreated={async () => {
            await refreshClients()
            setClientActionMessage('Cliente cadastrado com sucesso.')
          }}
          onClose={() => navigate(listLocation)}
        />
      )}
      {editContractId && routeContract?.id === editContractId && (
        <EditContractModal
          clients={clients}
          contract={routeContract}
          onUpdated={loadContractsAndSummary}
          onClose={() => navigate(listLocation)}
        />
      )}
      {deleteContractId && routeContract?.id === deleteContractId && (
        <DeleteContractModal
          contract={routeContract}
          onDeleted={loadContractsAndSummary}
          onClose={() => navigate(listLocation)}
        />
      )}
      {editClientRoute && routeClient && routeClient.id === clientRouteId && (
        <EditClientModal
          client={routeClient}
          onUpdated={async (updated) => {
            setRouteClient(updated)
            await refreshClients()
            setClientActionMessage('Cliente atualizado com sucesso.')
          }}
          onNotFound={refreshClients}
          onClose={() => navigate(listLocation)}
        />
      )}
      {deleteClientRoute && routeClient && routeClient.id === clientRouteId && (
        <DeleteClientModal
          client={routeClient}
          onDeleted={async () => {
            await refreshClients()
            setClientActionMessage('Cliente excluído com sucesso.')
          }}
          onNotFound={refreshClients}
          onClose={() => navigate(listLocation)}
        />
      )}
      {historyContract && (
        <ApprovalHistoryModal contract={historyContract} onClose={() => setHistoryContract(null)} />
      )}
      {rejectingContract && (
        <RejectContractModal
          contract={rejectingContract}
          onClose={() => setRejectingContract(null)}
          onChanged={loadContractsAndSummary}
          onConflict={loadContractsAndSummary}
        />
      )}
    </main>
  )
}
