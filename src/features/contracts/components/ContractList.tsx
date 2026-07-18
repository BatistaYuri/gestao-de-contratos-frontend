import { ContractStatusBadge } from './ContractStatusBadge'
import type { Contract } from '../types/contract'

interface ContractListProps {
  contracts: Contract[]
  isLoading: boolean
  errorMessage: string
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
}: ContractListProps) {
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
              <td aria-label={`Ações do contrato ${contract.number}`}>—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
