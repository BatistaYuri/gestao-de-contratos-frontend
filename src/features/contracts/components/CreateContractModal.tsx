import type { Client } from '../../clients/types/client'
import { ContractForm } from './ContractForm'
import { Modal } from '../../../components/Modal'

interface CreateContractModalProps {
  clients: Client[]
  onClose: () => void
  onCreated: () => void | Promise<void>
}

export function CreateContractModal({
  clients,
  onClose,
  onCreated,
}: CreateContractModalProps) {
  return (
    <Modal title="Novo contrato" onClose={onClose}>
      <ContractForm
        mode="create"
        clients={clients}
        onSaved={async () => {
          await onCreated()
          onClose()
        }}
        onCancel={onClose}
      />
    </Modal>
  )
}
