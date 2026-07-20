import type { Client } from '../types/client'

interface ClientListProps {
  clients: Client[]
  isLoading: boolean
  errorMessage: string
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientList({ clients, isLoading, errorMessage, onEdit, onDelete }: ClientListProps) {
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
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.document}</td>
              <td>
                <div className="table-actions">
                  <button type="button" className="secondary-button" onClick={() => onEdit(client)}>Editar</button>
                  <button type="button" className="danger-button" onClick={() => onDelete(client)}>Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
