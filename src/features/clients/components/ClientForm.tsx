import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { createClient } from '../api/clientsApi'
import type { Client } from '../types/client'

interface ClientFormProps {
  onClientCreated: (client: Client) => void | Promise<void>
  onCancel: () => void
}

export function ClientForm({ onClientCreated, onCancel }: ClientFormProps) {
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const trimmedName = name.trim()
    const normalizedDocument = document.replace(/\D/g, '')

    if (trimmedName.length < 2 || !normalizedDocument) {
      setIsError(true)
      setMessage('Informe um nome com ao menos dois caracteres e um documento com pelo menos um número.')
      return
    }

    setIsSubmitting(true)

    try {
      const client = await createClient({
        name: trimmedName,
        document: normalizedDocument,
      })
      await onClientCreated(client)
      setName('')
      setDocument('')
      setIsError(false)
      setMessage('Cliente cadastrado com sucesso.')
    } catch (error) {
      setIsError(true)
      if (error instanceof ApiError && error.status === 409) {
        setMessage('Já existe um cliente com este documento.')
      } else if (error instanceof ApiError) {
        setMessage(error.message)
      } else {
        setMessage('Não foi possível conectar à API.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="client-name">Nome</label>
        <input
          id="client-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="client-document">Documento</label>
        <input
          id="client-document"
          value={document}
          onChange={(event) => setDocument(event.target.value)}
          disabled={isSubmitting}
          inputMode="numeric"
          required
        />
      </div>

      {message && (
        <p
          className={isError ? 'form-message error' : 'form-message success'}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar cliente'}
        </button>
      </div>
    </form>
  )
}
