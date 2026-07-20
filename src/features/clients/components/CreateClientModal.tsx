import type { Client } from '../types/client'
import { Modal } from '../../../components/Modal'
import { ClientForm } from './ClientForm'

interface CreateClientModalProps {
  onClose: () => void
  onCreated: (client: Client) => void | Promise<void>
}

export function CreateClientModal({ onClose, onCreated }: CreateClientModalProps) {
  return (
    <Modal title="Novo cliente" onClose={onClose}>
      <ClientForm
        onCancel={onClose}
        onClientCreated={async (client) => {
          await onCreated(client)
          onClose()
        }}
      />
    </Modal>
  )
}
