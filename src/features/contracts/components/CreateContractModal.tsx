import type { Client } from '../../clients/types/client'
import { ContractForm } from './ContractForm'
import { ContractModal } from './ContractModal'

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
    <ContractModal title="Novo contrato" onClose={onClose}>
      <ContractForm
        mode="create"
        clients={clients}
        onSaved={async () => {
          await onCreated()
          onClose()
        }}
        onCancel={onClose}
      />
    </ContractModal>
  )
}
