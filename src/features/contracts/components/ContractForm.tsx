import { type SubmitEvent, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import type { Client } from '../../clients/types/client'
import { createContract, updateContract } from '../api/contractsApi'
import {
  formatBRLCents,
  isValidMoney,
  isValidQuantity,
  itemTotalInCents,
  moneyToCents,
  normalizeDecimal,
} from '../utils/decimal'
import { contractTypeLabels } from '../presentation'
import type { Contract, ContractItem, ContractType } from '../types/contract'

interface CreateProps { mode: 'create'; clients: Client[]; onSaved: () => void | Promise<void>; onCancel: () => void }
interface EditProps { mode: 'edit'; clients: Client[]; contract: Contract; onSaved: () => void | Promise<void>; onCancel: () => void }
type Props = CreateProps | EditProps
type EditableItem = Pick<ContractItem, 'description' | 'quantity' | 'unitPrice'>
type ItemErrors = Partial<Record<keyof EditableItem, string>>

const contractTypes = Object.keys(contractTypeLabels) as ContractType[]
const emptyItem = (): EditableItem => ({ description: '', quantity: '1', unitPrice: '0.00' })

function validateItems(items: EditableItem[]) {
  return items.map((item): ItemErrors => ({
    ...(!item.description.trim() ? { description: 'Informe a descrição.' } : {}),
    ...(!isValidQuantity(item.quantity) ? { quantity: 'Use um valor maior que zero e até 3 casas decimais.' } : {}),
    ...(!isValidMoney(item.unitPrice) ? { unitPrice: 'Use um valor não negativo e até 2 casas decimais.' } : {}),
  }))
}

export function ContractForm(props: Props) {
  const { clients, mode, onSaved } = props
  const contract = mode === 'edit' ? props.contract : undefined
  const readOnly = Boolean(contract && !['DRAFT', 'REJECTED'].includes(contract.approvalStatus))
  const [number, setNumber] = useState(contract?.number ?? '')
  const [clientId, setClientId] = useState(contract?.client.id ?? '')
  const [type, setType] = useState<ContractType>(contract?.type ?? 'SERVICE')
  const [discount, setDiscount] = useState(contract?.discount ?? '0.00')
  const [additionalFees, setAdditionalFees] = useState(contract?.additionalFees ?? '0.00')
  const [dueDate, setDueDate] = useState(contract?.dueDate.slice(0, 10) ?? '')
  const [items, setItems] = useState<EditableItem[]>(() => contract?.items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice })) ?? [emptyItem()])
  const [itemErrors, setItemErrors] = useState<ItemErrors[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totals = useMemo(() => {
    const lineTotals = items.map((item) => itemTotalInCents(item.quantity, item.unitPrice))
    const subtotal = lineTotals.reduce<bigint>((sum, total) => sum + (total ?? 0n), 0n)
    const discountCents = isValidMoney(discount) ? moneyToCents(discount) : 0n
    const feesCents = isValidMoney(additionalFees) ? moneyToCents(additionalFees) : 0n
    return { lineTotals, subtotal, total: subtotal - discountCents + feesCents }
  }, [items, discount, additionalFees])

  function updateItem(index: number, field: keyof EditableItem, value: string) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
    setItemErrors((current) => current.map((errors, itemIndex) => itemIndex === index ? { ...errors, [field]: undefined } : errors))
  }

  function mapApiIssues(error: ApiError) {
    const next: ItemErrors[] = []
    for (const issue of error.issues) {
      const path = Array.isArray(issue.path) ? issue.path.join('.') : issue.path ?? ''
      const match = /^items\.(\d+)\.(description|quantity|unitPrice)$/.exec(path)
      if (match) {
        const index = Number(match[1]); const field = match[2] as keyof EditableItem
        next[index] = { ...next[index], [field]: issue.message ?? 'Valor inválido.' }
      }
    }
    if (next.length) setItemErrors(next)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setErrorMessage('')
    if (readOnly) return
    const errors = validateItems(items); setItemErrors(errors)
    if (!number.trim() || !clientId || !dueDate) return setErrorMessage('Preencha todos os campos obrigatórios do contrato.')
    if (items.length === 0) return setErrorMessage('Adicione ao menos um item ao contrato.')
    if (errors.some((entry) => Object.keys(entry).length)) return setErrorMessage('Corrija os itens destacados antes de salvar.')
    if (!isValidMoney(discount) || !isValidMoney(additionalFees)) return setErrorMessage('Desconto e taxas devem ser valores não negativos com até duas casas decimais.')
    if (totals.total < 0n) return setErrorMessage('O desconto não pode tornar o valor total negativo.')

    setIsSubmitting(true)
    try {
      const input = {
        number: number.trim(), clientId, type, dueDate, currency: 'BRL' as const,
        discount: normalizeDecimal(discount), additionalFees: normalizeDecimal(additionalFees),
        items: items.map((item) => ({ description: item.description.trim(), quantity: normalizeDecimal(item.quantity), unitPrice: normalizeDecimal(item.unitPrice) })),
      }
      if (mode === 'edit') await updateContract(props.contract.id, input)
      else await createContract(input)
      await onSaved()
    } catch (error) {
      if (error instanceof ApiError) mapApiIssues(error)
      if (error instanceof ApiError && error.status === 409) setErrorMessage(mode === 'edit' ? 'O contrato mudou e não pode mais ser editado. Atualize a tela.' : 'Já existe um contrato com este número.')
      else setErrorMessage(error instanceof ApiError ? error.message : 'Não foi possível conectar à API.')
    } finally { setIsSubmitting(false) }
  }

  const disabled = isSubmitting || clients.length === 0 || readOnly
  return <form className="contract-form" onSubmit={handleSubmit} noValidate>
    {readOnly && <p className="form-message contract-form-wide">Este contrato está em aprovação ou já foi aprovado. Itens e valores estão disponíveis somente para leitura.</p>}
    <div className="form-field"><label htmlFor="contract-number">Número</label><input id="contract-number" value={number} onChange={(e) => setNumber(e.target.value)} disabled={disabled} required /></div>
    <div className="form-field"><label htmlFor="contract-client">Cliente</label><select id="contract-client" value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={disabled} required><option value="">Selecione um cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} — {client.document}</option>)}</select></div>
    <div className="form-field"><label htmlFor="contract-type">Tipo</label><select id="contract-type" value={type} onChange={(e) => setType(e.target.value as ContractType)} disabled={disabled}>{contractTypes.map((option) => <option key={option} value={option}>{contractTypeLabels[option]}</option>)}</select></div>
    <div className="form-field"><label htmlFor="contract-due-date">Vencimento</label><input id="contract-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={disabled} required /></div>

    <fieldset className="contract-items" disabled={disabled}><legend>Itens do contrato</legend>
      {items.map((item, index) => <div className="contract-item" key={index}>
        <div className="form-field item-description"><label htmlFor={`item-${index}-description`}>Descrição</label><input id={`item-${index}-description`} value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} aria-invalid={Boolean(itemErrors[index]?.description)} />{itemErrors[index]?.description && <small className="field-error">{itemErrors[index].description}</small>}</div>
        <div className="form-field"><label htmlFor={`item-${index}-quantity`}>Quantidade</label><input id={`item-${index}-quantity`} inputMode="decimal" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} aria-invalid={Boolean(itemErrors[index]?.quantity)} />{itemErrors[index]?.quantity && <small className="field-error">{itemErrors[index].quantity}</small>}</div>
        <div className="form-field"><label htmlFor={`item-${index}-price`}>Preço unitário</label><input id={`item-${index}-price`} inputMode="decimal" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} aria-invalid={Boolean(itemErrors[index]?.unitPrice)} />{itemErrors[index]?.unitPrice && <small className="field-error">{itemErrors[index].unitPrice}</small>}</div>
        <div className="form-field"><label>Total estimado</label><output>{totals.lineTotals[index] === null ? '—' : formatBRLCents(totals.lineTotals[index]!)}</output></div>
        {!readOnly && <button type="button" className="danger-button remove-item" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>}
      </div>)}
      {!readOnly && <button type="button" className="secondary-button add-item" onClick={() => setItems((current) => [...current, emptyItem()])}>Adicionar item</button>}
    </fieldset>

    <div className="form-field"><label htmlFor="contract-currency">Moeda</label><input id="contract-currency" value="BRL" disabled readOnly /></div>
    <div className="form-field"><label htmlFor="contract-discount">Desconto</label><input id="contract-discount" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} disabled={disabled} /></div>
    <div className="form-field"><label htmlFor="contract-fees">Taxas adicionais</label><input id="contract-fees" inputMode="decimal" value={additionalFees} onChange={(e) => setAdditionalFees(e.target.value)} disabled={disabled} /></div>
    <dl className="financial-summary"><div><dt>Subtotal estimado</dt><dd>{formatBRLCents(totals.subtotal)}</dd></div><div><dt>Desconto</dt><dd>− {isValidMoney(discount) ? formatBRLCents(moneyToCents(discount)) : '—'}</dd></div><div><dt>Taxas</dt><dd>+ {isValidMoney(additionalFees) ? formatBRLCents(moneyToCents(additionalFees)) : '—'}</dd></div><div className="financial-total"><dt>Total estimado</dt><dd>{formatBRLCents(totals.total)}</dd></div></dl>
    <div className="form-actions">{!readOnly && <button type="submit" disabled={disabled}>{isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Cadastrar contrato'}</button>}<button type="button" className="secondary-button" onClick={props.onCancel} disabled={isSubmitting}>{readOnly ? 'Fechar' : 'Cancelar'}</button></div>
    {clients.length === 0 && <p className="form-message contract-form-wide">Cadastre um cliente antes do contrato.</p>}{errorMessage && <p className="form-message error contract-form-wide" role="alert">{errorMessage}</p>}
  </form>
}
