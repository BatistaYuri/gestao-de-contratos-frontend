import { useState, type SubmitEvent } from 'react'
import { Modal } from '../../../components/Modal'
import { ApiError } from '../../../lib/api-client'
import { rejectContract } from '../api/contractsApi'
import type { Contract } from '../types/contract'

export function RejectContractModal({ contract, onClose, onChanged, onConflict }: { contract: Contract; onClose: () => void; onChanged: () => void | Promise<void>; onConflict: () => void | Promise<void> }) {
  const [reason, setReason] = useState(''); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  async function submit(event: SubmitEvent) { event.preventDefault(); const trimmed = reason.trim(); if (!trimmed) { setError('Informe a justificativa da rejeição.'); return } setSubmitting(true); setError(''); try { await rejectContract(contract.id, trimmed); await onChanged(); onClose() } catch (caught) { if (caught instanceof ApiError && caught.status === 409) { await onConflict(); setError('O estado do contrato já foi alterado em outra sessão.') } else setError(caught instanceof ApiError ? caught.message : 'Não foi possível rejeitar o contrato.') } finally { setSubmitting(false) } }
  return <Modal title={`Rejeitar contrato ${contract.number}`} onClose={onClose}><form className="reject-form" onSubmit={submit} noValidate><div className="form-field"><label htmlFor="rejection-reason">Justificativa</label><textarea id="rejection-reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} disabled={submitting} required /></div>{error && <p className="form-message error" role="alert">{error}</p>}<div className="modal-actions"><button type="submit" className="danger-button" disabled={submitting}>{submitting ? 'Rejeitando...' : 'Confirmar rejeição'}</button><button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button></div></form></Modal>
}
