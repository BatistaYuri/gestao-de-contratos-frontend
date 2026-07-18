export interface Client {
  id: string
  name: string
  document: string
}

export interface CreateClientInput {
  name: string
  document: string
}
