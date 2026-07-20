import type { Client } from '../../clients/types/client'

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'CLOSED'
export type ContractType = 'SERVICE' | 'SUPPLY' | 'RENTAL' | 'OTHER'
export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ContractItem {
  id?: string
  description: string
  quantity: string
  unitPrice: string
}

export interface Contract {
  id: string
  number: string
  type: ContractType
  dueDate: string
  status: ContractStatus
  approvalStatus: ApprovalStatus
  currency: 'BRL'
  discount: string
  additionalFees: string
  subtotal: string
  value: string
  closedAt: string | null
  client: Client
  items: ContractItem[]
}

export interface ContractFilters {
  status?: ContractStatus
  type?: ContractType
  approvalStatus?: ApprovalStatus
  clientId?: string
}

export interface ContractInput {
  number: string
  clientId: string
  type: ContractType
  dueDate: string
  currency: 'BRL'
  discount: string
  additionalFees: string
  items: Array<Pick<ContractItem, 'description' | 'quantity' | 'unitPrice'>>
}

export type CreateContractInput = ContractInput
export type UpdateContractInput = ContractInput

export interface ApprovalHistoryEntry {
  id: string
  version: number
  status: ApprovalStatus
  submittedAt: string
  decidedAt: string | null
  rejectionReason: string | null
  snapshot: {
    number: string
    clientId: string
    type: ContractType
    dueDate: string
    currency: 'BRL'
    discount: string
    additionalFees: string
    subtotal: string
    value: string
    items: Array<Pick<ContractItem, 'description' | 'quantity' | 'unitPrice'>>
  }
}

export interface ContractSummary {
  active: number
  expired: number
  closed: number
  total: number
}
