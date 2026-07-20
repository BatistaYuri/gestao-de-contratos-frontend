import { apiRequest } from '../../../lib/api-client'
import type { Client, CreateClientInput, UpdateClientInput } from '../types/client'
import type { PaginatedResponse, PaginationQuery } from '../../../types/pagination'

export async function getClients({ page, pageSize }: PaginationQuery) {
  return apiRequest<PaginatedResponse<Client>>(`/clients?page=${page}&pageSize=${pageSize}`)
}

export async function getAllClients() {
  const firstPage = await getClients({ page: 1, pageSize: 100 })
  if (!firstPage) return []
  if (firstPage.pagination.totalPages <= 1) return firstPage.data

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.totalPages - 1 }, (_, index) =>
      getClients({ page: index + 2, pageSize: 100 }),
    ),
  )
  return [firstPage, ...remainingPages]
    .flatMap((response) => response?.data ?? [])
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
