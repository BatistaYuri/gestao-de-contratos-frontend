import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { createClient } from '../api/clientsApi'
import type { Client } from '../types/client'

interface ClientFormProps {
  onClientCreated: (client: Client) => void
}

export function ClientForm({ onClientCreated }: ClientFormProps) {
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const trimmedName = name.trim()
    const trimmedDocument = document.trim()

    if (!trimmedName || !trimmedDocument) {
      setIsError(true)
      setMessage('Informe o nome e o documento.')
      return
    }

    setIsSubmitting(true)

    try {
      const client = await createClient({
        name: trimmedName,
        document: trimmedDocument,
      })
      onClientCreated(client)
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
          required
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar cliente'}
      </button>

      {message && (
        <p
          className={isError ? 'form-message error' : 'form-message success'}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </form>
  )
}
