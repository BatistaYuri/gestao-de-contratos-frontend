import type { Client } from '../../clients/types/client'
import type { Contract } from '../types/contract'
import { ContractForm } from './ContractForm'
import { ContractModal } from './ContractModal'

interface EditContractModalProps {
  clients: Client[]
  contract: Contract
  onClose: () => void
  onUpdated: () => void | Promise<void>
}

export function EditContractModal({
  clients,
  contract,
  onClose,
  onUpdated,
}: EditContractModalProps) {
  return (
    <ContractModal title="Editar contrato" onClose={onClose}>
      <ContractForm
        mode="edit"
        clients={clients}
        contract={contract}
        onSaved={async () => {
          await onUpdated()
          onClose()
        }}
        onCancel={onClose}
      />
    </ContractModal>
  )
}
