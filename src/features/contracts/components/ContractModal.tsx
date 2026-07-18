import type { ReactNode } from 'react'

interface ContractModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function ContractModal({
  title,
  onClose,
  children,
}: ContractModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-modal-title"
      >
        <div className="modal-header">
          <h2 id="contract-modal-title">{title}</h2>
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
