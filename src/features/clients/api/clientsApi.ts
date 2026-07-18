import { apiRequest } from '../../../lib/api-client'
import type { Client, CreateClientInput } from '../types/client'

export async function getClients() {
  return (await apiRequest<Client[]>('/clients')) ?? []
}

export async function createClient(input: CreateClientInput) {
  const client = await apiRequest<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  if (!client) {
    throw new Error('A API não retornou o cliente cadastrado.')
  }

  return client
}
