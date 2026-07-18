import type { Client } from '../../clients/types/client'

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'CLOSED'

export interface Contract {
  id: string
  number: string
  value: number | string
  dueDate: string
  status: ContractStatus
  client: Client
}

export interface CreateContractInput {
  number: string
  clientId: string
  value: number
  dueDate: string
}

export type UpdateContractInput = CreateContractInput

export interface ContractSummary {
  active: number
  expired: number
  closed: number
  total: number
}
