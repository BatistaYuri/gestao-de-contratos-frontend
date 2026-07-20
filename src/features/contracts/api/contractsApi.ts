import { apiRequest } from '../../../lib/api-client'
import type {
  ApprovalHistoryEntry,
  Contract,
  ContractFilters,
  ContractSummary,
  CreateContractInput,
  UpdateContractInput,
} from '../types/contract'
import type { PaginatedResponse, PaginationQuery } from '../../../types/pagination'

export async function getContracts(filters: ContractFilters = {}, pagination: PaginationQuery = { page: 1, pageSize: 20 }) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  params.set('page', String(pagination.page))
  params.set('pageSize', String(pagination.pageSize))
  return apiRequest<PaginatedResponse<Contract>>(`/contracts?${params.toString()}`)
}

export async function getContractSummary(filters: ContractFilters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const query = params.size ? `?${params.toString()}` : ''
  return apiRequest<ContractSummary>(`/contracts/summary${query}`)
}

export async function createContract(input: CreateContractInput) {
  return apiRequest<Contract>('/contracts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getContract(id: string) {
  return apiRequest<Contract>(`/contracts/${id}`)
}

export async function updateContract(id: string, input: UpdateContractInput) {
  return apiRequest<Contract>(`/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

function transition(id: string, action: string, body?: object) {
  return apiRequest<Contract>(`/contracts/${id}/${action}`, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function submitContract(id: string) {
  return transition(id, 'submit')
}

export function approveContract(id: string) {
  return transition(id, 'approve')
}

export function rejectContract(id: string, reason: string) {
  return transition(id, 'reject', { reason })
}

export function closeContract(id: string) {
  return transition(id, 'close')
}

export async function getApprovalHistory(id: string) {
  return (await apiRequest<ApprovalHistoryEntry[]>(
    `/contracts/${id}/approval-history`,
  )) ?? []
}

export async function deleteContract(id: string) {
  await apiRequest(`/contracts/${id}`, { method: 'DELETE' })
}
