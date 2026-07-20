import { useId } from 'react'

interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="modal-header">
          <h2 id={titleId}>Confirmar ação</h2>
        </div>
        <p id={descriptionId}>{message}</p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel} autoFocus>
            Cancelar
          </button>
          <button type="button" onClick={onConfirm}>
            OK
          </button>
        </div>
      </section>
    </div>
  )
}
