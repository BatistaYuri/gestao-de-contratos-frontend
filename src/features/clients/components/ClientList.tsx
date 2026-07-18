import type { Client } from '../types/client'

interface ClientListProps {
  clients: Client[]
  isLoading: boolean
  errorMessage: string
}

export function ClientList({ clients, isLoading, errorMessage }: ClientListProps) {
  if (isLoading) return <p>Carregando clientes...</p>
  if (errorMessage) {
    return (
      <p className="form-message error" role="alert">
        {errorMessage}
      </p>
    )
  }
  if (clients.length === 0) return <p>Nenhum cliente cadastrado.</p>

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Documento</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.document}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
