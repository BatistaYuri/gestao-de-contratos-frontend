export interface Client {
  id: string
  name: string
  document: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientInput {
  name: string
  document: string
}


export type UpdateClientInput = CreateClientInput
