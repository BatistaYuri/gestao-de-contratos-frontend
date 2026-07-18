import type { ContractStatus } from '../types/contract'

const statusLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Ativo',
  EXPIRED: 'Vencido',
  CLOSED: 'Encerrado',
}

interface ContractStatusBadgeProps {
  status: ContractStatus
}

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {statusLabels[status]}
    </span>
  )
}
