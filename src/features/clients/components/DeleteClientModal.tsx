import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { deleteClient } from '../api/clientsApi'
import type { Client } from '../types/client'
import { Modal } from '../../../components/Modal'

interface DeleteClientModalProps {
  client: Client
  onClose: () => void
  onDeleted: (id: string) => void
  onNotFound: () => void | Promise<void>
}

export function DeleteClientModal({ client, onClose, onDeleted, onNotFound }: DeleteClientModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDelete() {
    if (isDeleting) return
    setIsDeleting(true)
    setErrorMessage('')
    try {
      await deleteClient(client.id)
      onDeleted(client.id)
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage('Este cliente possui contratos vinculados. Exclua os contratos antes de excluir o cliente.')
      } else if (error instanceof ApiError && error.status === 404) {
        setErrorMessage('Este cliente não existe mais. A lista foi atualizada.')
        await onNotFound()
      } else {
        setErrorMessage(error instanceof ApiError ? error.message : 'Não foi possível excluir o cliente.')
      }
      setIsDeleting(false)
    }
  }

  return (
    <Modal title="Excluir cliente" onClose={onClose}>
      <p>Deseja excluir <strong>{client.name}</strong>? O cliente deixará de aparecer nas consultas normais.</p>
      {errorMessage && <p className="form-message error" role="alert">{errorMessage}</p>}
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose} disabled={isDeleting}>Cancelar</button>
        <button type="button" className="danger-button" onClick={() => void handleDelete()} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir cliente'}</button>
      </div>
    </Modal>
  )
}
