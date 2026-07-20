import { type SubmitEvent, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import type { Client } from '../../clients/types/client'
import { createContract, updateContract } from '../api/contractsApi'
import { contractTypeLabels } from '../presentation'
import type { Contract, ContractType } from '../types/contract'

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
const contractTypes = Object.keys(contractTypeLabels) as ContractType[]
const decimalPattern = /^\d+(?:\.\d{1,2})?$/

export function ContractForm(props: ContractFormProps) {
  const { clients, mode, onSaved } = props
  const contract = mode === 'edit' ? props.contract : undefined
  const [number, setNumber] = useState(contract?.number ?? '')
  const [clientId, setClientId] = useState(contract?.client.id ?? '')
  const [type, setType] = useState<ContractType>(contract?.type ?? 'SERVICE')
  const [value, setValue] = useState(contract ? String(contract.subtotal) : '')
  const [discount, setDiscount] = useState(contract?.discount ?? '0.00')
  const [additionalFees, setAdditionalFees] = useState(
    contract?.additionalFees ?? '0.00',
  )
  const [dueDate, setDueDate] = useState(contract?.dueDate.slice(0, 10) ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    const trimmedNumber = number.trim()

    if (!trimmedNumber || !clientId || !value || !dueDate) {
      setErrorMessage('Preencha todos os campos obrigatórios do contrato.')
      return
    }
    if (!decimalPattern.test(value) || Number(value) <= 0) {
      setErrorMessage('Informe um valor maior que zero, com até duas casas decimais.')
      return
    }
    if (
      !decimalPattern.test(discount) ||
      !decimalPattern.test(additionalFees) ||
      Number(discount) < 0 ||
      Number(additionalFees) < 0
    ) {
      setErrorMessage('Desconto e taxas devem ser valores não negativos com até duas casas decimais.')
      return
    }

    setIsSubmitting(true)
    try {
      const input = {
        number: trimmedNumber,
        clientId,
        type,
        dueDate,
        currency: 'BRL' as const,
        discount,
        additionalFees,
        items: [{
          description: 'Valor base do contrato',
          quantity: '1',
          unitPrice: value,
        }],
      }

      if (mode === 'edit') await updateContract(props.contract.id, input)
      else await createContract(input)
      await onSaved()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage(
          mode === 'edit'
            ? 'O contrato mudou e não pode mais ser editado. Atualize a tela.'
            : 'Já existe um contrato com este número.',
        )
      } else if (error instanceof ApiError) setErrorMessage(error.message)
      else setErrorMessage('Não foi possível conectar à API.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || clients.length === 0

  return (
    <form className="contract-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="contract-number">Número</label>
        <input id="contract-number" value={number} onChange={(event) => setNumber(event.target.value)} disabled={isDisabled} required />
      </div>
      <div className="form-field">
        <label htmlFor="contract-client">Cliente</label>
        <select id="contract-client" value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={isDisabled} required>
          <option value="">Selecione um cliente</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name} — {client.document}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="contract-type">Tipo</label>
        <select id="contract-type" value={type} onChange={(event) => setType(event.target.value as ContractType)} disabled={isDisabled} required>
          {contractTypes.map((option) => <option key={option} value={option}>{contractTypeLabels[option]}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="contract-currency">Moeda</label>
        <input id="contract-currency" value="BRL" disabled readOnly />
      </div>
      <div className="form-field">
        <label htmlFor="contract-value">Valor base</label>
        <input id="contract-value" type="number" min="0.01" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} disabled={isDisabled} required />
      </div>
      <div className="form-field">
        <label htmlFor="contract-discount">Desconto</label>
        <input id="contract-discount" type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} disabled={isDisabled} required />
      </div>
      <div className="form-field">
        <label htmlFor="contract-fees">Taxas adicionais</label>
        <input id="contract-fees" type="number" min="0" step="0.01" value={additionalFees} onChange={(event) => setAdditionalFees(event.target.value)} disabled={isDisabled} required />
      </div>
      <div className="form-field">
        <label htmlFor="contract-due-date">Vencimento</label>
        <input id="contract-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={isDisabled} required />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={isDisabled}>{isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Cadastrar contrato'}</button>
        <button type="button" className="secondary-button" onClick={props.onCancel} disabled={isSubmitting}>Cancelar</button>
      </div>
      {clients.length === 0 && <p className="form-message">Cadastre um cliente antes do contrato.</p>}
      {errorMessage && <p className="form-message error" role="alert">{errorMessage}</p>}
    </form>
  )
}
