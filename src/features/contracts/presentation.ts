import type {
  ApprovalStatus,
  ContractStatus,
  ContractType,
} from './types/contract'

export const contractTypeLabels: Record<ContractType, string> = {
  SERVICE: 'Serviço',
  SUPPLY: 'Fornecimento',
  RENTAL: 'Locação',
  OTHER: 'Outro',
}

export const contractStatusLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Ativo',
  EXPIRED: 'Expirado',
  CLOSED: 'Encerrado',
}

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  DRAFT: 'Rascunho',
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}
