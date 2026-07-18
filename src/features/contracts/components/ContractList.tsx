import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { closeContract } from '../api/contractsApi'
import { ContractStatusBadge } from './ContractStatusBadge'
import type { Contract } from '../types/contract'

interface ContractListProps {
  contracts: Contract[]
  isLoading: boolean
  errorMessage: string
  onEdit: (contract: Contract) => void
  onDelete: (contract: Contract) => void
  onChanged: () => void | Promise<void>
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function ContractList({
  contracts,
  isLoading,
  errorMessage,
  onEdit,
  onDelete,
  onChanged,
}: ContractListProps) {
  const [processingId, setProcessingId] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [isActionError, setIsActionError] = useState(false)

  async function closeSelectedContract(contract: Contract) {
    if (!window.confirm(`Deseja encerrar o contrato ${contract.number}?`)) return

    setProcessingId(contract.id)
    setActionMessage('')

    try {
      await closeContract(contract.id)
      await onChanged()
      setIsActionError(false)
      setActionMessage('Contrato encerrado com sucesso.')
    } catch (error) {
      setIsActionError(true)
      setActionMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível encerrar o contrato.',
      )
    } finally {
      setProcessingId('')
    }
  }

  if (isLoading) return <p>Carregando contratos...</p>
  if (errorMessage) {
    return (
      <p className="form-message error" role="alert">
        {errorMessage}
      </p>
    )
  }
  if (contracts.length === 0) return <p>Nenhum contrato cadastrado.</p>

  return (
    <>
      {actionMessage && (
        <p
          className={isActionError ? 'form-message error' : 'form-message success'}
          role={isActionError ? 'alert' : 'status'}
        >
          {actionMessage}
        </p>
      )}
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.number}</td>
              <td>{contract.client.name}</td>
              <td>{currencyFormatter.format(Number(contract.value))}</td>
              <td>{dateFormatter.format(new Date(contract.dueDate))}</td>
              <td>
                <ContractStatusBadge status={contract.status} />
              </td>
              <td aria-label={`Ações do contrato ${contract.number}`}>
                <div className="table-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onEdit(contract)}
                    disabled={Boolean(processingId)}
                  >
                    Editar
                  </button>
                  {contract.status !== 'CLOSED' && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void closeSelectedContract(contract)}
                      disabled={Boolean(processingId)}
                    >
                      {processingId === contract.id ? 'Processando...' : 'Encerrar'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDelete(contract)}
                    disabled={Boolean(processingId)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
