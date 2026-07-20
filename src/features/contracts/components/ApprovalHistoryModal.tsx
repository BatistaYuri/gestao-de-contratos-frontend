import { useEffect, useState } from 'react'
import { Modal } from '../../../components/Modal'
import { getApprovalHistory } from '../api/contractsApi'
import { approvalStatusLabels, contractTypeLabels } from '../presentation'
import type { ApprovalHistoryEntry, Contract } from '../types/contract'

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ApprovalHistoryModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { getApprovalHistory(contract.id).then(setHistory).catch(() => setError('Não foi possível carregar o histórico.')).finally(() => setLoading(false)) }, [contract.id])

  return <Modal title={`Histórico — ${contract.number}`} onClose={onClose}>
    {loading && <p>Carregando histórico...</p>}
    {error && <p className="form-message error" role="alert">{error}</p>}
    {!loading && !error && history.length === 0 && <p>Nenhuma submissão registrada.</p>}
    <ol className="history-list">{history.map((entry) => <li key={entry.id ?? entry.version}>
      <h3>Versão {entry.version} — {approvalStatusLabels[entry.status]}</h3>
      <dl className="history-details"><div><dt>Enviado</dt><dd>{dateTime.format(new Date(entry.submittedAt))}</dd></div><div><dt>Decisão</dt><dd>{entry.decidedAt ? dateTime.format(new Date(entry.decidedAt)) : 'Pendente'}</dd></div><div><dt>Tipo</dt><dd>{contractTypeLabels[entry.snapshot.type]}</dd></div><div><dt>Vencimento</dt><dd>{entry.snapshot.dueDate.split('-').reverse().join('/')}</dd></div><div><dt>Subtotal</dt><dd>{money.format(Number(entry.snapshot.subtotal))}</dd></div><div><dt>Valor registrado</dt><dd>{money.format(Number(entry.snapshot.value))}</dd></div></dl>
      <details><summary>Itens desta versão ({entry.snapshot.items.length})</summary><ul>{entry.snapshot.items.map((item, index) => <li key={`${entry.version}-${index}`}>{item.description}: {item.quantity} × {money.format(Number(item.unitPrice))}</li>)}</ul></details>
      {entry.rejectionReason && <p><strong>Justificativa:</strong> {entry.rejectionReason}</p>}
    </li>)}</ol>
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Fechar</button></div>
  </Modal>
}
