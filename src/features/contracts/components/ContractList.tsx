import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { approveContract, closeContract, submitContract } from '../api/contractsApi'
import { contractTypeLabels } from '../presentation'
import { ContractStatusBadge } from './ContractStatusBadge'
import type { Contract } from '../types/contract'
import { ActionMenu } from '../../../components/ActionMenu'
import { ConfirmModal } from '../../../components/ConfirmModal'

interface Props {
  contracts: Contract[]; isLoading: boolean; errorMessage: string
  onEdit: (contract: Contract) => void; onDelete: (contract: Contract) => void
  onHistory: (contract: Contract) => void; onReject: (contract: Contract) => void
  onChanged: () => void | Promise<void>
}
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function ContractList({ contracts, isLoading, errorMessage, onEdit, onDelete, onHistory, onReject, onChanged }: Props) {
  const [processingId, setProcessingId] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    contract: Contract
    action: 'submit' | 'approve' | 'close'
  } | null>(null)

  async function run(contract: Contract, action: 'submit' | 'approve' | 'close') {
    setProcessingId(contract.id); setMessage('')
    try {
      if (action === 'submit') await submitContract(contract.id)
      if (action === 'approve') await approveContract(contract.id)
      if (action === 'close') await closeContract(contract.id)
      await onChanged(); setIsError(false); setMessage('Contrato atualizado com sucesso.')
    } catch (error) {
      setIsError(true)
      if (error instanceof ApiError && error.status === 409) {
        await onChanged(); setMessage('O estado do contrato já foi alterado em outra sessão. A lista foi atualizada.')
      } else setMessage(error instanceof ApiError ? error.message : 'Não foi possível atualizar o contrato.')
    } finally { setProcessingId('') }
  }

  if (isLoading) return <p>Carregando contratos...</p>
  if (errorMessage) return <p className="form-message error" role="alert">{errorMessage}</p>
  if (contracts.length === 0) return <p>Nenhum contrato encontrado.</p>
  const prompts = { submit: 'enviar para aprovação', approve: 'aprovar', close: 'encerrar' }

  return <>{message && <p className={`form-message ${isError ? 'error' : 'success'}`} role={isError ? 'alert' : 'status'}>{message}</p>}<div className="table-wrapper"><table><thead><tr><th>Número</th><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Vencimento</th><th>Vigência</th><th>Aprovação</th><th className="actions-column">Ações</th></tr></thead><tbody>
    {contracts.map((contract) => { const editable = contract.approvalStatus === 'DRAFT' || contract.approvalStatus === 'REJECTED'; const busy = Boolean(processingId); return <tr key={contract.id}><td data-label="Número">{contract.number}</td><td data-label="Cliente">{contract.client.name}</td><td data-label="Tipo">{contractTypeLabels[contract.type]}</td><td data-label="Valor"><span>{money.format(Number(contract.value))}</span><small className="financial-details">Subtotal {money.format(Number(contract.subtotal))}<br />Desconto {money.format(Number(contract.discount))}<br />Taxas {money.format(Number(contract.additionalFees))}</small><details className="contract-items-summary"><summary>{contract.items.length} {contract.items.length === 1 ? 'item' : 'itens'}</summary><ul>{contract.items.map((item, index) => <li key={item.id ?? index}>{item.description}: {item.quantity} × {money.format(Number(item.unitPrice))}</li>)}</ul></details></td><td data-label="Vencimento">{date.format(new Date(contract.dueDate))}</td><td data-label="Vigência"><ContractStatusBadge kind="term" status={contract.status} /></td><td data-label="Aprovação"><ContractStatusBadge kind="approval" status={contract.approvalStatus} /></td><td className="actions-column" data-label="Ações"><ActionMenu label={`Abrir ações do contrato ${contract.number}`}>
      {editable && <><button type="button" onClick={() => onEdit(contract)} disabled={busy}>Editar</button><button type="button" onClick={() => setConfirmation({ contract, action: 'submit' })} disabled={busy}>{processingId === contract.id ? 'Processando...' : 'Enviar para aprovação'}</button></>}
      {contract.approvalStatus === 'PENDING' && <><button type="button" onClick={() => setConfirmation({ contract, action: 'approve' })} disabled={busy}>{processingId === contract.id ? 'Processando...' : 'Aprovar'}</button><button type="button" className="danger-menu-item" onClick={() => onReject(contract)} disabled={busy}>Rejeitar</button></>}
      {contract.approvalStatus === 'APPROVED' && contract.status !== 'CLOSED' && <button type="button" onClick={() => setConfirmation({ contract, action: 'close' })} disabled={busy}>{processingId === contract.id ? 'Processando...' : 'Encerrar'}</button>}
      <button type="button" onClick={() => onHistory(contract)} disabled={busy}>Ver histórico</button>
      <button type="button" className="danger-menu-item" onClick={() => onDelete(contract)} disabled={busy}>Excluir</button>
    </ActionMenu></td></tr> })}
  </tbody></table></div>{confirmation && <ConfirmModal
    message={`Deseja ${prompts[confirmation.action]} o contrato ${confirmation.contract.number}?`}
    onCancel={() => setConfirmation(null)}
    onConfirm={() => {
      const pending = confirmation
      setConfirmation(null)
      void run(pending.contract, pending.action)
    }}
  />}</>
}
