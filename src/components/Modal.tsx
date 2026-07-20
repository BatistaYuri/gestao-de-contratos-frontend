import { useId, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId()

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            Fechar
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
