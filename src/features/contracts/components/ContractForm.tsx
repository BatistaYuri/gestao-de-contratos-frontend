import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import type { Client } from '../../clients/types/client'
import { createContract, updateContract } from '../api/contractsApi'
import type { Contract } from '../types/contract'

interface CreateContractFormProps {
  mode: 'create'
  clients: Client[]
  onSaved: () => void | Promise<void>
  onCancel: () => void
}

interface EditContractFormProps {
  mode: 'edit'
  clients: Client[]
  contract: Contract
  onSaved: () => void | Promise<void>
  onCancel: () => void
}

type ContractFormProps = CreateContractFormProps | EditContractFormProps

export function ContractForm(props: ContractFormProps) {
  const { clients, mode, onSaved } = props
  const contract = mode === 'edit' ? props.contract : undefined
  const [number, setNumber] = useState(contract?.number ?? '')
  const [clientId, setClientId] = useState(contract?.client.id ?? '')
  const [value, setValue] = useState(contract ? String(contract.value) : '')
  const [dueDate, setDueDate] = useState(contract?.dueDate.slice(0, 10) ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    const trimmedNumber = number.trim()
    const numericValue = Number(value)

    if (!trimmedNumber || !clientId || !value || !dueDate) {
      setErrorMessage('Preencha todos os campos do contrato.')
      return
    }

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setErrorMessage('Informe um valor maior que zero.')
      return
    }

    setIsSubmitting(true)

    try {
      const input = {
        number: trimmedNumber,
        clientId,
        value: numericValue,
        dueDate,
      }

      if (mode === 'edit') {
        await updateContract(props.contract.id, input)
      } else {
        await createContract(input)
      }
      await onSaved()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage('Já existe um contrato com este número.')
      } else if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível conectar à API.')
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

      <div className="form-actions">
        <button type="submit" disabled={isDisabled}>
          {isSubmitting
            ? 'Salvando...'
            : mode === 'edit'
              ? 'Salvar alterações'
              : 'Cadastrar contrato'}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={props.onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
      </div>

      {clients.length === 0 && (
        <p className="form-message">Cadastre um cliente antes do contrato.</p>
      )}

      {errorMessage && (
        <p className="form-message error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
