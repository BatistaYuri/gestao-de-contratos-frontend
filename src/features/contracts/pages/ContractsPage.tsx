import { useEffect, useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/useAuth'
import { getClients } from '../../clients/api/clientsApi'
import { ClientForm } from '../../clients/components/ClientForm'
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
  const editRoute = useMatch('/contracts/:id/edit')
  const deleteRoute = useMatch('/contracts/:id/delete')
  const editContractId = editRoute?.params.id
  const deleteContractId = deleteRoute?.params.id
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState('')
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
    </main>
  )
}
