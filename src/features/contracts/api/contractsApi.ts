import { apiRequest } from '../../../lib/api-client'
import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
} from '../types/contract'

export async function getContracts() {
  return (await apiRequest<Contract[]>('/contracts')) ?? []
}

export async function createContract(input: CreateContractInput) {
  await apiRequest('/contracts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getContract(id: string) {
  return apiRequest<Contract>(`/contracts/${id}`)
}

export async function updateContract(id: string, input: UpdateContractInput) {
  await apiRequest(`/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function closeContract(id: string) {
  await apiRequest(`/contracts/${id}/close`, { method: 'PATCH' })
}

export async function deleteContract(id: string) {
  await apiRequest(`/contracts/${id}`, { method: 'DELETE' })
}
