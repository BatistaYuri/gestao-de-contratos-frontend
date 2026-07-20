import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { updateClient } from '../api/clientsApi'
import type { Client } from '../types/client'
import { Modal } from '../../../components/Modal'

interface EditClientModalProps {
  client: Client
  onClose: () => void
  onUpdated: (client: Client) => void
  onNotFound: () => void | Promise<void>
}

function issueFor(error: ApiError, field: 'name' | 'document') {
  return error.issues.find((issue) => {
    const path = Array.isArray(issue.path) ? issue.path.join('.') : issue.path
    return path?.split('.').at(-1) === field
  })?.message
}

export function EditClientModal({ client, onClose, onUpdated, onNotFound }: EditClientModalProps) {
  const [name, setName] = useState(client.name)
  const [document, setDocument] = useState(client.document)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; document?: string }>({})
  const [message, setMessage] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const normalizedName = name.trim()
    const normalizedDocument = document.replace(/\D/g, '')
    const errors = {
      name: normalizedName.length < 2 ? 'O nome deve ter pelo menos dois caracteres.' : undefined,
      document: normalizedDocument.length === 0 ? 'Informe um documento com pelo menos um número.' : undefined,
    }
    setFieldErrors(errors)
    setMessage('')
    if (errors.name || errors.document) return

    setIsSubmitting(true)
    try {
      const updated = await updateClient(client.id, { name: normalizedName, document: normalizedDocument })
      onUpdated(updated)
      setMessage('Cliente atualizado com sucesso.')
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setMessage('Este cliente não existe mais. A lista foi atualizada.')
        await onNotFound()
      } else if (error instanceof ApiError && error.status === 409) {
        setFieldErrors((current) => ({ ...current, document: 'Este documento já pertence a outro cliente.' }))
      } else if (error instanceof ApiError && error.status === 400) {
        setFieldErrors({
          name: issueFor(error, 'name'),
          document: issueFor(error, 'document'),
        })
        setMessage(error.issues.length ? '' : 'Revise os dados informados.')
      } else {
        setMessage(error instanceof ApiError ? error.message : 'Não foi possível atualizar o cliente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Editar cliente" onClose={onClose}>
      <form className="client-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="edit-client-name">Nome</label>
          <input id="edit-client-name" value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'edit-client-name-error' : undefined} />
          {fieldErrors.name && <p id="edit-client-name-error" className="form-message error">{fieldErrors.name}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="edit-client-document">Documento</label>
          <input id="edit-client-document" value={document} onChange={(event) => setDocument(event.target.value)} disabled={isSubmitting} inputMode="numeric" aria-invalid={Boolean(fieldErrors.document)} aria-describedby={fieldErrors.document ? 'edit-client-document-error' : undefined} />
          {fieldErrors.document && <p id="edit-client-document-error" className="form-message error">{fieldErrors.document}</p>}
        </div>
        {message && <p className="form-message error" role="alert">{message}</p>}
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </form>
    </Modal>
  )
}
