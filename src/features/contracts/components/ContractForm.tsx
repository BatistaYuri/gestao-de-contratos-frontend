import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import type { Client } from '../../clients/types/client'
import { createContract } from '../api/contractsApi'

interface ContractFormProps {
  clients: Client[]
  onContractCreated: () => void | Promise<void>
}

export function ContractForm({ clients, onContractCreated }: ContractFormProps) {
  const [number, setNumber] = useState('')
  const [clientId, setClientId] = useState('')
  const [value, setValue] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const trimmedNumber = number.trim()
    const numericValue = Number(value)

    if (!trimmedNumber || !clientId || !value || !dueDate) {
      setIsError(true)
      setMessage('Preencha todos os campos do contrato.')
      return
    }

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setIsError(true)
      setMessage('Informe um valor maior que zero.')
      return
    }

    setIsSubmitting(true)

    try {
      await createContract({
        number: trimmedNumber,
        clientId,
        value: numericValue,
        dueDate,
      })
      await onContractCreated()
      setNumber('')
      setClientId('')
      setValue('')
      setDueDate('')
      setIsError(false)
      setMessage('Contrato cadastrado com sucesso.')
    } catch (error) {
      setIsError(true)
      if (error instanceof ApiError && error.status === 409) {
        setMessage('Já existe um contrato com este número.')
      } else if (error instanceof ApiError) {
        setMessage(error.message)
      } else {
        setMessage('Não foi possível conectar à API.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || clients.length === 0

  return (
    <form className="contract-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="contract-number">Número</label>
        <input
          id="contract-number"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          disabled={isDisabled}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="contract-client">Cliente</label>
        <select
          id="contract-client"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          disabled={isDisabled}
          required
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} — {client.document}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="contract-value">Valor</label>
        <input
          id="contract-value"
          type="number"
          min="0.01"
          step="0.01"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={isDisabled}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="contract-due-date">Vencimento</label>
        <input
          id="contract-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={isDisabled}
          required
        />
      </div>

      <button type="submit" disabled={isDisabled}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar contrato'}
      </button>

      {clients.length === 0 && (
        <p className="form-message">Cadastre um cliente antes do contrato.</p>
      )}

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
