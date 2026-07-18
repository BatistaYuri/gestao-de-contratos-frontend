import { apiRequest } from '../../../lib/api-client'
import type { Contract, CreateContractInput } from '../types/contract'

export async function getContracts() {
  return (await apiRequest<Contract[]>('/contracts')) ?? []
}

export async function createContract(input: CreateContractInput) {
  await apiRequest('/contracts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
