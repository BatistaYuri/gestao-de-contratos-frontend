import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { deleteContract } from '../api/contractsApi'
import type { Contract } from '../types/contract'
import { ContractModal } from './ContractModal'

interface DeleteContractModalProps {
  contract: Contract
  onClose: () => void
  onDeleted: () => void | Promise<void>
}

export function DeleteContractModal({
  contract,
  onClose,
  onDeleted,
}: DeleteContractModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDelete() {
    setIsDeleting(true)
    setErrorMessage('')

    try {
      await deleteContract(contract.id)
      await onDeleted()
      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível excluir o contrato.',
      )
      setIsDeleting(false)
    }
  }

  return (
    <ContractModal title="Excluir contrato" onClose={onClose}>
      <p>
        Deseja excluir o contrato <strong>{contract.number}</strong>?
      </p>
      {errorMessage && (
        <p className="form-message error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="modal-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir contrato'}
        </button>
      </div>
    </ContractModal>
  )
}
