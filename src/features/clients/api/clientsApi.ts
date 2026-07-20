import { apiRequest } from '../../../lib/api-client'
import type { Client, CreateClientInput, UpdateClientInput } from '../types/client'

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

export async function getClient(id: string) {
  const client = await apiRequest<Client>(`/clients/${id}`)
  if (!client) throw new Error('A API não retornou o cliente.')
  return client
}

export async function updateClient(id: string, input: UpdateClientInput) {
  const client = await apiRequest<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  if (!client) throw new Error('A API não retornou o cliente atualizado.')
  return client
}

export async function deleteClient(id: string) {
  await apiRequest<void>(`/clients/${id}`, { method: 'DELETE' })
}
